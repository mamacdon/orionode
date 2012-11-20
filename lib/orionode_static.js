/*global exports:true module require*/
var connect = require('connect');
var statik = connect['static'];
var mime = connect.mime;

exports = module.exports = function(root, options) {
	options = options || {};
	options.maxAge = (5 * 60000); // 5 minutes
	options.hidden = true;
	if (!root) { throw new Error('orionode-static root path required'); }

/* To run the Orionode client code, we need the following resource mapping, plus the mappings required for 'orion_static'.
 * The Orionode client code selectively "overrides" some resource from orion_static to provide its own implementation (eg. defaults.pref)
 *
 * Web path    File path              Comment
 * -----------------------------------------------------------------------------------
 *   /         lib/orionode.client    Mounts Orionode's plugin setup, and plugin code.
 */
	return statik(root, options);
};
