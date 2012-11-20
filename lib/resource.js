/*global module require*/
var url = require('url');
var util = require('util');
var api = require('./api');

module.exports = function(root, handler) {
	if (!root) { throw 'Orion file root path required'; }
	if (!handler) { throw 'handler object required'; }

	return function(req, res, next) {
		var path = url.parse(req.url).pathname;
		var rest;
		if ((rest = api.rest(root, path)) !== null) {
			var methodFunc = handler[req.method];
			if (typeof methodFunc === 'function') {
				methodFunc(req, res, next, rest);
			} else {
				var error = JSON.stringify({Message: util.format('Unhandled method %s for %s', req.method, path)});
				res.setHeader('Content-Length', error.length);
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(501);
				res.end(error);
			}
		} else {
			next();
		}
	};
};
