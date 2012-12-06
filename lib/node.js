/*global console module process require*/
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var url = require('url');
var api = require('./api'), write = api.write, writeError = api.writeError;
var fileUtil = require('./fileUtil');
var resource = require('./resource');
var node_apps = require('./node_apps'), App = node_apps.App, AppTable = node_apps.AppTable;

var PATH_TO_NODE = process.execPath;
var INSPECT_PORT = 8900;

function printError(e) {
	console.log('err' + e);
}

function spawnNode(modulePath, args) {
	var child = child_process.spawn(PATH_TO_NODE, [modulePath].concat(Array.isArray(args) ? args : []), {
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
	
	function startInspectorApp(req, modulePath, args, restartOnExit){
		var child, app;
		try {
			child = spawnNode(modulePath, args);
			var location = url.resolve(url.format({
				protocol: req.protocol, // TODO this may be bad
				host: req.headers.host,
				pathname: 'node-inspector' + '/'
			}), './' + child.pid);
			app = new App(child.pid, location, child);
			appTable.put(child.pid, app);
			child.on('exit', function() {
				console.log('exit # ' + child.pid);
				appTable.remove(child.pid);
				if(restartOnExit){
					startInspectorApp(req, modulePath, args, restartOnExit);
				}
			});
			return app;
		} catch (e) {
			console.log(e.stack || e);
			appTable.remove(child.pid);
			app.stop();
			return null;
		}
	}

	function startApp(req, res, modulePath, args, debugInfo) {
		var child, app;
		try {
			child = spawnNode(modulePath, args);
			var location = url.resolve(url.format({
				protocol: req.protocol, // TODO this may be bad
				host: req.headers.host,
				pathname: nodeRoot + '/'
			}), './' + child.pid);
			
			app = new App(child.pid, location, child, debugInfo);
			appTable.put(child.pid, app);
			child.on('exit', function() {
				console.log('exit # ' + child.pid);
				appTable.remove(child.pid);
			});
			write(201, res, { Location: location }, app.toJson());
			return app;
		} catch (e) {
			console.log(e.stack || e);
			appTable.remove(child.pid);
			app.stop();
			return null;
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
					startApp(req, res, safeModulePath(modulePath), args);
				}
			} else if (rest === 'debug') {
				port = params.port;
				if (checkPath(modulePath) && checkPort(port)) {
					modulePath = safeModulePath(modulePath);
					var parsedOrigin = url.parse(req.headers.origin);
					var debugInfo = url.resolve(url.format({
						protocol: parsedOrigin.protocol,
						hostname: parsedOrigin.hostname,
						port:  INSPECT_PORT + '/'
					}), './' + "debug?port=" + port);
					
					var app = startApp(req, res, modulePath, ["--debug-brk=" + port].concat(modulePath), debugInfo);
					//Lazy spawn the node inspector procees for the first time when user wants to debug an app.
					if(app && !inspector){
						modulePath = require.resolve('node-inspector/bin/inspector');
						var inspectorArg = [modulePath].concat("--web-port=" + INSPECT_PORT);
						inspector = startInspectorApp(req, modulePath, inspectorArg, true);
					}
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