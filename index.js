/*global __dirname console process require*/
var connect = require('connect');
var http = require('http');
var path = require('path');
var url = require('url');
var util = require('util');
var argslib = require('./lib/args');
var orionFile = require('./lib/file');
var orionNode = require('./lib/node');
var orionWorkspace = require('./lib/workspace');
var orionStatic = require('./lib/static');

// vroom vroom
http.globalAgent.maxSockets = 25;

/* 
 * To run the Orion client code, we need the following resource mappings:
 *   /                   ->  bundles/org.eclipse.orion.client.core/web
 *   /                   ->  bundles/org.eclipse.orion.client.editor/web
 *   /org.dojotoolkit	 ->  wherever dojo lives--maybe in node_modules
 * 
 * TODO currently we copy all this stuff into bundles/org.eclipse.orion.client.core/web, but we could instead
 * use connect to map those individual directories as static resources.
 */

function handleError(err) {
	throw err;
}

function basicAuthIfConfigured(password) {
	if (typeof password === 'string') {
		return connect.basicAuth(function(user, pwd) {
			return pwd === password;
		});
	}
	return function(req, res, next) { next(); }; // no-op
}

function startServer(port, workspaceDir, tempDir, passwordFile, password) {
	try {
		var twoHours = 2 * 60 * 60 * 1000;
		var orionClientCorePath = path.normalize(path.join(__dirname, 'bundles/org.eclipse.orion.client.core/web'));
		var app = connect()
//			.use(connect.logger('dev')) // uncomment to log all requests to console
			.use(connect.urlencoded())
			.use(basicAuthIfConfigured(password))
			.use(connect.json())
			.use(connect.compress())
			.use(orionStatic(orionClientCorePath, {maxAge: twoHours, hidden: true}))
			.use(orionFile({root: '/file', workspaceDir: workspaceDir, tempDir: tempDir}))
			.use(orionWorkspace({root: '/workspace', fileRoot: '/file', workspaceDir: workspaceDir, tempDir: tempDir}))
			.use(orionNode({root: '/node', fileRoot: '/file', workspaceDir: workspaceDir, tempDir: tempDir}))
			.listen(port);
		if (passwordFile) { console.log(util.format('Using password from file: %s', passwordFile)); }
		console.log(util.format('Using workspace: %s', workspaceDir));
		console.log(util.format('Listening on port %d...', port));
		app.on('error', handleError);
	} catch (e) {
		handleError(e);
	}
}

// Get the arguments, the workspace directory, and the password file (if configured), then launch the server
var args = argslib.parseArgs(process.argv);
var port = args.port || args.p || 8081;
var workspaceArg = args.workspace || args.w;
var workspaceDir = workspaceArg ? path.join(process.cwd(), workspaceArg) : path.join(__dirname, '.workspace');
var tempDir = path.join(workspaceDir, '.temp');
argslib.createDirs([workspaceDir, tempDir], function(dirs, tempDir) {
	var passwordFile = args.password || args.pwd;
	argslib.readPasswordFile(passwordFile, function(password) {
		startServer(port, dirs[0], dirs[1], passwordFile, password);
	});
});