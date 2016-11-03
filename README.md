# serverside-datatable
AngularJs server side datatable

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
$scope.ssTable = {
    instance: "openProject",
    saveState: true,
    api: "api-url-where-keep-data",
    requestType: "sql",
    headers: {
        "example": "header"
    },
    lengthMenu: [5, 10, 25, 50, 100],
    limit: 5,
    page: 1,
    sort: {
        column: 0,
        direction: "desc"
    },
    columns: [
        {
            title: "Data",
            sortable: true,
            filter: true,
            dbColumn: "database_column",
            type: "date",
            format: "dd.MM.yyyy",
            timezone: "Europe/Rome"
        },
        {
            title: "Location",
            sortable: true,
            filter: true,
            dbColumn: "database_column2",
            type: "string",
            sqlColumnsMerge: ["col1", "col2"]
            render: function(object) {
                // return some data to be displayed;
            },
            defaultsTo: "someDefaultValue"
        }
        {
            title: "Button column",
            sortable: false,
            filter: false,
            dbColumn: "database_column3",
            type: "button",
            buttonLabel: "Button text",
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
- columns: type: array. Array of objects containing column tha were used to create the table:
    - title: type: string. Table column title.
    - sortable: type: boolean. Enable sorting o thi column.
    - filter: type: boolean. Enable filter on this column.
    - dbColumn: type: string. Database column name.
    - type: type: string. Value:
        - date for date type. if type was date you must specify format and timezone
        - string: normal string
        - button: build a button. You must specify the button label, class and callback.
    - sqlColumnsMerge: type: array. Array of columns name to merge for output. The data request will be sent with CONCAT(col1, ' ', col2[,....]) AS "dbColumn".
                        if filter is active search contain all columns.
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
