/*global __dirname console process require*/
var connect = require('connect');
var mime = connect.mime;
var http = require('http');
var path = require('path');
var url = require('url');
var util = require('util');
var argslib = require('./lib/args');
var orionFile = require('./lib/file');
var orionNode = require('./lib/node');
var orionWorkspace = require('./lib/workspace');
var orionNodeStatic = require('./lib/orionode_static');
var orionStatic = require('./lib/orion_static');

var LIBS = path.normalize(path.join(__dirname, 'lib/'));

// vroom vroom
http.globalAgent.maxSockets = 25;

mime.define({
	'application/json': ['pref', 'json']
});

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
		var app = connect()
//			.use(connect.logger('dev')) // uncomment to log all requests to console
			.use(connect.urlencoded())
			.use(basicAuthIfConfigured(password))
			.use(connect.json())
			.use(connect.compress())
			// static code
			.use(orionNodeStatic(path.normalize(path.join(LIBS, 'orionode.client/'))))
			.use(orionStatic(    path.normalize(path.join(LIBS, 'orion.client/')), {dojoRoot: path.resolve(LIBS, 'dojo/')}))
			// API handlers
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
var workspaceDir = workspaceArg ? path.resolve(process.cwd(), workspaceArg) : path.join(__dirname, '.workspace');
var tempDir = path.join(workspaceDir, '.temp');
argslib.createDirs([workspaceDir, tempDir], function(dirs, tempDir) {
	var passwordFile = args.password || args.pwd;
	argslib.readPasswordFile(passwordFile, function(password) {
		startServer(port, dirs[0], dirs[1], passwordFile, password);
	});
});