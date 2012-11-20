/*global exports:true module require*/
var connect = require('connect');
var mime = connect.mime;

/**
 * @param {Object} options Options to be passed to connect/static
 */
exports = module.exports = function(root, options) {
	if (!root) { throw new Error('orion-static root path required'); }

	var statik = connect['static'](root, options);
	mime.define({
		'application/json': ['pref', 'json']
	});
	return statik;
};
