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
/*global console define URL XMLHttpRequest window*/
define(['orion/plugin', 'orion/xhr', 'orion/Deferred', 'orion/URL-shim', 'socketIO/socket.io'],
		function(PluginProvider, xhr, Deferred, url, io) {
	function fromJson(xhrResult) {
		return JSON.parse(xhrResult.response);
	}
	function getSocketURL(path) {
		var socketBaseUrl = new URL();
		var location = window.location;
		socketBaseUrl.protocol = location.protocol;
		socketBaseUrl.hostname = location.hostname;
		socketBaseUrl.port = location.port;
		socketBaseUrl.pathname = path;
		return socketBaseUrl.href;
	}
	/**
	 * Helper for managing Deferred progress
	 */
	function SocketProcess(url) {
		var socket = this.socket = io.connect(getSocketURL(url || ''), {
			'force new connection': true
		});
		var deferred = this.deferred = new Deferred();
		var buf = [];
		function addListenerOfType(type) {
			return socket.on.bind(socket, type);
		}
		Object.defineProperties(this, {
			'connect': { set: addListenerOfType('connect') },
			'disconnect': { set: addListenerOfType('disconnect') },
			'error':  { set: addListenerOfType('error') },
			'started': { set: addListenerOfType('started') },
			'stopped': { set: addListenerOfType('stopped') },
			'stdout': { set: addListenerOfType('stdout') },
			'stderr': { set: addListenerOfType('stderr') }
		});
		this.progress = function(data) {
			buf.push(data);
			deferred.progress(buf.join(''));
		};
		this.resolve = function() {
			deferred.resolve(buf.join(''));
		};
		this.disconnect = this.resolve;
		this.error = this.progress;
		this.stdout = this.progress;
		this.stderr = this.progress;
	}

	var provider = new PluginProvider({
		name: "NodeSumo",
		version: "1.0",
		description: "Provides cool Node.js control through commands for the Orion Shell."
	});

	provider.registerService('orion.shell.command', {}, {
		name: 'node',
		description: 'Commands to manage applications.'
	});

	provider.registerService('orion.shell.command', {
		callback: function(commandArgs) {
			var moduleFile = commandArgs.module, args = commandArgs.args;
			var sockProc = new SocketProcess();
			sockProc.connect = function(data) {
				sockProc.socket.emit('start', {
					modulePath: moduleFile.Location,
					args: args
				});
			};
			sockProc.started = function(app) {
				sockProc.progress('Started app (PID: ' + app.Id + ')\n');
			};
			sockProc.stopped = function(app) {
				// TODO unnecessary work, could just "resolve with progress" in one shot
				sockProc.progress('App stopped: (PID: ' + app.Id + ')\n');
				sockProc.resolve();
			};
			return sockProc.deferred;
		}
	}, {
		name: 'node start',
		description: 'Runs a Node.js application.',
		parameters: [{
			name: 'module',
			type: 'file',
			description: 'The module to run.'
		}, {
			name: 'args',
			type: { name: 'array', subtype: 'string' },
			description: 'Optional command-line arguments to pass to the app.',
			defaultValue: null
		}]
	});
	
	provider.registerService('orion.shell.command', {
		callback: function(commandArgs) {
			var moduleFile = commandArgs.module, args = commandArgs.args;
			var sockProc = new SocketProcess();
			sockProc.connect = function(data) {
				sockProc.socket.emit('cover', {
					modulePath: moduleFile.Location,
					args: args
				});
			};
			sockProc.started = function(app) {
				sockProc.progress('Started app with coverage (PID: ' + app.Id + ')\n');
			};
			sockProc.stopped = function(app) {
				// TODO unnecessary work, could just "resolve with progress" in one shot
				sockProc.progress('App stopped: (PID: ' + app.Id + ')\n');
				sockProc.resolve();
			};
			return sockProc.deferred;
		}
	}, {
		name: 'node cover',
		description: 'Runs a Node.js application with code coverage.',
		parameters: [{
			name: 'module',
			type: 'file',
			description: 'The module to run.'
		}, {
			name: 'args',
			type: { name: 'array', subtype: 'string' },
			description: 'Optional command-line arguments to pass to the app.',
			defaultValue: null
		}]
	});

	provider.registerService('orion.shell.command', {
		callback: function(commandArgs) {
			return xhr('GET', '/node', {}).then(function(xhrResult) {
				var data = fromJson(xhrResult);
				if (!data.Apps.length) {
					return 'No running apps.';
				}
				return data.Apps.map(function(app) {
					return ['PID: ' + app.Id, 'URL: ' + app.Location, app.DebugURL ? ('Debug URL: ' + app.DebugURL) : ''].join(', ');
				}).join('\n');
			});
		}
	}, {
		name: 'node list',
		description: 'Lists the running Node.js apps.',
		parameters: []
	});

	provider.registerService('orion.shell.command', {
		callback: function(commandArgs) {
			var pid = commandArgs.pid;
			return xhr('DELETE', '/node/' + pid, {}).then(function(xhrResult) {
				return 'Stopped ' + pid;
			}, function(xhrResult) {
				return 'Could not stop ' + pid + ': ' + (xhrResult.error || xhrResult);
			});
		}
	}, {
		name: 'node stop',
		description: 'Stops a running Node.js app.',
		parameters: [{
			name: 'pid',
			type: 'string'
		}]
	});

	provider.registerService('orion.shell.command',{
		callback: function(commandArgs) {
			var sockProc = new SocketProcess();
			sockProc.connect = function(data) {
				sockProc.socket.emit('debug', {
					modulePath: commandArgs.module.Location,
					port: commandArgs.port
				});
			};
			sockProc.started = function(app) {
				sockProc.progress('Debugging app (PID: ' + app.Id + ')\nDebug URL: ' + app.DebugURL);
			};
			sockProc.stopped = function(app) {
				sockProc.progress('App stopped (PID: ' + app.Id + ')');
				sockProc.resolve();
			};
			return sockProc.deferred;
		}
	}, {
		name: 'node debug',
		description: 'Runs a Node.js application with a given debug port number. Use different port numbers if you debug more than one apps. Use the debug URL from the command response, in a webkit browser to start debug.',
		parameters: [{
			name: 'module',
			type: 'file',
			description: 'The module to run in the child.'
		}, {
			name: 'port',
			type: { name: 'number', min: 1 },
			description: 'The debug port number to pass to the child process.',
			defaultValue: 5860
		}]
	});

	provider.registerService('orion.shell.command',{
		callback: function(args) {
			return 'lol';
		}
	}, {
		name: 'npm',
		description: 'Run the node package manager.',
		parameters: [{
			name: 'command',
			type: 'string',
			description: 'The command to pass to npm.'
		}]
	});

	provider.connect();
});
