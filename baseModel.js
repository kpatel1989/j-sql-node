"use strict"
const db = require("./connection");

module.exports = function (tableName, idField) {
	return {
		db,
		insert: (event, context, callback) => {
			console.log("Insert to:", tableName, event);
			var data = { tableName, data: event, idField };
			db.insert(data).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in insert", error);
				callback(error);
			})
		},

		update: (event, context, callback) => {
			console.log("Update:", tableName, event);
			var data = event;

			var idParam = {
				columnName: idField,
				value: data[idField]
			}
			var where = "";
			if (data[idField]) {
				var where = `${[idField]} = ${data[idField]}`;
				delete data[idField];
			}
			var data = { tableName, data, where };
			db.update(data).then(response => {
				console.log("UPDATE Response:", response);
				var data = { tableName, where: [idParam] };
				db.get(data).then(response => {
					console.log("Update Response:", response);
					callback(null, response[0]);
				}).catch(error => {
					console.log("Error in Update", error);
					callback(error);
				})
			}).catch(error => {
				console.log("Error in update", error);
				callback(error);
			})
		},

		updateBulk: (event, context, callback) => {
			console.log("Update:", tableName);
			var { data, where } = event;
			if (!data || !where) {
				callback("Invalid data. data or where keys missing");
			}
			db.updateBulk({ tableName, data, where }).then(response => {
				console.log("UPDATE bulk Response:", response);
				var data = { tableName, where};
				db.get(data).then(response => {
					console.log("Update bulk Response:", response);
					callback(null, response[0]);
				}).catch(error => {
					console.log("Error in update bulk", error);
					callback(error);
				})
			}).catch(error => {
				console.log("Error in update", error);
				callback(error);
			})
		},

		delete: (event, context, callback) => {
			console.log("Delete :", tableName);
			var where = Object.keys(event).map(key => {
				return `${key} = '${event[key]}'`;
			}).join(" and ");
			var data = { tableName, where };
			db.delete(data).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in delete", error);
				callback(error);
			})
		},

		get: (event, context, callback) => {
			console.log("Get :", tableName, event);
			var params = event.query || {};
			var where = Object.keys(params).map(key => {
				return {
					columnName: key,
					value: params[key]
				}
			})
			var data = { tableName, where };
			db.get(data).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in Get", error);
				callback(error);
			})
		},

		query: (event, context, callback) => {
			console.log("Query :", tableName);
			event.tableName = tableName;
			db.query({query: event}).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in query", error);
				callback(error);
			})
		}
	}
}
