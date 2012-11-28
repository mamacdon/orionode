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
/*global console define XMLHttpRequest */
define(['orion/plugin', 'orion/xhr'], function(PluginProvider, xhr) {
	function fromJson(xhrResult) {
		return JSON.parse(xhrResult.response);
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
			var lastPosition = 0;
			return xhr('POST', '/node/start', {
				progress: true,
				headers: {'Content-Type': 'application/json'},
				data: JSON.stringify({
					modulePath: moduleFile.Location,
					args: args
				})
			}).then(function(xhrResult) {
				// TODO only return progress no done
				var app = fromJson(xhrResult);
				return 'Started PID: ' + app.Id + ' at ' + app.Location;
			});
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
			return xhr('GET', '/node', {}).then(function(xhrResult) {
				var data = fromJson(xhrResult);
				if (!data.Apps.length) {
					return 'No running apps.';
				}
				return 'PID\t\tLocation\n' + data.Apps.map(function(app) {
					return app.Id + '\t\t' + app.Location; 
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
			var moduleFile = commandArgs.module, port = commandArgs.port;
			var lastPosition = 0;
			return xhr('POST', '/node/debug', {
				progress: true,
				headers: {'Content-Type': 'application/json'},
				data: JSON.stringify({
					modulePath: moduleFile.Location,
					port: port
				})
			}).then(function(xhrResult) {
				// TODO only return progress no done
				return xhrResult.response;
			}, null, function(progressEvent) {
				function getChunk() {
					var xmlHttpRequest = progressEvent.xhr;
					var position = progressEvent.position;
					var chunk = xmlHttpRequest.responseText.slice(lastPosition, position);
					console.log('got chunk ' + chunk.length + ' bytes [' + lastPosition + '..' + position + ']');
					lastPosition = position;
					return chunk;
				}
				var chunk = getChunk();
				return progressEvent;
			});
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
/*
	provider.registerService('orion.shell.command',{
		callback: function(commandArgs) {
			var port = commandArgs.port;
			var lastPosition = 0;
			return xhr('POST', '/node/debug_inspect', {
				progress: true,
				headers: {'Content-Type': 'application/json'},
				data: JSON.stringify({
					port: port
				})
			}).then(function(xhrResult) {
				// TODO only return progress no done
				return xhrResult.response;
			}, null, function(progressEvent) {
				function getChunk() {
					var xmlHttpRequest = progressEvent.xhr;
					var position = progressEvent.position;
					var chunk = xmlHttpRequest.responseText.slice(lastPosition, position);
					console.log('got chunk ' + chunk.length + ' bytes [' + lastPosition + '..' + position + ']');
					lastPosition = position;
					return chunk;
				}
				var chunk = getChunk();
				return progressEvent;
			});
		}
	}, {
		name: 'node inspect',
		description: 'Launch a node-inspector process with a given port. The node-inspector can be used as the format of the serverURL:portNumber/debug?port=debugPort. E.g., localhost:8082/debug?port=5861',
		parameters: [{
			name: 'port',
			type: { name: 'number', min: 1 },
			description: 'Port number to pass to the node-inspector process.',
			defaultValue: 8082
		}]
	});
*/
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