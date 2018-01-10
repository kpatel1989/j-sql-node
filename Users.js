"use strict"
var tableName = "Users"; // Table name in your database to which this model will interact
var base = require("./baseModel")(tableName,"id"); // Extend the baseModel Class to make it work for a particular table with 2 parameter as the primary key column name.

// The base function has all the common functions like get, insert, update, updateBulk, delete.
// Extend the base model to add more functions.
base.getUserByEmailAddress = (event, context, callback) => {
	var query = {
		"tableName": "Users",
		"columns": ["Users.*", "Company.name as 'companyName'"],
		"where": [
			{
				"columnName": "emailAddress",
				"value": event.emailAddress
			}
		],
		"joins": [
			{
				type: "INNER JOIN",
				to: "Company",
				on: "Company.companyId = Users.companyId"
			}
		]
	};
	base.db.query({query}).then(users => callback(null, users[0])).catch(err => callback(err));
}

module.exports = base; // Always export the final class which supports all the functions.