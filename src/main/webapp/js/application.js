//<![CDATA[

var graph = null;

var cloneGraph = {};

var nodeDefColor = "GREEN";

var templateContext = {};

var margin = {
	top : 30,
	right : 30,
	bottom : 30,
	left : 30
};
var width = window.innerWidth - margin.left - margin.right, height = window.innerHeight
		- margin.top - margin.bottom;


var color = d3.scale.category20();

var force = d3.layout.force().charge(-300).linkDistance(70).size(
		[ width + margin.left + margin.right,
				height + margin.top + margin.bottom ]);

var zoom = d3.behavior.zoom().scaleExtent([ -10, 20 ]).on("zoom", zoomed);

var drag = d3.behavior.drag().origin(function(d) {
	return d;
}).on("dragstart", dragstarted).on("drag", dragged).on("dragend", dragended);

function dottype(d) {
	d.x = +d.x;
	d.y = +d.y;
	return d;
}

function zoomed() {
	container.attr("transform", "translate(" + d3.event.translate + ")scale("
			+ d3.event.scale + ")");
}

function dragstarted(d) {
	d3.event.sourceEvent.stopPropagation();
	d3.select(this).classed("dragging", true);
	force.start();
}

function dragged(d) {
	d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

}

function dragended(d) {
	d3.select(this).classed("dragging", false);
}

function drawGraph() {

	d3.json("/sg/graph").header("Content-Type", "application/json").get(
			function(error, response) {

				graph = response;

				if (graph == null) {
					return;
				}

				var nodeById = d3.map();

				graph.nodes.forEach(function(node, index) {
					nodeById.set(node.uid, index);
				});

				graph.links.forEach(function(link) {
					link.source = nodeById.get(link.source);
					link.target = nodeById.get(link.target);
				});

				force.nodes(graph.nodes).links(graph.links).start();
				
				var link = container.append("g").attr("class", "glinks").selectAll(".link")
				  .data(graph.links)
				  .enter().append("line")
				  .attr("class", "link")
				  .style("stroke-width", "1")
				  .attr("marker-end", "url(#arrowhead)");
				
			
				var node = container.append("g").attr("class", "nodes").selectAll(
						".node").data(graph.nodes).enter().append("g").attr("class",
						"node").attr("cx", function(d) {
					return d.x;
				}).attr("cy", function(d) {
					return d.y;
				}).call(drag);

				node.append("circle").attr("r", function(d) {
					return d.weight * 2 + 12;
				}).style("fill", function(d) {
					return getNodeColor(d.domainUid);
				});

				node.append("svg:text").attr("class", "nodetext").text(function(d) {
					return d.dname;
				});

				force.on("tick", function() {
					link.attr("x1", function(d) {
						return d.source.x;
					}).attr("y1", function(d) {
						return d.source.y;
					}).attr("x2", function(d) {
						return d.target.x;
					}).attr("y2", function(d) {
						return d.target.y;
					});

					node.attr("transform", function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});
				});

				var linkedByIndex = {};

				graph.links.forEach(function(d) {
					linkedByIndex[d.source.index + "," + d.target.index] = 1;
				});

				function isConnected(a, b) {
					return linkedByIndex[a.index + "," + b.index]
							|| linkedByIndex[b.index + "," + a.index];
				}
				
				
				function getNodeColor(domainUid) {
					var nColor = nodeDefColor;
					graph.domain.forEach(function(d) {
						if (d.uid == domainUid) {
							nColor = d.Color;
						} 
					});
					return nColor;
				}

				node.on(
						"mouseover",
						function(d) {

							node.classed("node-active", function(o) {
								thisOpacity = isConnected(d, o) ? true : false;
								this.setAttribute('fill-opacity', thisOpacity);
								return thisOpacity;
							});

							link.classed("link-active", function(o) {
								return o.source === d || o.target === d ? true : false;
							});

							d3.select(this).classed("node-active", true);
							d3.select(this).select("circle").transition().duration(750)
									.attr("r", (d.weight * 2 + 12) * 1.5);
						})

				.on(
						"mouseout",
						function(d) {

							node.classed("node-active", false);
							link.classed("link-active", false);

							d3.select(this).select("circle").transition().duration(750)
									.attr("r", d.weight * 2 + 12);
						});

			});
}

var container = null;
var svg = null;

function createContainer() {

	var svg = d3.select("#map").append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr("transform",
			"translate(" + margin.left + "," + margin.right + ")").call(zoom);
	
	svg.append("svg:defs").selectAll("marker")
    .data(["arrowhead"])     
    .enter().append("svg:marker")    
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 37)
    .attr("refY", 0)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

	
	var rect = svg.append("rect").attr("width", width).attr("height", height)
			.style("fill", "none").style("pointer-events", "all");

	container = svg.append("g");

}

function reloadGraph() {

	graph = null;

	d3.select("svg").remove();

	createContainer()

	drawGraph();
}

window.onload = function() {

	createContainer()

	drawGraph();

}// ]]>

String.format = function() {
	// The string containing the format items (e.g. "{0}")
	// will and always has to be the first argument.
	var theString = arguments[0];

	// start with the second argument (i = 1)
	for (var i = 1; i < arguments.length; i++) {
		// "gm" = RegEx options for Global search (more than one instance)
		// and for Multiline search
		var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
		theString = theString.replace(regEx, arguments[i]);
	}

	return theString;
}

var createDomainQuery = " CREATE (:Domain {Name: '{0}', Description: '{1}', Color: '{2}'}); ";

var createServiceQuery = " MATCH (domain:Domain) where id(domain) = {0} CREATE (service:Service {Name: '{1}', Description: '{2}'})"
		+ " MERGE (domain)-[:HAS{type:'HAS', Description:'{3}'}]->(service);	 ";

// Create Operation Query.
var createOperationQuery = " MATCH (service:Service) where id(service) = {0} {1} CREATE (Mstoperation:Operation {OperationName: '{2}', Description: '{3}'}) "
		+ " MERGE (service)-[:OWNS{type:'OWNS', Description:'{4}'}]->(Mstoperation) {5}; ";

var operationMatchQuery = "  MATCH (operation{0}:Operation) where id(operation{0}) = {0} ";

var createOutcomingOpsQuery = " MERGE (Mstoperation)-[:INVOKES{type:'INVOKES'}]->(operation{0}) ";

var createIncomingOpsQuery = " MERGE (operation{0})-[:INVOKES{type:'INVOKES'}]->(Mstoperation) ";

var removeOperation = " START n=node({0}) OPTIONAL MATCH n-[r]-() DELETE r, n ; "

var app = angular.module('app', [ 'ngDialog', 'mdColorPicker' ]);

app.factory("AppService", function() {

	return {

		syncInvoke : function(url) {
			var request;
			if (window.XMLHttpRequest) {
				request = new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				request = new ActiveXObject("Microsoft.XMLHTTP");
			} else {
				throw new Error("Your browser don't support XMLHttpRequest");
			}

			request.open('POST', url, false);
			request.setRequestHeader("Content-Type", "application/json");
			request.send(null);

			if (request.status === 200) {
				return request.responseText;
			}
		}
	};
});

app.filter("getServiceByUid", function() {
	return function(services, serviceId) {
		var fService = null;
		angular.forEach(services, function(service, i) {
			if (service.uid == serviceId) {
				fService = service;
				// break;
			}
		});
		return fService;
	};
});

app
		.controller(
				'appController',
				[
						'$scope',
						'$http',
						'$q',
						'ngDialog',
						'$window',
						'$timeout',
						'$filter',
						'AppService',
						function($scope, $http, $q, ngDialog, $window,
								$timeout, $filter, AppService) {

							$scope.actionButtons = [ {
								text : 'Add Domain',
								action : 'addDomainDialog',
								template : 'addDomain',
								url : 'adddomain.png'
							}, {
								text : 'Add Service',
								action : 'addServiceDialog',
								template : 'addService',
								url : 'addservice.png'
							}, {
								text : 'Add Operation',
								action : 'addOperationDialog',
								template : 'addOperation',
								url : 'addoperation.png',
								mode : 'createoperation'
							}, {
								text : 'Del Service',
								action : 'deleteServiceDialog',
								template : 'deleteService',
								url : 'relservice.png'
							}, {
								text : 'Del Operation',
								action : 'deleteOperationDialog',
								template : 'deleteOperation',
								url : 'reloperation.png'
							}, {
								text : 'Update Operation',
								action : 'updateOperationDialog',
								template : 'addOperation',
								url : 'updateoperation.png',
								mode : 'updateoperation'
							} ];

							$scope.openInputDialog = function(templateIns) {

								angular.copy($window.graph, $window.cloneGraph);

								ngDialog.open({
									template : templateIns.template,
									data : templateIns
								});

							};

							$scope.onOperationLoad = function() {
								$scope.ngDialogData.showCreate = false;
								if ($scope.ngDialogData.mode == "createoperation") {
									$window.cloneGraph.operation.push({
										"uid" : -1
									});
									$scope.ngDialogData.cUID = -1;
									$scope.ngDialogData.showCreate = true;
								}
							}

							$scope.graphDomain = function() {
								return $window.cloneGraph.domain;
							}

							$scope.graphService = function() {
								return $window.cloneGraph.service;
							}

							$scope.graphOperation = function() {
								return $window.cloneGraph.operation;
							}

							$scope.createDomain = function() {
								var query = String.format(createDomainQuery,
										$scope.domain.Name, $scope.domain.Desc,
										$scope.domain.Color);
								$scope.postSuccessAction(query);
							};

							$scope.createService = function() {
								var query = String.format(createServiceQuery,
										$scope.service.Domain,
										$scope.service.Name,
										$scope.service.Desc, "");
								$scope.postSuccessAction(query);
							};

							$scope.selectedOperation = function() {

								var currOperation = angular
										.fromJson(this.ops.CurrentOperation);
								if (currOperation != null) {
									$scope.ops = {
										CurrentOperation : this.ops.CurrentOperation,
										Service : String(currOperation.serviceUid),
										Desc : currOperation.Description
									};

									var service = ($filter('getServiceByUid')(
											$window.cloneGraph.service,
											currOperation.serviceUid));
									if (service != null) {
										$scope.ops.Domain = String(service.domainUid);
									}
									$scope.ngDialogData.cServiceId = currOperation.serviceUid;
									$scope.ngDialogData.cUID = currOperation.uid;
								}
							};

							$scope.filterServiceForDomain = function(tservice) {
								if ($scope.ngDialogData.cStatus != "InProgress"
										&& $scope.ngDialogData.mode == "createoperation") {
									return true;
								}

								if ($scope.ops != null
										&& $scope.ops.Domain != null
										&& tservice.domainUid == $scope.ops.Domain) {
									return true;
								}

								return false;
							};

							$scope.saveOperations = function() {

								if ($scope.ngDialogData.mode == "createoperation") {
									$scope.createNewOperation();
								} else {
									$scope.updateOperation();
								}

							};

							$scope.updateOperation = function() {

								var createOperationQuery = $scope
										.createNewOperationQuery();

								var delOperation = String.format(
										removeOperation,
										$scope.ngDialogData.cUID);

								var updateQuery = delOperation
										+ createOperationQuery;

								$scope.postSuccessAction(updateQuery);

							};

							$scope.createNewOperation = function() {

								var createOperationQuery = $scope
										.createNewOperationQuery();

								$scope.postSuccessAction(createOperationQuery);

							};

							$scope.createNewOperationQuery = function() {

								var opsQueryRelMatch = "";
								var opsQueryRel = "";

								angular
										.forEach(
												$window.cloneGraph.operation,
												function(operation, i) {

													if ($scope
															.filterIncomingNgt(operation)) {

														opsQueryRelMatch += String
																.format(
																		operationMatchQuery,
																		operation.uid);
														opsQueryRel += String
																.format(
																		createIncomingOpsQuery,
																		operation.uid);
													}

												});

								angular
										.forEach(
												$window.cloneGraph.operation,
												function(operation, i) {

													if ($scope
															.filterOutcomingNgt(operation)) {
														opsQueryRelMatch += String
																.format(
																		operationMatchQuery,
																		operation.uid);
														opsQueryRel += String
																.format(
																		createOutcomingOpsQuery,
																		operation.uid);
													}

												});

								var serviceName = null;
								if ($scope.ngDialogData.mode == "createoperation") {
									serviceName = $scope.ops.ServiceName;
								} else {
									serviceName = angular
											.fromJson($scope.ops.CurrentOperation).OperationName;

								}

								var opsQuery = String.format(
										createOperationQuery,
										$scope.ops.Service, opsQueryRelMatch,
										serviceName, $scope.ops.Desc, "",
										opsQueryRel);

								return opsQuery;

							};

							$scope.postSuccessAction = function(query) {
								ngDialog.close();
								$scope.httpPost(query);
								$scope.redrawGraph();
							};

							$scope.filterRelations = function(operation,
									sArray, currUid, currMode, reverse) {
								// Never interested.
								if (operation.uid == currUid) {
									return false;
								}
								var status = false;
								if ($scope.ngDialogData.cStatus != "InProgress"
										&& currMode == "createoperation") {
									status = true;
								} else {
									if (sArray != null
											&& sArray.indexOf(currUid) > -1) {
										status = false;
									} else {
										status = true;
									}
								}
								if (reverse) {
									return !status;
								}
								return status;

							};

							$scope.resolveOperationCurrUID = function() {
								var currUid = $scope.ngDialogData.cUID;
								if (currUid != null && $scope.ops != null
										&& $scope.ops.CurrentService != null) {
									currUid = $scope.ops.CurrentService.uid;
								}
								return currUid;
							};

							$scope.filterIncoming = function(operation) {
								var currMode = $scope.ngDialogData.mode;
								var currUid = $scope.resolveOperationCurrUID();
								var reverse = false;
								return $scope.filterRelations(operation,
										operation.outcoming, currUid, currMode,
										reverse);
							};

							$scope.filterIncomingNgt = function(operation) {
								var currMode = $scope.ngDialogData.mode;
								var currUid = $scope.resolveOperationCurrUID();
								var reverse = true;
								return $scope.filterRelations(operation,
										operation.outcoming, currUid, currMode,
										reverse);
							};

							$scope.filterOutcoming = function(operation) {
								var currMode = $scope.ngDialogData.mode;
								var currUid = $scope.resolveOperationCurrUID();
								var reverse = false;
								return $scope.filterRelations(operation,
										operation.incoming, currUid, currMode,
										reverse);
							};

							$scope.filterOutcomingNgt = function(operation) {
								var currMode = $scope.ngDialogData.mode;
								var currUid = $scope.resolveOperationCurrUID();
								var reverse = true;
								return $scope.filterRelations(operation,
										operation.incoming, currUid, currMode,
										reverse);
							};

							$scope.moveBehavior = function(src, dest, type,
									flag, currUid) {
								$scope.ngDialogData.cStatus = "InProgress";
								angular
										.forEach(
												src,
												function(opsUid, i) {
													angular
															.forEach(
																	dest,
																	function(
																			operation,
																			i) {
																		// For
																		// Incoming
																		// Mapping.
																		if (operation.uid == opsUid) {
																			if (type == "incoming") {
																				if (flag) {
																					operation.outcoming
																							.push(currUid);
																				} else {
																					operation.outcoming
																							.splice(
																									operation.outcoming
																											.indexOf(currUid),
																									1);
																				}
																				/*
																				 * if
																				 * (operation.uid ==
																				 * currUid) {
																				 * if(flag) {
																				 * operation.incoming.push(currUid); }
																				 * else { } }
																				 */
																			}
																			// For
																			// Outcoming
																			// Mapping.
																			if (type == "outcoming") {
																				if (flag) {
																					operation.incoming
																							.push(currUid);
																				} else {
																					operation.incoming
																							.splice(
																									operation.incoming
																											.indexOf(currUid),
																									1);
																				}
																			}
																		}
																	});
												});
							};

							$scope.createMoveInRight = function() {
								var currUid = $scope.resolveOperationCurrUID();
								if ($scope.ops.InBefore != null) {
									$scope.moveBehavior($scope.ops.InBefore,
											$scope.graphOperation(),
											'incoming', true, currUid);
								}
							};

							$scope.createMoveInLeft = function() {
								var currUid = $scope.resolveOperationCurrUID();
								if ($scope.ops.InAfter != null) {
									$scope.moveBehavior($scope.ops.InAfter,
											$scope.graphOperation(),
											'incoming', false, currUid);
								}
							};

							$scope.createMoveOutRight = function() {
								var currUid = $scope.resolveOperationCurrUID();
								if ($scope.ops.OutBefore != null) {
									$scope.moveBehavior($scope.ops.OutBefore,
											$scope.graphOperation(),
											'outcoming', true, currUid);
								}
							};

							$scope.createMoveOutLeft = function() {
								var currUid = $scope.resolveOperationCurrUID();
								if ($scope.ops.OutAfter != null) {
									$scope.moveBehavior($scope.ops.OutAfter,
											$scope.graphOperation(),
											'outcoming', false, currUid);
								}
							};

							$scope.redrawGraph = function() {
								// $timeout($window.reloadGraph(),100);
								$window.reloadGraph();
							}

							$scope.httpPost = function(cquery) {
								var url = "/sg/cquery/" + cquery;
								AppService.syncInvoke(url);

								/*
								 * var deferred = $q.defer();
								 * 
								 * $http.get(url).success( function(response,
								 * status, headers, config) {
								 * deferred.resolve(response);
								 * }).error(function(errResp) {
								 * deferred.reject({ message : "Really bad" });
								 * });
								 * 
								 * $scope.httpData = deferred.promise; return
								 * deferred.promise;
								 */
							};

						} ]);
