"use strict"
const db = require("./connection");

module.exports = function (tableName, idField) {
	return {
		db,
		insert: (event, context, callback) => {
			console.log("Insert to:", tableName, event);
			var data = { tableName, data: event , idField};
			db.insert(data).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in insert", error);
				callback(error);
			})
		},

		update: (event, context, callback) => {
			console.log("Update:", tableName);
			var data = { tableName, data: event };
			db.update(data).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in update", error);
				callback(error);
			})
		},

		delete: (event, context, callback) => {
			console.log("Delete :", tableName);
			var data = { tableName, data: event };
			db.delete(data).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in delete", error);
				callback(error);
			})
		},

		get: (event, context, callback) => {
			console.log("Get :", tableName);
			var data = { tableName, data: event };
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
			db.query(event).then(response => {
				console.log("Response:", response);
				callback(null, response);
			}).catch(error => {
				console.log("Error in query", error);
				callback(error);
			})
		}
	}
}
