// SERVER SIDE DATATABLE
$scope.ssTable = {
    api: "/api/v1/projects/findFiltered",
    headers: {
        'token': userSrv.getUserId(),
        'device': 'web',
        'role': userSrv.getUserRole()
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
            dbColumn: "projects.start_date",
            type: "date",
            format: "dd.MM.yyyy",
            timezone: "Europe/Rome"
        },
        {
            title: "Location",
            sortable: true,
            filter: true,
            dbColumn: "location_name",
            type: "string"
        },
        {
            title: "Indirizzo",
            sortable: true,
            filter: true,
            dbColumn: "locations.address",
            type: "string"
        },
        {
            title: "",
            sortable: false,
            filter: false,
            dbColumn: "projects.id",
            type: "button",
            buttonClass: "btn btn-success btn-xs",
            buttonLink: "#/home/projectDetail",
            buttonLinkAppendDbColumn: true,
            buttonLabel: "Visualizza"
        }
    ]
};
