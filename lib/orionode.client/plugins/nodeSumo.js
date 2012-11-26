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
	var provider = new PluginProvider({
		name: "NodeSumo",
		version: "1.0",
		description: "Provides cool Node.js control through commands for the Orion Shell."
	});

	provider.registerService('orion.shell.command',{
		callback: function(commandArgs) {
			var moduleFile = commandArgs.module, args = commandArgs.args;
			var lastPosition = 0;
			return xhr('POST', '/node/spawn', {
				progress: true,
				headers: {'Content-Type': 'application/json'},
				data: JSON.stringify({
					modulePath: moduleFile.Location,
					args: args
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
		name: 'node',
		description: 'Launch a child Node.js process.',
		parameters: [{
			name: 'module',
			type: 'file',
			description: 'The module to run in the child.'
		}, {
			name: 'args',
			type: { name: 'array', subtype: 'string' },
			description: 'Optional command-line arguments to pass to the child.',
			defaultValue: null
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
		name: 'node-debug',
		description: 'Launch a child Node.js process with debug port. The port number is used as the parameter of node inspector URL. E.g., debug?port=5860.',
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
		name: 'node-inspector',
		description: 'Launch a node-inspector process with a given port. The node-inspector can be used as the format of the serverURL:portNumber/debug?port=debugPort. E.g., localhost:8082/debug?port=5861',
		parameters: [{
			name: 'port',
			type: { name: 'number', min: 1 },
			description: 'Port number to pass to the node-inspector process.',
			defaultValue: 8082
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