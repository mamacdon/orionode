/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global __dirname Buffer console process require*/
/*jslint regexp:false laxbreak:true*/

// compat shim for v0.6-0.8 differences
require('../lib/compat');

var child_process = require('child_process');
var constants = require('constants');
var fs = require('fs');
var pfs = require('promised-io/fs');
var path = require('path');
var PromisedIO = require('promised-io');
var sax = require('sax'), strictSax = true;

var Deferred = PromisedIO.Deferred;

var BUNDLE_WEB_FOLDER = './web/';
var IS_WINDOWS = process.platform === 'win32';

var pathToNode = process.execPath;
var pathToRjs = path.resolve(__dirname, 'r.js');
var pathToBuildFile = path.resolve(__dirname, process.argv[2] || './orion.build.js');
var pathToOrionClientBundlesFolder = path.resolve(path.dirname(pathToBuildFile), '../lib/orion.client/bundles/');
var pathToOrionodeClient = path.resolve(path.dirname(pathToBuildFile), '../lib/orionode.client/');
var pathToDojo = path.resolve(path.dirname(pathToBuildFile), '../lib/dojo/');
var pathToTempDir = path.resolve(__dirname, '.temp');

/**
 * Pass varargs to get numbered parameters, or a single object for named parameters.
 * eg. format('${0} dollars and ${1} cents', 3, 50);
 * eg. format('${dollars} dollars and ${cents} cents', {dollars:3, cents:50});
 * @param {String} str String to format.
 * @param {varags|Object} arguments 
 */
function format(str/*, args..*/) {
	var maybeObject = arguments[1];
	var args = (maybeObject !== null && typeof maybeObject === 'object') ? maybeObject : Array.prototype.slice.call(arguments, 1);
	return str.replace(/\$\{([^}]+)\}/g, function(match, param) {
		return args[param];
	});
}

/**
 * @param {Object} [options]
 * @returns {Deferred} Doesn't reject (but perhaps it should -- TODO)
 */
function execCommand(cmd, options) {
	options = options || {};
	var d = new Deferred();
	console.log(cmd);
	child_process.exec(cmd, {
		cwd: options.cwd || pathToTempDir,
		stdio: options.stdio || 'inherit'
	}, function (error, stdout, stderr) {
		if (error) {
			console.log(error.stack || error);
		}
		if (stdout) { console.log(stdout); }
		d.resolve();
	});
	return d;
}

function spawn(cmd, args, options) {
	options = options || {};
	var d = new Deferred();
	console.log(cmd + ' ' + args.join(' ') + '');
	var child = child_process.spawn(cmd, args, {
		cwd: options.cwd || pathToTempDir,
		stdio: [process.stdin, process.stdout, process.stderr]
	});
	child.on('exit', function(code) {
		d.resolve();
	});
	return d;
}

function getCopyCmd(src, dest) {
	return IS_WINDOWS ? format('xcopy /e /h /q /y "${0}" "${1}"', src, dest) : format("cp -R ${0}/* ${1}", src, dest);
}

/**
 * Filter function for Array.prototype.filter that produces an array with unique strictly-equal elements.
 */
function unique(bundle, i, array) {
	return array.every(function(bundle2, j) {
		if (bundle === bundle2) {
			return i >= j;
		}
		return true;
	});
}

/**
 * Workaround for pfs.readFile() always returning Buffer
 * @see https://github.com/kriszyp/promised-io/issues/24
 */
function debuf(maybeBuf) {
	return Buffer.isBuffer(maybeBuf) ? maybeBuf.toString('utf8') : maybeBuf;
}

function build(optimizeElements) {
	var optimizes = optimizeElements.map(function(optimize) {
		var pageDir = optimize.attributes.pageDir;
		var name = optimize.attributes.name;
		return {
			pageDir: pageDir,
			name: name,
			bundle: optimize.attributes.bundle,
			pageDirPath: path.join(pathToTempDir, pageDir),
			minifiedFilePath: path.join(pathToTempDir, pageDir, 'built-' + name) + '.js',
			htmlFilePath: path.join(pathToTempDir, pageDir, name + '.html')
		};
	});

	var skipCopy = false, skipOptimize = false, skipUpdateHtml = false, skipCopyBack = false;
	/*
	 * Build steps begin here
	 */
	return pfs.mkdir(pathToTempDir).then(function() {
		return new Deferred().resolve();
	}, function(err) {
		if (err && err.code !== 'EEXIST') {
			console.log(err.stack || err);
		}
		return new Deferred().resolve();
	}).then(function() {
		// Copy all required files into the .temp directory for doing the build
		if (skipCopy) { return new Deferred().resolve(); }
		console.log('-------------------------------------------------------\n' + 'Copying client code to ' + pathToTempDir + '...\n');

		// Get the list of bundles from the orion.client lib:
		var bundles = [];
		return pfs.readdir(pathToOrionClientBundlesFolder).then(function(contents) {
			return PromisedIO.all(contents.map(function(item) {
				return pfs.stat(path.join(pathToOrionClientBundlesFolder, item)).then(function(stats) {
					if (stats.isDirectory()) {
						bundles.push(item);
					}
				});
			}));
		}).then(function() {
			console.log('Copying orion.client');
			/* So. Because the file structure of the Orion source bundles doesn't match the URL/RequireJS module
			 * structure, we need to copy all the bundles' "./web/" folders into the temp dir, so that module paths
			 * can resolve successfully, and later optimization steps will work.
			 */
			return PromisedIO.seq(bundles.map(function(bundle) {
				return function() {
					var d = new Deferred();
					var bundleWebFolder = path.resolve(pathToOrionClientBundlesFolder, bundle, BUNDLE_WEB_FOLDER);
					pfs.exists(bundleWebFolder).then(function() {
						console.log('Bundle has no web/ folder, skip: ' + bundle);
						d.resolve();
					}, function() {
						execCommand(getCopyCmd(bundleWebFolder, pathToTempDir)).then(d.resolve);
					});
					return d;
				};
			}));
		})/*.then(function() {
			// Dojo is too huge, just hack the build file to link to 
			console.log('Copying Dojo');
			return execCommand(getCopyCmd(pathToDojo, pathToTempDir));
		})*/.then(function() {
			console.log('Copying orionode.client');
			return execCommand(getCopyCmd(pathToOrionodeClient, pathToTempDir));
		});
	}).then(function() {
		if (skipOptimize) { return new Deferred().resolve(); }
		console.log('-------------------------------------------------------\n' + 'Running optimizes (' + optimizes.length + ')...\n');
		return PromisedIO.seq(optimizes.map(function(op) {
			return function() {
				// TODO better to call r.js from this node instance instead of shell cmd??
				var pageDir = op.pageDir, name = op.name;
				var args = [
					pathToRjs,
					"-o",
					pathToBuildFile,
					"name=" + pageDir + '/' + name,
					"out=" + '.temp/' + pageDir + '/built-' + name + '.js',
					"baseUrl=" + '.temp'
				];
				// TODO check existence of path.join(pageDir, name) -- skip if the file doesn't exist
				return spawn(pathToNode, args, {
					cwd: path.dirname(pathToBuildFile)
				});
			};
		}));
	}).then(function() {
		if (skipUpdateHtml) { return new Deferred().resolve(); }
		console.log('-------------------------------------------------------\n' + 'Running updateHTML...\n');
		return PromisedIO.seq(optimizes.map(function(op) {
			return function() {
				// TODO stat minifiedFilePath, only perform the replace if minifiedfile.size > 0
				var name = op.name;
				var builtResult = 'require(["built-' + name + '.js"]);';
				console.log("updateHTML " + op.htmlFilePath);
				return pfs.readFile(op.htmlFilePath, 'utf8').then(function(htmlFile) {
					htmlFile = debuf(htmlFile);
					htmlFile = htmlFile.replace("require(['" + name + ".js']);", builtResult);
					htmlFile = htmlFile.replace('require(["' + name + '.js"]);', builtResult);
					htmlFile = htmlFile.replace("requirejs/require.js", "requirejs/require.min.js");
					return pfs.writeFile(op.htmlFilePath, htmlFile);
				}, function(error) {
					// log and continue
					console.log(error.stack || error);
					console.log('');
				});
			};
		}));
	}).then(function() {
		if (skipCopyBack) { return new Deferred().resolve(); }
		// Copy the built files from our .temp directory back to their original locations in the bundles folder
		console.log('-------------------------------------------------------\n' + 'Copy built files to ' + pathToOrionClientBundlesFolder + '...\n');
		return PromisedIO.seq(optimizes.map(function(op) {
			return function() {
				var args = {
					builtJsFile: op.minifiedFilePath,
					htmlFile: op.htmlFilePath,
					originalFolder: path.join(pathToOrionClientBundlesFolder, op.bundle, BUNDLE_WEB_FOLDER, op.pageDir)
				};
				if (IS_WINDOWS) {
					return PromisedIO.all([
						execCommand(format('xcopy /q /y ${builtJsFile} ${originalFolder}', args)),
						execCommand(format('xcopy /q /y ${htmlFile} ${originalFolder}', args))
					]);
				} else {
					return execCommand(format("cp ${builtJsFile} ${htmlFile} ${originalFolder}", args));
				}
			};
		}));
	});
}

function exitFail(error) {
	if (error) { console.log(error.stack || error); }
	process.exit(1);
}

function exitSuccess() { process.exit(0); }

/**
 * @param {String} xmlFile
 * @returns {Promise}
 */
function processFile(filepath) {
	var saxStream = sax.createStream(strictSax);
	var optimizeElements = [];
	var buildPromise = new Deferred();
	saxStream.on('opentag', function(node) {
		if (node.name === 'optimize') {
			optimizeElements.push(node);
		}
	});
	saxStream.on('end', function() {
		build(optimizeElements).then(buildPromise.resolve, buildPromise.reject);
	});
	saxStream.on('error', exitFail);
	fs.createReadStream(filepath).pipe(saxStream);
	return buildPromise;
}

/*
 * The fun starts here
 */
processFile(path.join(__dirname, 'customTargets.xml')).then(
	exitSuccess,
	exitFail);

//pfs.readFile(path.join(__dirname, 'customTargets.xml'), 'utf8').then(function(xml) {
//	return processFile(debuf(xml));
//}, exitFail).then(exitSuccess, exitFail);
