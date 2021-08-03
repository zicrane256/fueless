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
define(['knockout',"ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-number", "ojs/ojasyncvalidator-numberrange", 'appController', 'ojs/ojmodule-element-utils', 'ojs/ojcontext', 'accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojvalidation-base', 'ojs/ojmodule-element-utils', "ojs/ojarraydataprovider",
    'ojs/ojbutton', 'ojs/ojpopup', 'ojs/ojswitch',
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset', "ojs/ojprogress-circle", 'ojs/ojdatetimepicker',
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojprogress', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox", 'ojs/ojswitcher',
    'ojs/ojtable', 'ojs/ojrowexpander', 'ojs/ojflattenedtreetabledatasource', 'ojs/ojmodel', 'ojs/ojjsontreedatasource',
    'ojs/ojcollectiontabledatasource', 'ojs/ojarraydataprovider', 'ojs/ojcollectiontreedatasource', 'ojs/ojinputtext', 'ojs/ojinputsearch'],
        function (ko,Bootstrap, AsyncRegExpValidator, ojconverter_number_1, AsyncNumberRangeValidator, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider) {
            function StationViewModel($params) {
                var self = this;
                self.sessionUser = ko.dataFor(document.getElementById('globalBody')).user;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.station = ko.observable({id: 0, name: '', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date())});
                self.stationArrayList = ko.observableArray([]);
                self.stationFilter = ko.observable();
                self.datasource = ko.observable();
                self.optionDatasource = ko.observable();
                self.isRequired = ko.observable(true);
                self.isHelpSource = ko.observable(true);
                self.isHelpDef = ko.observable(true);
                self.latitude = ko.observable(0.0000);
                self.longtude = ko.observable(0.0000);
                self.progressVisibility = ko.observable(false);
                self.addButtonVisibility = ko.observable(true);
                self.updateButtonVisibility = ko.observable(false);
                self.searchOption = ko.observable('Search');
                self.selectedItem = ko.observable('stationlist');
                self.selectedItemHeader = ko.observable('main');
                self.selectedItemFooter = ko.observable('main');
                self.header = ko.observable('Add Station');
                self.searchOptionDatasource = ko.observable();
                self.ModuleElementUtils = ModuleElementUtils;
                self.crudOptionArrayList = ko.observableArray([{id: 'CREATE', label: 'Create'},
                    {id: 'UPDATE', label: 'Save Changes'}, {id: 'DELETE', label: 'Delete'}, {id: 'CLOSE', label: 'Exit'}
                ]);
                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });



                self.getSelectedStation = function (station) {
                    self.station(station);
                    self.header(station.name);
                    self.updateButtonVisibility(true);
                    self.addButtonVisibility(false);
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('edit');
                    self.toggleStationDrawer('end', 'update');
                };



                self.checkedState = {};
                self.checkedState['start'] = ko.observableArray([]);
                self.checkedState['end'] = ko.observableArray([]);
                // toggle checked/unchecked launch buttons
                this.toggleButton = function (edge)
                {
                    self.checkedState[edge](self.checkedState[edge]().length ? [] : [edge]);
                };

                self.isSmall = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(
                        oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));

                // For small screens: labels on top
                // For medium screens and up: labels inline
                self.labelEdge = ko.computed(function () {
                    return this.isSmall() ? "top" : "start";
                }, this);

                this.isModal = ko.observableArray(["modeless"]);
                this.modalityValue = ko.computed(function ()
                {
                    return self.isModal().length ? "modal" : "modeless";
                }, self);

                this.displayModeValue = ko.observable("none");

                self.checkedState = {};
                self.isModal = ko.observableArray(["modeless"]);
                self.modalityValue = ko.computed(function ()
                {
                    return self.isModal().length ? "modal" : "modeless";
                }, self);

                self.displayModeValue = ko.observable("none");
                self.offcanvasMap = ko.computed(function ()
                {
                    return {
                        "end": {
                            "selector": "#endDrawer",
                            "content": "#mainContent",
                            "modality": self.modalityValue()
                        }

                    };
                }, self);

                var logMessage = function (message) {
                    console.log(message);
                };

                // toggle show/hide offcanvas
                self.toggle = ko.observable(false);
                self.toggleStationDrawer = function (param, option) {
                    self.progressVisibility(false);
                    switch (option) {
                        case 'add':
                            self.station({id: 0, name: '', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                                station: 1});
                            self.addButtonVisibility(true);
                            self.updateButtonVisibility(false);
                             self.selectedItemHeader('edit');
                            break;
                        case 'update':
                            self.addButtonVisibility(false);
                            self.updateButtonVisibility(true);
                            break;
                        case 'stationlist':
                            self.selectedItem('stationlist');
                            self.selectedItemHeader('main');
                            break;
                        default:
                            break;

                    }
                    var drawer = self.offcanvasMap()[param];
                    drawer.edge = param;
                    var displayMode = self.displayModeValue();

                    if (displayMode === "none")
                        delete drawer.displayMode;
                    else
                        drawer.displayMode = displayMode;
                    // if it's the active offcanvas, close it
                    if (drawer === self._activeOffcanvas) {
                        return self.closeDrawer(drawer).catch(logMessage);
                    }
                    // if there is no active offcanvas, open it
                    else if (!self._activeOffcanvas) {
                        return self.openDrawer(drawer);
                    }
                    // if there is another open offcanvas, close it first 
                    // and then open this offcanvas
                    else {
                        return self.closeDrawer(self._activeOffcanvas)
                                .then(function () {
                                    // show offcanvas in the viewport
                                    return self.openDrawer(drawer);
                                })
                                .catch(logMessage);
                    }
                };

                // show offcanvas in the viewport
                self.openDrawer = function (drawer) {
                    self._activeOffcanvas = drawer;
                    return oj.OffcanvasUtils.open(drawer);
                };

                self.closeDrawer = function (drawer) {
                    self._activeOffcanvas = null;
                    return oj.OffcanvasUtils.close(drawer);
                };

                //add a close listener so when a offcanvas is autoDismissed we can synchronize the page state.
                $("#endDrawer").on("ojclose", function () {
                    if (self._activeOffcanvas)
                        self.checkedState[self._activeOffcanvas.edge]([]);
                    self._activeOffcanvas = null;
                });



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
                    var optionArray = [];
//                    var url = self.serviceURL + '/station/all';
                    var url = self.serviceURL + '/station/' + self.sessionUser().station.id;
                    $.getJSON(url).
                            then(function (data) {
                                self.stationArrayList.removeAll();
                                $.each(data, function () {
                                    var station_obj = {
                                        id: this.id,
                                        name: this.name,
                                        latitude: this.latitude,
                                        longtude: this.longtude,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : ""
//                                        parent: {id: this.parent ? this.parent.id : null}
                                    };
                                    if (this.parent) {
                                        let station = self.stationArrayList().find(s => s.id === this.parent.id);
                                        if (typeof station !== 'undefined') {
                                            station_obj.parent = this.parent;
                                        } else {
                                            var parent = {id: null};
                                            station_obj.parent = parent;
                                        }
                                    } else {
                                        var parent = {id: null};
                                        station_obj.parent = parent;
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
                    optionArray.push({id: 1, option: 'Create'});
                    optionArray.push({id: 2, option: 'Save'});
                    optionArray.push({id: 3, option: 'Delete'});
                    optionArray.push({id: 4, option: 'Cancel'});
                    self.optionDatasource(new oj.ArrayTableDataSource(optionArray));
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
                                        latitude: value['latitude'],
                                        longtude: value['longtude'],
                                        updatedon: value['updatedon'],
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
                            new oj.FlattenedTreeDataSource(treeDataSource, options)));
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
                            new oj.FlattenedTreeDataSource(treeDataSource, options)));
                    return true;
                };



                self.addStation = function () {
                    if (self.stationNameValid() === 'valid') {
                        var url = self.serviceURL + '/station/crud/create';
                    self.progressVisibility(true);
                    if (self.station().name) {
                        var json_object = {name: self.station().name, latitude: self.station().latitude,
                            longtude: self.station().longtude, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                            updatedby: {id: self.user().id},parent :{id:self.user().station.id}};
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(json_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                self.toggleStationDrawer('end', '');
                                self.getStationList();
                                self.progressVisibility(false);
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                self.progressVisibility(false);
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Station Failed'});
                                console.log(errorThrown);
                            }
                        });
                    }
                        
                        
                    }else{
                      let stationname = document.getElementById("name");
                       stationname.showMessages();  
                        
                    }
                    

                };

                self.showEditDialog = function () {
                    document.getElementById("editDialog").open();
                };

                self.cancelStationMapping = function () {
                    self.toggleStationDrawer('end');
                };

                self.confirmPosition = function () {
                    self.toggleStationDrawer('end');
                    self.station().latitude = self.latitude();
                    self.station().longtude = self.longtude();
                    self.station(self.station());

                };

                self.showMappingView = function () {
                    self.toggleStationDrawer('end');
                    self.selectedItem('map');
                     setTimeout(function () {
                        self.getMylocation();
                    }, 1000);
                    self.selectedItemFooter('map');
                    self.selectedItemHeader('map');
                };
                
                self.closeMappingView = function () {
                    self.toggleStationDrawer('end');
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('edit');
                };
                
                self.showSearch = function () {
                    self.selectedItemHeader('search');
                };
                
                self.showMain = function () {
                    self.selectedItemHeader('main');
                    setTimeout(function () {
                        self.stationFilter('');
                    }, 2000);
                };


                self.getMylocation = function () {
                    var div = document.getElementById("googleMap");
                    var map = plugin.google.maps.Map.getMap(div);
                    var data = [];
                    self.stationArrayList().forEach(function (station) {
                        if (station.latitude > 0) {
                            data.push({
                                position: {lng: station.longtude, lat: station.latitude},
                                title: station.name,
                                'icon': {'url': 'css/images/gas-station.png'}
                            });
                        }
                    });
                    map.one(plugin.google.maps.event.MAP_READY, function () {
                        var onSuccess = function (location) {
                            self.latitude(location.latLng.lat);
                            self.longtude(location.latLng.lng);
                            var msg = [self.sessionUser().name+"\n",
                                "latitude:" + location.latLng.lat,
                                "longitude:" + location.latLng.lng].join("\n");
                            data.push({
                                position: {lng: location.latLng.lng, lat: location.latLng.lat},
                                title: msg
                            });
                            // Add markers
                            var baseArrayClass = new plugin.google.maps.BaseArrayClass(data);

                            baseArrayClass.map(function (options, cb) {
                                // The variable "options" contains each element of the data.
                                //
                                // The variable "cb" is a callback function of iteration.
                                map.addMarker(options, cb);

                            }, function (markers) {
                                // Set a camera position that includes all markers.
                                var bounds = [];
                                data.forEach(function (POI) {
                                    bounds.push(POI.position);
                                });
                                map.animateCamera({
                                    target: bounds,
                                    zoom: 15
                                }, function () {
                                    markers[markers.length - 1].showInfoWindow();
                                });

//                                map.moveCamera({
//                                    target: bounds,
//                                    zoom: 15
//                                }, function () {
//                                    // After camera moves open the last marker.
//                                    markers[markers.length - 1].showInfoWindow();
//                                });

                            });
//                            map.addMarker({
//                                'position': location.latLng,
//                                'title': msg,
//                                'icon': {'url': 'css/images/login2.png'}
//                            }, function (marker) {
//                                marker.showInfoWindow();
//                                map.animateCamera({
//                                    target: location.latLng,
//                                    zoom: 15
//                                }, function () {
//                                    marker.showInfoWindow();
//                                });
//                            });
//                            
                        };
                        var onError = function (msg) {
                            alert(JSON.stringify(msg));
                        };
                        var button = div.getElementsByTagName('button')[0];
                        button.addEventListener('click', function () {
                            map.clear();
                            var options = {
                                enableHighAccuracy: true  // Set true if you want to use GPS. Otherwise, use network.
                            };
                            map.getMyLocation(options, onSuccess, onError,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
                        });
                    });
                };




                self.crudStation = function (data) {
                    document.getElementById("editDialog").close();
                    switch (data.option) {
                        case 'Create':
                            var url = self.serviceURL + '/station/crud/create';
                            var json_object = {name: self.station().name, latitude: self.station().latitude, longtude: self.station().longtude,
                                updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                                parent: {id: self.station().id}
                            };
                            self.crudStationData(json_object, url);
                            break;
                        case 'Save':
                            var url = self.serviceURL + '/station/crud/update';
                            var json_object = {id: self.station().id, name: self.station().name, latitude: self.station().latitude, longtude: self.station().longtude,
                                updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date())};
                            if (self.station().parent.id !== null) {
                                json_object.parent = {id: self.station().parent.id};
                            }
                            self.crudStationData(json_object, url);
                            break;
                        case 'Delete':
                            var url = self.serviceURL + '/station/crud/delete';
                            self.crudStationData({id: self.station().id}, url);
                            break;
                        default:
                            self.toggleStationDrawer('end', '');
                            document.getElementById("editDialog").close();
                            break;
                    }
                };

                self.crudStationData = function (data, url) {
                    
                    if (self.stationNameValid() === 'valid') {
                        
                         self.progressVisibility(true);
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(data),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            self.toggleStationDrawer('end', '');
                            self.getStationList();
                            self.progressVisibility(false);
                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                            self.progressVisibility(false);
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Station Failed'});
                            console.log(errorThrown);
                        }
                    });
                        
                    }else{
                        let stationname = document.getElementById("name");
                       stationname.showMessages();
                    }
                };
                
                
                self.stationNameValid = ko.observable("valid");
                self.stationNameRequired = ko.observable(true);
            
                self.textValidators = [
                    new AsyncRegExpValidator({
                        pattern: "[a-zA-Z0-9]{3,}",
                        messageDetail: "Enter at least 3 letters "
                    })
                ];


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
                    accUtils.announce('Station page loaded.', 'assertive');
                    document.title = "Station Management";
                    self.getStationList();
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
            return StationViewModel;
        }
);
