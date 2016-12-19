angular.module("serverside-datatable", [])
	.directive("serversideDatatable", function() {
		return {
			replace: true,
			restrict: "E",
			scope: {
				ssTable: "=",
				ssClass: "@"
			},
			template: '<div class="row">' +
                '<div class="col-xs-12" ng-show="ssTable.query.data.length > 0">' +
					'<div class="btn-group">' +
						'<button type="button" class="btn btn-default">{{ssTable.limit}} entries</button>' +
						'<button type="button" id="ssTableEntriesButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ng-click="showThisDropDownMenu()">' +
							'<span class="caret"></span>' +
							'<span class="sr-only">Toggle Dropdown</span>' +
						'</button>' +
						'<ul class="dropdown-menu">' +
							'<li ng-repeat="l in lengthMenu track by $index"><a ng-click="changeLimit(l)">{{l}}</a></li>' +
						'</ul>' +
					'</div>' +
				'</div>' +
				'<div class="col-xs-12">' +
                    '<table ng-class="tableClass">' +
                        '<thead>' +
                            '<tr>' +
                                '<th ng-repeat="column in ssTable.columns" ng-click="changeSort($index)" ng-if="column.show" style="white-space: nowrap !important;">' +
                                    '<i ng-show="column.sortable && ssTable.sort.column != $index" class="fa fa-sort-amount-asc softGrey" style="margin-right: 15px !important"></i>' +
                                    '<i ng-show="column.sortable && ssTable.sort.column == $index && ssTable.sort.direction == \'asc\'"' +
										'class="fa fa-sort-amount-asc darkGrey" style="margin-right: 15px !important"></i>' +
                                    '<i ng-show="column.sortable && ssTable.sort.column == $index && ssTable.sort.direction == \'desc\'"' +
										'class="fa fa-sort-amount-desc darkGrey" style="margin-right: 15px !important"></i>' +
                                    '{{column.title}}' +
                                '</th>' +
                            '</tr>' +
                            '<tr ng-if="showFilter" style="cursor: auto !important">' +
                                '<th ng-repeat="column in ssTable.columns" ng-if="column.show">' +
									'<div class="input-group input-group-sm" style="display: block;">' +
										'<input ng-if="column.filter" class="form-control " ng-model="filters[column.dbColumn]" ng-change="filtersChange($index)" />' +
									'</div>' +
                                '</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr ng-repeat="object in ssTable.query.data" ng-if="ssTable.query.data.length > 0">' +
                                '<td ng-repeat="column in ssTable.columns" ng-if="column.show">' +
									'<span ng-if="column.type == \'date\'">{{object[column.dbColumn] | date: column.format: column.timezone}}</span>' +
									'<span ng-if="column.type == \'button\'">' +
										'<button ng-class="column.buttonClass" ng-click="column.buttonCallback(object, $index)">' +
											'{{column.buttonLabel}}</button>' +
									'</span>' +
									'<span ng-if="column.type != \'date\' && column.type != \'button\' && !column.render">{{object[column.dbColumn] || column.defaultsTo}}</span>' +
									'<span ng-if="column.type != \'date\' && column.type != \'button\' && column.render">{{column.render(object)}}</span>' +
								'</td>' +
                            '</tr>' +
                            '<tr ng-if="ssTable.query.data.length == 0">' +
								'<td colspan="{{ssTable.columns.length}}" class="text-center">No data available in table</td>' +
                            '</tr>' +
                        '</tbody>' +
                    '</table>' +
                '</div>' +
				'<div class="col-xs-5" ng-show="ssTable.query.data.length > 0">' +
					'<div style="margin-top:30px">Showing {{showing.from}} to {{showing.to}} of {{showing.total}} records</div>' +
                '</div>' +
				'<div class="col-xs-7" ng-show="ssTable.query.data.length > 0">' +
					'<nav aria-label="Page navigation" class="pull-right" ng-if="ssTable.query.data.length > 0">' +
  						'<ul class="pagination pagination-sm">' +
    						'<li>' +
					      		'<a href="" ng-click="firstLast(1)" aria-label="First">' +
					        		'<span aria-hidden="true">First</span>' +
					      		'</a>' +
					    	'</li>' +
    						'<li>' +
					      		'<a href="" ng-click="prevNextPage(\'prev\')" aria-label="Previous">' +
					        		'<span aria-hidden="true">&laquo;</span>' +
					      		'</a>' +
					    	'</li>' +
					    	'<li ng-repeat="page in pagination.pages track by $index" id="page_{{page}}">' +
								'<a ng-if="page != ssTable.page" href="" ng-click="changePage(page)">{{page}}</a>' +
								'<a ng-if="page == ssTable.page" href="">{{page}}</a>' +
							'</li>' +
					    	'<li>' +
					      		'<a href="" ng-click="prevNextPage(\'next\')" aria-label="Next">' +
					        		'<span aria-hidden="true">&raquo;</span>' +
					      		'</a>' +
					    	'</li>' +
    						'<li>' +
					      		'<a href="" ng-click="firstLast(totalPages)" aria-label="Last">' +
					        		'<span aria-hidden="true">Last</span>' +
					      		'</a>' +
					    	'</li>' +
					  	'</ul>' +
					'</nav>' +
                '</div>' +
            '</div>',
			controller: function($scope, $element, $attrs, $http, $timeout, $compile, $sessionStorage) {
				var self = $scope;
				
				//-- Recupero il pulsante dropdown e il menu per gli entries
				var element = document.getElementById("ssTableEntriesButton");
				var sibiling = element.nextSibling;

				self.showThisDropDownMenu = function () {  
					var style = window.getComputedStyle(sibiling);
					var display = style.getPropertyValue('display');
					if (display == "none") {
						sibiling.style.display = "block";
					} else {
						sibiling.style.display = "none";
					}
				};

				if (self.ssTable) {
					// SET RELOAD FUNCTION
					self.$on("reload-ssTable-data", function (event, instance) {  
						if (instance == self.ssTable.instance) loadData();
					});

					//-- SET TABLE CLASS
					self.tableClass = $attrs.ssClass;

					//-- SET SORTING
					self.ssTable.sort = self.ssTable.sort || {
						column: 0,
						direction: 'asc'
					}

					//-- SET LENGTH MENU
					self.lengthMenu = self.ssTable.lengthMenu || [10, 25, 50, 100];
					self.ssTable.limit = self.ssTable.limit || self.lengthMenu[0];
					self.changeLimit = function(limit) {
						sibiling.style.display = "none";
						self.ssTable.limit = limit;
						loadData();
					}

					//-- HANDLE SORT DATA
					self.changeSort = function(index) {
						if (index == self.ssTable.sort.column) {
							self.ssTable.sort.direction = (self.ssTable.sort.direction == 'asc') ? 'desc' : 'asc';
						} else {
							self.ssTable.sort = {
								column: index,
								direction: 'asc'
							}
						}
						loadData();
					};

					//-- HANDLE SEARCH IN DATA
					var search = {};
					self.filters = {};
					for (var i = 0; i < self.ssTable.columns.length; i++) {
						self.filters[self.ssTable.columns[i].dbColumn] = "";
					}
					var filterActive = self.ssTable.columns.find(function(column) {
						return column.filter;
					});
					if (filterActive) self.showFilter = true;
					self.filtersChange = function(index) {
						self.ssTable.page = 1;

						var type = self.ssTable.columns[index].type;
						if (type == 'date') {
								search[self.ssTable.columns[index].dbColumn] = self.filters[self.ssTable.columns[index].dbColumn];
								self.dateFormat = self.ssTable.columns[index].format;
						} else if (type == "string") {
							if (self.ssTable.columns[index].sqlColumnsMerge) {
								console.log(index);
								console.log("column",self.ssTable.columns[index]);
								if (self.ssTable.columns[index].sqlConcat) {
									if (self.ssTable.columns[index].sqlConcat.toUpperCase().indexOf(" AS ") > -1) {
										var fields = self.ssTable.columns[index].sqlConcat.toUpperCase().split(" AS ");
										column = fields[0];
									} else {
										column = self.ssTable.columns[index].sqlConcat.toUpperCase();
									}
								} else {
									var column = "CONCAT(";
									var n = 0;
									self.ssTable.columns[index].sqlColumnsMerge.forEach(function(field) {
										if (n > 0) column += ", ' ', ";
										column += (field.indexOf(".") > -1) ? field : '"' + field + '"';
										n++;
									});
									column += ')';
								}
								search[column] = self.filters[self.ssTable.columns[index].dbColumn].replace(/ /g, "%").replace("'","''");
							} else {
								search[self.ssTable.columns[index].dbColumn] = self.filters[self.ssTable.columns[index].dbColumn].replace(/ /g, "%").replace("'","''");
							}
						}

						loadData();
					}

					//-- SET REQUEST COLUMNS
					var columns = [];
					var sortColumn = [];
					for (var i = 0; i < self.ssTable.columns.length; i++) {

						//-- CHECK FOR DUPLICATES
						if (columns.indexOf(self.ssTable.columns[i].dbColumn) == -1) {
							var column = "";
							if (self.ssTable.columns[i].sqlColumnsMerge) {
								if (self.ssTable.columns[i].sqlConcat) {
									column = self.ssTable.columns[i].sqlConcat;
								} else {
									column += "CONCAT(";
									var n = 0;
									self.ssTable.columns[i].sqlColumnsMerge.forEach(function(field) {
										if (n > 0) column += ", ' ', ";
										column += (field.indexOf(".") > -1) ? field : '"' + field + '"';
										n++;
									});
									column += ') AS "' + self.ssTable.columns[i].dbColumn + '"';
								}
								var sort = "";
								var n = 0;
								self.ssTable.columns[i].sqlColumnsMerge.forEach(function(field) {
									if (n > 0) sort += ",";
									sort += field;
									n++;
								});
								sortColumn.push(sort);
							} else {
								column += self.ssTable.columns[i].dbColumn;
								sortColumn.push(column);
							}
							columns.push(column);

							if (self.ssTable.columns[i].type == 'date') {
								if (!self.ssTable.columns[i].timezone) self.ssTable.columns[i].timezone = "Europe/Rome";
								if (!self.ssTable.columns[i].format) self.ssTable.columns[i].format = "yyyy-mm-dd";
							}

						}
					}

					//-- SET START
					self.ssTable.page = self.ssTable.page || 1;

					//-- SET REQUEST FUNCTION
					self.ssTable.query = {
						data: [],
					};
					self.showing = {
						from: 0,
						to: 0,
						total: 0
					}
					self.pagination = {
						pages: []
					};
					function loadData() {
						self.offset = (self.ssTable.page - 1) * self.ssTable.limit;
						var filters = {
							sort: self.ssTable.sort,
							search: search,
							columns: columns,
							sortColumn: sortColumn,
							limit: self.ssTable.limit,
							offset: self.offset,
							dateFormat: self.dateFormat,
							table: self.ssTable.tablename,
							join: self.ssTable.join || [],
							customWhere: self.ssTable.customWhere || []
						};
						if (self.ssTable.debug) console.log(filters);
						if (self.ssTable.api) {
							$http({
								method: 'POST',
								url: self.ssTable.api,
								headers: self.ssTable.headers || {},
								data: filters
							}).then(function(data) {
								if (self.ssTable.debug) console.log(data);
								self.ssTable.query = data.data;
								var to = (data.data.recordsFiltered >= self.ssTable.limit) ? self.ssTable.limit : data.data.recordsFiltered;
								self.showing = {
									from: (self.offset + 1),
									to: parseInt(self.offset) + parseInt(to),
									total: data.data.recordsFiltered
								}
								setPagination();
							}, function(err) {
								if (self.ssTable.debug) console.log(err);
							});
						}
					}

					//-- HANDLE / SET PAGINATION
					function setPagination() {
						// SET PAGINATION
						self.totalPages = Math.ceil(self.showing.total / self.ssTable.limit);
						self.pagination.pages = [];
						if (self.totalPages < self.ssTable.page && self.ssTable.page > 1) {
							self.ssTable.page = 1;
							loadData();
						} else {
							switch (self.ssTable.page) {
								case 1:
								case 2:
								case 3:
									var pages = (self.totalPages >= 5) ? 5 : self.totalPages;
									for (var i = 1; i <= pages; i++) {
										self.pagination.pages.push(i);
									}
									break;
								case self.totalPages:
								case (self.totalPages-1):
								case (self.totalPages-2):
									var start = (self.totalPages > 5) ? (self.totalPages - 5) : 1;
									for (var i = start; i <= self.totalPages; i++) {
										self.pagination.pages.push(i);
									}
									break;
								default:
									self.pagination.pages = [(self.ssTable.page-2), (self.ssTable.page-1), self.ssTable.page, (self.ssTable.page+1), (self.ssTable.page+2)];
									break;
							}

							$timeout(function(){
								$(".pagination li").removeClass("active");
								$("#page_" + self.ssTable.page).addClass("active");
							},200)
						}
					}

					//-- HANDLE CHANGE PAGE
					self.changePage = function(page) {
						self.ssTable.page = page;
						loadData();
					}
					self.prevNextPage = function(action) {
						switch (action) {
							case "prev":
								if (self.ssTable.page > 1) {
									self.ssTable.page--;
									loadData();
								}
								break;
							default:
								if (self.ssTable.page < self.totalPages) {
									self.ssTable.page++;
									loadData();
								}
								break
						}
					}
					self.firstLast = function(page) {
						self.ssTable.page = page;
						loadData();
					}

					//-- SAVE TABLE STATE
					if (self.ssTable.saveState) {
						if (!$sessionStorage.ssTable) $sessionStorage.ssTable = {};
						if (!$sessionStorage.ssTable[self.ssTable.instance]) $sessionStorage.ssTable[self.ssTable.instance] = {
							page: self.ssTable.page || 1,
							limit: self.ssTable.limit || self.lengthMenu[0]
						};

						self.ssTable.page = $sessionStorage.ssTable[self.ssTable.instance].page;
						self.ssTable.limit = $sessionStorage.ssTable[self.ssTable.instance].limit;
						self.$watch("ssTable.page", function(newVal, oldVal) {
							if (newVal) $sessionStorage.ssTable[self.ssTable.instance].page = newVal;
						});
						self.$watch("ssTable.limit", function(newVal, oldVal) {
							if (newVal) $sessionStorage.ssTable[self.ssTable.instance].limit = newVal;
						});
						loadData();
					} else {
						loadData();
					}
				}

			}
		};
	});
