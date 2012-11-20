/*global exports require*/
var ct = require('../contenttype').makeHeader;
var fs = require('promised-io/fs');
var PromisedIO = require('promised-io');
var path = require('path');

function DirectoryListResource(dirpath, location, stats) {
	this.path = path;
	var dir = this.dir = {};
	dir.Name = path.basename(dirpath);
	dir.Location = location;
	dir.LocalTimeStamp = stats.mtime.getTime();
	// this.promise resolves with dir data when children have been gotten
	this.promise = fs.readdir(dirpath).then(function(files) {
		// stat each file to get its 'Directory' -- ugh
		var childStatPromises = files.map(function(file) {
			var filepath = path.join(dirpath, file);
			return fs.stat(filepath).then(function(stat) {
				return [filepath, stat];
			});
		});
		return PromisedIO.all(childStatPromises).then(function(childStats) {
			dir.Children = childStats.map(function(cs) {
				var childname = path.basename(cs[0]);
				return {
					Name: childname,
					Directory: cs[1].isDirectory(),
					Location: (location + '/' + childname)
				};
			});
			return dir; // resolve our promise, yay
		});
	});
}
DirectoryListResource.prototype.write = function(resp) {
	return this.promise.then(function(dir) {
		resp.writeHead(200, ct('json'));
		resp.write(JSON.stringify(dir));
		resp.end();
	}, function(e) {
		resp.writeHead(500);
		resp.write(e.toString());
		resp.end();
	});
};
exports.DirectoryListResource = DirectoryListResource;
