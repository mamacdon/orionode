/*global exports module*/
/*jslint forin:true*/
function App(pid, location, process) {
	this.pid = pid;
	this.process = process;
	this.location = location;
}
App.prototype = {
	stop: function() {
		this.process.kill();
	},
	toJson: function() {
		return {
			Id: this.pid,
			Location: this.location
		};
	}
};

function AppTable() {
	this.map = Object.create(null);
}
AppTable.prototype = {
	get: function(pid) {
		return this.map[pid] || null;
	},
	put: function(pid, app) {
		if (this.map[pid]) {
			throw new Error('pid in use: ' + pid);
		}
		this.map[pid] = app;
	},
	remove: function(pid) {
		if (!Object.prototype.hasOwnProperty.call(this.map, pid)) {
			return false;
		}
		var app = this.map[pid];
		delete this.map[pid];
		return app;
	},
	apps: function() {
		var map = this.map;
		var values = [];
		for (var prop in map) {
			values.push(map[prop]);
		}
		return values;
	}
};

exports.AppTable = AppTable;
exports.App = App;
