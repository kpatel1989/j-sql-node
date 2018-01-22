# j-sql-node
A json interface to connect to mysql database in node js

Add a sample db.json file in your root folder with your database settings.

Extend the base Model to create Models specific to a table in database.
Follow Users.js file to build the models for each table in your database.

V1.1.0 Release
- A json formated get, update, insert, delete functions. 
- A query builder that takes a json object as input and returns a mysql query.

V1.1.0 Release
 - Support Bulk Update to update table with a custom where condition.
 - Update where claue in query generation function.
 - Get function now supports where condition with simple json object.

V1.1.0 Release
 - Bug fixes

 V1.1.1 Release
 - Change get params to query.

V1.1.2 Release
 - Bug fixes.

 V1.1.3 Release
 - Bug fixes.


 V1.1.3 Release
 - Bug fixes.


 V1.1.3 Release
 - Bug fixes. Use body and query keys from event object. 