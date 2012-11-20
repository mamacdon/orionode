/*global require exports*/
var ct = require('../contenttype').makeHeader;

function FileDataResource(data) {
	this.data = data;
}
FileDataResource.prototype.write = function(resp) {
	resp.writeHead(200);
	resp.write(this.data);
	resp.end();
};

function FileMetadataResource(name, location, stats) {
	var meta = this.metadata = {};
	meta.Directory = false;
	// TODO
	//meta.ETag
	meta.Name = name;
	meta.Location = location;
	meta.LocalTimeStamp = stats.mtime.getTime();
}
FileMetadataResource.prototype.write = function(resp) {
	resp.writeHead(200, ct('json'));
	resp.write(JSON.stringify(this.metadata));
	resp.end();
};

exports.FileDataResource = FileDataResource;
exports.FileMetadataResource = FileMetadataResource;
