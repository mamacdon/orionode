/*global console module process require*/
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
//var url = require('url');
//var util = require('util');
var api = require('./api');
var fileUtil = require('./fileUtil');
var resource = require('./resource');

var PATH_TO_NODE = process.execPath;

function writeBadRequest(req, res, msg) {
	res.statusCode = 400;
	if (typeof msg === 'string') {
		var err = JSON.stringify({Error: msg});
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Length', err.length);
		res.end(err);
	} else {
		res.end();
	}
}

module.exports = function(options) {
	var nodeRoot = options.root;
	var fileRoot = options.fileRoot;
	var workspaceDir = options.workspaceDir;
//	var tempDir = options.tempDir;
	if (!nodeRoot) { throw 'options.root path required'; }

	function safeModulePath(p) {
		var filePath = api.rest(fileRoot, p);
		return fileUtil.safeFilePath(workspaceDir, filePath);
	}

	/**
	 * @param {HttpRequest} req
	 * @param {HttpResponse} res
	 * @param {Function} next
	 * @param {String} rest
	 */
	return resource(nodeRoot, {
		POST: function(req, res, next, rest) {
			switch (rest) {
				case '':
					writeBadRequest(req, res);
					break;
				case 'spawn':
					var params = req.body;
					var modulePath = params.modulePath, args = params.args;
					if (typeof modulePath !== 'string') {
						writeBadRequest(req, res, 'Missing parameter "modulePath"');
					} else if (args && !Array.isArray(args)) {
						writeBadRequest(req, res, 'Parameter "args" must be an array, or omitted');
					} else {
						var child;
						modulePath = safeModulePath(modulePath);
						try {
							child = child_process.spawn(PATH_TO_NODE, [modulePath].concat(args), {
								cwd: path.dirname(modulePath) // weird/maybe wrong: cwd is module dir, not the Orion Shell's cwd
							});
//							child.on('close', function() {
//								console.log('child "close" ; killing ' + child);
//								child.kill();
//							});
							child.on('exit', function(code, signal) {
								console.log('exit #' + child.pid);
								res.end();
							});
							child.on('error', function(e) {
								console.log('err' + e);
							});
							console.log('spawned pid#: ' + child.pid);
							res.writeHead(200, {
								'Content-Type': 'text/plain',
								'Transfer-Encoding': 'chunked'
							});
							child.stdout.pipe(res, {end: false});
							child.stderr.pipe(res, {end: false});
							req.on('close', function() {
								// in case client closes connection before child has exited
								child.kill();
							});
						} catch (e) {
							console.log(e.stack || e);
							if (child) {
								child.kill();
							}
						}
					}
					break;
			}
		}
	});
};