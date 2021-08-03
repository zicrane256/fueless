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
            function RolelistViewModel($params) {
                'use strict';
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.userRole = ko.observable();
                self.roleFilter = ko.observable();
                self.roleArrayList = ko.observableArray();
                self.selectedItems = ko.observable([]);
//                if ($params && $params.selectedStation) {
//                    self.station = $params.station;
//                }
                self.datasource = ko.observable();
                self.columnArray = [
                    {"headerText": "Name"},
                    {"headerText": "Select"}
                ];

                self.getSelectedRole = function (data) {
                    var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                        rootViewModel.selectedRole(data);
                };
              
            

                self.getUserroleList = function () {
                    var url = self.serviceURL + '/user/userrole/all';
                    $.getJSON(url).
                            then(function (data) {
                                self.roleArrayList.removeAll();
                                $.each(data, function () {
                                    var role_obj = {
                                        id: this.id,
                                        name: this.name};
                                    self.roleArrayList().push(role_obj);
                                });
                               self.datasource(new oj.ArrayTableDataSource(self.roleArrayList, {idAttribute: 'id'}));
                            });
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
                    self.getUserroleList();
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
            return RolelistViewModel;
        }
);
