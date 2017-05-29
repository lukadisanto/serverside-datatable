# serverside-datatable
AngularJs server side datatable

bower install:
<pre>
bower install serverside-datatable
</pre>

Add in your page the depencencies:
<pre>
&#60;script src="bower_components/jquery/dist/jquery.min.js"&#62;&#60;/script&#62;
&#60;script src="bower_components/bootstrap/dist/js/bootstrap.min.js"&#62;&#60;/script&#62;
&#60;script src="bower_components/bootstrap/angular/angular.min.js"&#62;&#60;/script&#62;
&#60;script src="bower_components/ngstorage/ngStorage.min.js"&#62;&#60;/script&#62;
&#60;script src="bower_components/serverside-datatable/serverside-datatable.js"&#62;&#60;/script&#62;
</pre>

Definition example:

<pre>
In your angular.module add dependency
( example: angular.module("app", ["serverside-datatable"]); )

In HTML page:
&#60;serverside-datatable
    ss-class="table"
    ss-table="ssTable"&#62;
&#60;/serverside-datatable&#62;

<pre>
In AngularJs Controller:
    var self = $scope;
    self.ssTable = {
        instance: "usersTable",
        saveState: true,
        requestType: "sql",
        headers: {
            "example": "header"
        },
        lengthMenu: [10, 25, 50, 100],
        limit: 10,
        page: 1,
        sort: {
            column: 1,
            direction: "asc"
        },
        tablename: "users",
        join: [],
        columns: [
            {
                title: "tName",
                sortable: true,
                filter: true,
                dbColumn: "name",
                type: "string",
                show: true,
                // render: function(object) {
                //     // return some data to be displayed;
                // },
                defaultsTo: ""
            },
            {
                title: "tType",
                sortable: true,
                filter: true,
                dbColumn: "user_type",
                type: "string",
                show: true,
                defaultsTo: ""
            },
            {
                title: "tUsername",
                sortable: true,
                filter: true,
                dbColumn: "username",
                type: "string",
                show: true,
                defaultsTo: ""
            },
            {
                dbColumn: "role",
                show: false,
                defaultsTo: ""
            },
            {
                title: "",
                sortable: false,
                filter: false,
                dbColumn: "id",
                type: "button",
                show: true,
                buttonLabel: "View",
                buttonClass: "btn btn-success btn-xs",
                buttonCallback: function(object, index) {
                    console.log(object, index);
                }
            },
            {
                title: "",
                sortable: false,
                filter: false,
                dbColumn: "id",
                type: "button",
                show: true,
                buttonLabel: "Edit",
                buttonClass: "btn btn-success btn-xs",
                buttonCallback: function(object, index) {
                    console.log(object, index);
                }
            }
        ]
    };

Options:
- instance: type: string. Unique id used for saving page
- saveState: type: boolean. Enable save page for this table
- api: type: string. Api link for keeping data.
- requestType: type: string. At moment not handled, on sql works.
- headers: type: object. Set request headers.
- lengthMenu: type: array. Array of limit diplay data in table.
- limit: type: integer. Start limit data to display.
- page: type: integer. Starting page. You can also watch for page change.
- sort: type: object. Object containing column sort and direction (asc / desc).
- tablename: type: string. The name of table that will put in FROM sql query.
- join: type: string array. Array of sql join that will put in sql query.
- columns: type: array. Array of objects containing column tha were used to create the table:
    - title: type: string. Table column title.
    - sortable: type: boolean. Enable sorting o thi column.
    - filter: type: boolean. Enable filter on this column.
    - dbColumn: type: string. Database column name.
    - type: type: string. Value:
        - date for date type. if type was date you must specify format and timezone
        - string: normal string
        - button: build a button. You must specify the button label, class and callback.
    - show: true/false. Render column in view.
    - sqlColumnsMerge: type: array. Array of columns name to merge for output. The data request will be sent with CONCAT(col1, ' ', col2[,....]) AS "dbColumn".
                        if filter is active search contain all columns.
    - sqlConcat: string. Custom sql concat (example: sqlConcat: "CONCAT('Major:',beacons.major,', minor:',beacons.minor,', uuid:',beacons.uuid) AS beacon")
    - defaultsTo: can be string or integer (or function returning string or integer) displayed if the object value is null.
    - render: type function. Is a function that take object as argument and must return somthing that will be displayed in the table.

serverside datatable ask api url and send this body for the post request:
    {
        sort: sort,
        search: search,
        columns: columns,
        limit: limit,
        offset: offset,
        dateFormat: dateFormat
    }

- sort: object specified in table construction.
- search: object containing keys named as dbColumn and value what you type in filter form.
- columns: array of dbColumns names.
- limit: the limit specified or selected.
- offset: the starting database record based on datatable page.
- dateFormat: used for date search.

Server must give this object response:
    {
        data: type: array. Array of data,
        recordsFiltered: type integer. Total amount of record filtered,
        recordsTotal: type integer. Total record diplayed
    }
</pre>

Server example (sails.js example): 
<pre>
const async = require('asyncawait/async');
const await = require('asyncawait/await');

module.exports = {
    ssTable: async ((req, res) => {
		console.log(req.body);
		var body = JSON.parse(JSON.stringify(req.body));
        console.log(body);

		//-- BASE QUERY
		var sql = "SELECT ";
		var from = "FROM " + body.table + " ";
		var where = "";
		var join = "";
		var order = "";
		var limit = "";

		//-- SET COLUMNS
		var i = 0;
		for (let field of body.columns) {
			if (field.indexOf("CONCAT") == -1) {
				sql += field + " AS \"" + field + "\"";
				sql += (i < (body.columns.length - 1)) ? ", " : " ";
			} else {
				sql += field;
				sql += (i < (body.columns.length - 1)) ? ", " : " ";
			}
			i++;
		}

        // SET JOIN
        for (j of body.join) {
            join += j + " ";
        }

		//-- SET WHERE
        for (var key in req.query) {
            where += (where.indexOf("WHERE") == -1)
                ? "WHERE " + key + " = " + req.query[key] + " "
                : "AND " + key + " = " + req.query[key] + " ";
        }
		var i = 0;
		for (key in body.search) {
			switch (key) {
				case "device_last_call":
					if (body.search[key] != ""){
                        where += (where.indexOf("WHERE") == -1)  
                            ? "WHERE  to_char(" + key + ", '" + body.dateFormat + "') LIKE '%" + body.search[key] + "%' "
                            : "AND to_char(" + key + ", '" + body.dateFormat + "') LIKE '%" + body.search[key] + "%' ";
                    }	
					break;
				default:
					if (body.search[key] != "")	{
                        where += (where.indexOf("WHERE") == -1)
                            ? "WHERE upper(CAST(" + key + " AS varchar)) LIKE '%" + body.search[key].toUpperCase() + "%' "
                            : "AND upper(CAST(" + key + " AS varchar)) LIKE '%" + body.search[key].toUpperCase() + "%' "
                    }
					break;
			}
			i++;
		}

		//-- SET SORT
		order += "ORDER BY ";
        if (body.sortColumn[body.sort.column].indexOf(",") > -1) {
            var arr = body.sortColumn[body.sort.column].split(",");
            var n = 0;
            for (var s of arr) {
                if (n > 0) order += ", ";
                order += s + " " + body.sort.direction + " ";
                n++;
            }
        } else {
            order += body.sortColumn[body.sort.column] + " " + body.sort.direction + " ";
        }

		//-- SET LIMIT AND OFFSET
		limit += "LIMIT " + body.limit + " OFFSET " + body.offset;

		var query = {
			count: "SELECT count(*) as total_records " + from + join + where,
		   	data: sql + from + join + where + order + limit
		};
		console.log(query);

		try {
			var count = await (new promise(Users, query.count));
			var totalRecord = count.rows[0].total_records;
			var data = await (new promise(Users, query.data));
			var object = {
				draw: body.draw,
				recordsTotal: data.rowCount,
				recordsFiltered: totalRecord,
				data: data.rows
			};
			return res.json(object);
		} catch (e) {
			return res.serverError(e);
		}

	}),
};
</pre>
