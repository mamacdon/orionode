/*global exports*/

/*
 * Sadly, the Orion client code expects http://orionserver/file and http://orionserver/file/ 
 * to both point to the File API. That's what this helper is for.
 */
function pathMatch(root, path) {
	var len = root.length;
	if (root[len-1] === '/') {
		root = root.substring(0, --len - 1);
	}
	return path.substring(0, len) === root && (path.length <= len || path[len] === '/');
}

/*
 * Returns the tail of the path after root has been matched.
 */
function rest(root, path) {
	if (!pathMatch(root, path)) {
		return null;
	}
	var tail = path.substring(root.length);
	return tail[0] === '/' ? tail.substring(1) : tail;
}

/*
 * Joins a bunch of junk into a path, like the path component of a URL.
 */
function join(/*varags*/) {
	var segs = Array.prototype.slice.call(arguments);
	var path = [];
	for (var i=0; i < segs.length; i++) {
		var segment = segs[i];
		// This is kind of cheesy: avoid double-slashes
		var last = segment.length-1;
		path.push(segment[last] === '/' ? segment.substring(0, last) : segment);
//		path.push(segment);
	}
	return path.join('/');
}

exports.pathMatch = pathMatch;
exports.rest = rest;
exports.join = join;