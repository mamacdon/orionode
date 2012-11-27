/*global console module process require*/
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var url = require('url');
var api = require('./api');
var fileUtil = require('./fileUtil');
var resource = require('./resource');
var node_apps = require('./node_apps'), App = node_apps.App, AppTable = node_apps.AppTable;

var PATH_TO_NODE = process.execPath;

function writeError(code, res, msg) {
	res.statusCode = code;
	if (typeof msg === 'string') {
		var err = JSON.stringify({Error: msg});
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Length', err.length);
		res.end(err);
	} else {
		res.end();
	}
}

function write(code, res, headers, body) {
	res.statusCode = code;
	if (headers) {
		Object.keys(headers).forEach(function(header) {
			res.setHeader(header, headers[header]);
		});
	}
	if (typeof body !== 'undefined') {
		var contentType = typeof body === 'object' ? 'application/json' : 'text/plain';
		body = typeof body === 'object' ? body = JSON.stringify(body) : body;
		res.setHeader('Content-Type', contentType);
		res.setHeader('Content-Length', body.length);
		res.end(body);
	} else {
		res.end();
	}
}

function printError(e) {
	console.log('err' + e);
}

function spawnNode(modulePath, args) {
	var child = child_process.spawn(PATH_TO_NODE, args, {
		cwd: path.dirname(modulePath) // weird/maybe wrong: cwd is module dir, not the Orion Shell's cwd
	});
	child.on('error', printError);
	return child;
}

module.exports = function(options) {
	var nodeRoot = options.root;
	var fileRoot = options.fileRoot;
	var workspaceDir = options.workspaceDir;
	if (!nodeRoot) { throw 'options.root path required'; }
	var appTable = new AppTable();
	var inspector = null;

	function safeModulePath(p) {
		var filePath = api.rest(fileRoot, p);
		return fileUtil.safeFilePath(workspaceDir, filePath);
	}
	
	function restartApp(modulePath, args, oldApp){
		var child, app;
		try {
			child = spawnNode(modulePath, args);
			app = new App(child.pid, oldApp.location, child);
			appTable.put(child.pid, app);
			child.on('exit', function() {
				console.log('exit # ' + child.pid);
				appTable.remove(child.pid);
				restartApp(modulePath, args, app);
			});
		} catch (e) {
			console.log(e.stack || e);
			appTable.remove(child.pid);
			app.stop();
		}
	}

	function startApp(req, res, modulePath, args, restartOnExit) {
		var child, app;
		try {
			child = spawnNode(modulePath, args);
			var location = url.resolve(url.format({
				protocol: req.protocol, // TODO this may be bad
				host: req.headers.host,
				pathname: nodeRoot + '/'
			}), './' + child.pid);
			app = new App(child.pid, location, child);
			appTable.put(child.pid, app);
			child.on('exit', function() {
				console.log('exit # ' + child.pid);
				appTable.remove(child.pid);
				if(restartOnExit){
					restartApp(modulePath, args, app);
				}
			});
			write(201, res, { Location: location }, app.toJson());
			return app;
		} catch (e) {
			console.log(e.stack || e);
			appTable.remove(child.pid);
			app.stop();
		}
	}

	/**
	 * @param {HttpRequest} req
	 * @param {HttpResponse} res
	 * @param {Function} next
	 * @param {String} rest
	 */
	return resource(nodeRoot, {
		GET: function(req, res, next, rest) {
			var pid = rest;
			if (pid === '') {
				write(200, res, null, {
					Apps: appTable.apps().map(function(app) {
						return app.toJson();
					})
				});
			} else {
				var app = appTable.get(pid);
				if (!app) {
					writeError(404, res);
					return;
				}
				write(200, res, null, app.toJson());
			}
		},
		POST: function(req, res, next, rest) {
			function checkPath(modulePath) {
				if (typeof modulePath !== 'string') {
					writeError(400, res, 'Missing parameter "modulePath"');
					return false;
				}
				return true;
			}
			function checkArgs(args) {	
				if (args && !Array.isArray(args)) {
					writeError(400, res, 'Parameter "args" must be an array, or omitted');
					return false;
				}
				return true;
			}
			function checkPort(port) {
				if (typeof port !== 'number') {
					writeError(400, res, 'Parameter "port" must be a number');
					return false;
				}
				return true;
			}
			var params = req.body, modulePath = params.modulePath, args = params.args, port;
			if (rest === 'start') {
				if (checkPath(modulePath) && checkArgs(args)) {
					startApp(safeModulePath(modulePath), args);
				}
			} else if (rest === 'debug') {
				port = params.port;
				if (checkPath(modulePath) && checkPort(port)) {
					modulePath = safeModulePath(modulePath);
					startApp(req, res, modulePath, ["--debug-brk=" + port].concat(modulePath));
				}
			} else if (rest === 'debug_inspect') {
				port = params.port;
				if (checkPort(port) && !inspector) {
					modulePath = require.resolve('node-inspector/bin/inspector');
					var inspectorArg = [modulePath].concat("--web-port=" + port);
					inspector = startApp(req, res, modulePath, inspectorArg, true);
				}
			} else {
				write(400, res);
			}
		},
		DELETE: function(req, res, next, rest) {
			if (rest === '') {
				writeError(400, res);
				return;
			}
			var pid = rest;
			var app = appTable.remove(pid);
			if (!app) {
				writeError(404, res);
			} else {
				app.stop();
				write(204, res);
			}
		}
	});
};