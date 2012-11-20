/*global require*/
var fs = require('fs');
var path = require('path');

// Shim to support pre-0.7.1 versions of Node, where `fs.exists` was `path.exists`
if (!fs.exists) {
	fs.exists = path.exists;
}
