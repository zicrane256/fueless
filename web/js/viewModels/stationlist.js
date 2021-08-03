/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your customer ViewModel code goes here
 */
define(['accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojpopup', 'ojs/ojcollapsible', 'ojs/ojcheckboxset',
    'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojtable', 'ojs/ojrowexpander',
    'ojs/ojflattenedtreetabledatasource', 'ojs/ojmodel', 'ojs/ojjsontreedatasource',
    'ojs/ojcollectiontabledatasource', 'ojs/ojarraydataprovider', 'ojs/ojcollectiontreedatasource', 'ojs/ojinputsearch'],
        function (accUtils, oj, ko, $) {
            function StationlistViewModel($params) {
                'use strict';
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.station = ko.observable();
                self.sessionUser = ko.dataFor(document.getElementById('globalBody')).user;
                self.stationFilter = ko.observable();
                self.stationArrayList = ko.observableArray();
                self.selectedItems = ko.observable([]);

                self.datasource = ko.observable();
                self.columnArray = [
                    {"headerText": "Name"},
                    {"headerText": "Select"}
                ];

                self.getSelectedStation = function (data) {
                    var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                        rootViewModel.selectedStation(data);
                };
              
            
                //row expander and table data functionality here ...
                self.rowExpanderData = ko.observableArray([]);
                var RowData = oj.Model.extend({idAttribute: 'id'});
                self.getChildCollection = function (rootCollection, model) {
                    // create a collection
                    var rowList = new oj.Collection(null, {model: RowData});
                    var parentId = model === null ? null : model.id;
                    // root collection, check where parent is null or undefined
                    for (var i = 0; i < self.rowExpanderData().length; i++) {
                        if (self.rowExpanderData()[i]["parent"].id === parentId) {
                            rowList.add(self.rowExpanderData()[i]);
                        }
                    }
                    return rowList;
                };

                self.parseMetadata = function (model) {
                    function findRowData(id) {
                        if (id) {
                            for (var i = 0; i < self.rowExpanderData().length; i++) {
                                if (id === self.rowExpanderData()[i].id) {
                                    return i;
                                }
                            }
                        }
                        return -1;
                    }
                    ;

                    function findParent(id) {
                        if (id) {
                            for (var i = 0; i < self.rowExpanderData().length; i++) {
                                if (id === self.rowExpanderData()[i]["parent"].id) {
                                    return i;
                                }
                            }
                        }
                        return -1;
                    }
                    ;

                    function countDepth(model, depth) {
                        if (model && model.id) {
                            var parentLoc = findRowData(model.get("parent")["id"]);
                            if (parentLoc > -1) {
                                // I have a parent, increment depth and search for my parent's Model 
                                depth++;
                                return countDepth(
                                        new RowData(self.rowExpanderData()[parentLoc]), depth
                                        );
                            }
                        }
                        return depth;
                    }
                    ;

                    // Look this up in the data table, 
                    // then back out to see depth/leaf
                    var retObj = {};
                    retObj['key'] = model.id;

                    // Does anyone have model.id as a parent id?  If not, it's a leaf
                    var leaf = true;
                    var parentLoc = findParent(model.id);
                    if (parentLoc > -1) {
                        // Not a leaf
                        leaf = false;
                    }
                    retObj['leaf'] = leaf;
                    retObj['depth'] = countDepth(model, 1);
                    return retObj;
                };

                self.getStationList = function () {
//                    var url = self.serviceURL + '/station/all';
                    var url = self.serviceURL + '/station/' + self.sessionUser().station.id;
                    $.getJSON(url).
                            then(function (data) {
                                self.stationArrayList.removeAll();
                                $.each(data, function () {
                                    var station_obj = {
                                        id: this.id,
                                        name: this.name,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : ""
                                    };
                                    if (this.parent) {
                                    let station = self.stationArrayList().find(s => s.id === this.parent.id);
                                       if(typeof station !=='undefined'){
                                          station_obj.parent =  this.parent;
                                       } else{
                                           var parent = {id:null};
                                          station_obj.parent =  parent; 
                                       } 
                                    }else{
                                        var parent = {id:null};
                                          station_obj.parent =  parent;
                                    }
                                    self.stationArrayList().push(station_obj);
                                });
                                self.rowExpanderData(self.stationArrayList());
                                var options = [];
                                var treeDataSource = new oj.CollectionTreeDataSource(
                                        {
                                            root: self.getChildCollection(null, null),
                                            parseMetadata: self.parseMetadata,
                                            childCollectionCallback: self.getChildCollection
                                        });


                                self.datasource(new oj.FlattenedTreeTableDataSource(
                                        new oj.FlattenedTreeDataSource(treeDataSource, options)));

                            });
                };



                self.handleStationValueChanged = function () {
                    var filter = event.target.rawValue;
                    if (filter.length === 0) {
                        self.clearStationClick();
                        return;
                    }
                    var stationArray = [];
                    var i;
                    for (i = self.stationArrayList.length; i >= 0; i--) {
                        self.stationArrayList().forEach(function (value) {
                            if ((value['name'].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) 
                                    ) {
                                if (stationArray.indexOf(self.stationArrayList[i]) < 0) {
                                    var station_obj = {
                                        id: value['id'],
                                        name: value['name'],
                                        parent: {id: value['parent'] ? value['parent'].id : null}
                                    };
                                    stationArray.push(station_obj);
                                }
                            }
                        });
                    }
                    stationArray.reverse();
                    stationArray.forEach(function (value) {
                        var fd = false;
                        if (value.parent !== null) {
                            stationArray.forEach(function (parent) {
                                if (parent.id !== null && value.parent.id === parent.id) {
                                    fd = true;
                                }
                            });
                        }
                        if (fd === false) {
                            value.parent = {id: null};
                        }
                    });
                    self.rowExpanderData(stationArray);
                    var options = [];
                    var treeDataSource = new oj.CollectionTreeDataSource(
                            {
                                root: self.getChildCollection(null, null),
                                parseMetadata: self.parseMetadata,
                                childCollectionCallback: self.getChildCollection
                            });
                    self.datasource(new oj.FlattenedTreeTableDataSource(
                            new oj.FlattenedTreeDataSource(treeDataSource, options))
                            );
                };


                self.clearStationClick = function (event) {
                    self.stationFilter('');
                    self.rowExpanderData(self.stationArrayList());
                    var options = [];
                    var treeDataSource = new oj.CollectionTreeDataSource(
                            {
                                root: self.getChildCollection(null, null),
                                parseMetadata: self.parseMetadata,
                                childCollectionCallback: self.getChildCollection
                            });
                    self.datasource(new oj.FlattenedTreeTableDataSource(
                            new oj.FlattenedTreeDataSource(treeDataSource, options))
                            );
                    return true;
                };

                

                // Below are a set of the ViewModel methods invoked by the oj-module component.
                // Please reference the oj-module jsDoc for additional information.

                /**
                 * Optional ViewModel method invoked after the View is inserted into the
                 * document DOM.  The application can put logic that requires the DOM being
                 * attached here.
                 * This method might be called multiple times - after the View is created
                 * and inserted into the DOM and after the View is reconnected
                 * after being disconnected.
                 */
                self.connected = () => {
//                    accUtils.announce('Activity Detaillist page loaded.', 'assertive');
//                    document.title = "Activity Detaillist";
                    self.getStationList();
//                    self.getActivityDetailList();
                    // Implement further logic if needed
                };

                /**
                 * Optional ViewModel method invoked after the View is disconnected from the DOM.
                 */
                self.disconnected = () => {
                    // Implement if needed
                };

                /**
                 * Optional ViewModel method invoked after transition to the new View is complete.
                 * That includes any possible animation between the old and the new View.
                 */
                self.transitionCompleted = () => {
                    // Implement if needed
                };
            }

            /*
             * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
             * return a constructor for the ViewModel so that the ViewModel is constructed
             * each time the view is displayed.
             */
            return StationlistViewModel;
        }
);
