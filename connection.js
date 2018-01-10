"use strict"
var mysql = require('mysql');
var mysqlModel = require('mysql-model');
var fs = require("fs");
function connect() {
	return new Promise((resolve, reject) => {
		try {
			console.log("Connecting to db...");
			var connectionParams = JSON.parse(fs.readFileSync(__dirname + "/../../db.json", "utf8"));
			console.log(connectionParams);
			resolve(mysqlModel.createConnection(connectionParams));
		} catch (error) {
			console.log("Unable to create a connection", error);
			reject(`Whoops! Connection error - ${JSON.stringify(error)}`);
		}
	});
}

module.exports.insert = (params) => {
	console.log("Invoking insert");
	return connect().then(Model => {
		var { tableName, data, idField } = params;
		if (!tableName || !data) {
			var error = "Invalid arguments passed. Required 'tableName' and 'data'";
			console.log(error, params)
			return Promise.reject(error);
		} else {
			console.log("Inserting -", params);
			var model = new Model(data);
			model.tableName = tableName;
			return new Promise((resolve, reject) => {
				model.save((err, response, fields) => {
					if (err) {
						console.log("Save Error -", err, model.toJSON());
						reject(err);
						model.disconnect();
					} else {
						console.log(response);
						model.set(idField, response.insertId);
						console.log("Record successfully inserted to ", tableName);
						resolve(model.toJSON());
						model.disconnect();
					}
				});
			});
		}
	})
}

module.exports.update = (params) => {
	return connect().then(Model => {
		var { tableName, data, where } = params;
		if (!tableName || !data || !where) {
			var error = "Invalid arguments passed. Required 'tableName' and 'data'";
			console.log(error, params)
			throw new Error(error);
		} else {
			console.log("Updating -", params);
			var model = new Model();
			model.tableName = tableName;
			model.set(data);
			return new Promise((resolve, reject) => {
				model.save(where, (err, response, fields) => {
					if (err) {
						console.log("Save Error -", err);
						throw new Error(err);
						model.disconnect();
					} else {
						console.log("Record successfully updated in ", tableName);
						resolve(model.toJSON());
						model.disconnect();
					}
				});
			});
		}
	}).catch(error => {
		console.log("Update failed -", error, params);
		throw new Error(error);
	})
}

module.exports.updateBulk = (params) => {
	return connect().then(Model => {
		var { tableName, data, where } = params;
		if (!tableName || !data || !where) {
			var error = "Invalid arguments passed. Required 'tableName' and 'data'";
			console.log(error, params)
			throw new Error(error);
		} else {
			console.log("Updating -", params);
			where = buildWhere(where);
			var model = new Model();
			model.tableName = tableName;
			model.set(data);
			return new Promise((resolve, reject) => {
				model.save(where, (err, response, fields) => {
					if (err) {
						console.log("Save Error -", err);
						throw new Error(err);
						model.disconnect();
					} else {
						console.log("Record successfully updated in ", tableName);
						resolve(model.toJSON());
						model.disconnect();
					}
				});
			});
		}
	}).catch(error => {
		console.log("Update failed -", error, params);
		throw new Error(error);
	})
}

module.exports.delete = (params) => {
	return connect().then(Model => {
		var { tableName, where } = params;
		if (!tableName || !where) {
			var error = "Invalid arguments passed. Required 'tableName' and 'where' condition";
			console.log(error, params)
			throw new Error(error);
		} else {
			console.log("Deleting -", params);
			var model = new Model();
			model.tableName = tableName;
			return new Promise((resolve, reject) => {
				model.remove(where, (err, response, fields) => {
					if (err) {
						console.log("Delete Error -", err);
						throw new Error(err);
						model.disconnect();
					} else {
						console.log("Record successfully deleted from ", tableName);
						resolve(response);
						model.disconnect();
					}
				});
			});
		}
	}).catch(error => {
		console.log("Delete failed -", error, params);
		throw new Error(error);
	});
}

module.exports.get = (params) => {
	return connect().then(Model => {
		var { tableName, where } = params;
		if (!tableName) {
			var error = "Invalid arguments passed. Required 'tableName'";
			console.log(error, params)
			throw new Error(error);
		} else {
			var query = buildQuery({tableName, where});
			console.log("Get query -", JSON.stringify(params), query);
			var model = new Model({ tableName });
			return new Promise((resolve, reject) => {
				model.query(query, (err, response, fields) => {
					if (err) {
						console.log("Get Error -", err);
						throw new Error(err);
						model.disconnect();
					} else {
						console.log("Get successfully executed ", response);
						resolve(response);
						model.disconnect();
					}
				});
			});
		}
	}).catch(error => {
		console.log("Get failed -", error, params);
		throw new Error(error);
	});
}


module.exports.query = (params) => {
	return connect().then(Model => {
		var { query } = params;
		if (!query) {
			var error = "Invalid arguments passed. Required query";
			console.log(error, params)
			throw new Error(error);
		} else {
			var query = buildQuery(query);
			console.log("Quering -", JSON.stringify(params), query);
			var model = new Model();
			return new Promise((resolve, reject) => {
				model.query(query, (err, response, fields) => {
					if (err) {
						console.log("Query Error -", err);
						throw new Error(err);
						model.disconnect();
					} else {
						console.log("Query successfully executed ", response);
						resolve(response);
						model.disconnect();
					}
				});
			});
		}
	}).catch(error => {
		console.log("Query failed -", error, params);
		throw new Error(error);
	});
}

var buildWhere = function(where) {
	var whereClause = "";
	if (Array.isArray(where)) {
		whereClause = where.map(function (wh, index) {
			var operator = "=";
			var operand = `'${wh.value}'`;
			if (Array.isArray(wh.value)) {
				operator = "IN";
				operand = `(${wh.value.join(",")})`;
			}
			else if (typeof wh.value == "string") {
				operand = `'${wh.value.toString()}'`;
			}
			wh.condition = wh.condition || " AND ";
			if (index == 0) wh.condition = "";
			return ` ${wh.condition} ${wh.columnName} ${operator} ${operand}`;
		}, this).join(" ");
	} else {
		whereClause = Object.keys(where).map( key => {
			var operator = " = ";
			var value = where[key];
			if (Array.isArray(where[key])) {
				operator = " IN ";
				value = `'${value.join(",")}'`;
			}
			return `${key} ${operator} ${value}`
		}).join(" AND ");
	}
	return whereClause;
}

/**
* 
* @param {Array} columns Array of columns to return from the query or ["*"]
* @param {String} tableName TableName to execute the query
* @param {Array} joins Array of join querys to append to the query. 
* 						Format : {
* 							type: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN",
* 							to: tableName,
* 							on: keyCondition
* 						}
* @param {Array} where Array of all where condition
* 						Format : {
* 	 							columnName : columnName,
*	 							value : 'Hello' | 123 | [1,2,3,4] | {SubQuery}
*	 							condition : "AND" | "OR" | Optional (default is AND)
*	 						}
*/
var buildQuery = function({ columns, tableName, joins, where, groupBy, orderBy, having, page, pageCount }) {
	if (!tableName) {
		throw new Error("Required atleast tableName");
	}

	if (!columns) columns = ["*"];

	var query = `SELECT ${columns.join(",")} FROM ${tableName}`;
	if (joins) {
		var joinQuery = joins.map(({ type, to, on }) => { return ` ${type} ${to} ON ${on} ` }).join(" ");
		query += joinQuery;
	}
	if (where && where.length > 0) {
		query += " Where " + where.map(function (wh, index) {
			var operator = "=";
			var operand = `'${wh.value}'`;
			if (Array.isArray(wh.value)) {
				operator = "IN";
				operand = `(${wh.value.join(",")})`;
			}
			else if (typeof wh.value == "string") {
				operand = `'${wh.value.toString()}'`;
			} else if (typeof wh.value == "object") {
				operand = buildQuery(wh.value);
			}
			wh.condition = wh.condition || " AND ";
			if (index == 0) wh.condition = "";
			return ` ${wh.condition} ${wh.columnName} ${operator} ${operand}`;
		}, this).join(" ");
	}
	if (groupBy) {
		query += ` GROUP BY ${groupBy.join(",")}`;
	}
	if (having) {
		query += ` HAVING (${having.join(",")})`;
	}
	if (orderBy) {
		query += ` ORDER BY (${orderBy.join(",")})`;
	}
	if (pageCount && page) {
		query += ` LIMIT ${(page - 1) * pageCount + 1}, ${pageCount}`;
	} else if (pageCount) {
		query += ` LIMIT ${pageCount}`;
	}
	return query;
}