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
define(['knockout', "ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-number", "ojs/ojasyncvalidator-numberrange", 'appController', 'ojs/ojmodule-element-utils', 'ojs/ojcontext', 'accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojvalidation-base', 'ojs/ojmodule-element-utils', "ojs/ojarraydataprovider",
    'ojs/ojbutton', 'ojs/ojpopup',
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset', "ojs/ojprogress-circle", 'ojs/ojdatetimepicker',
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojdefer', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojtable', 'ojs/ojrowexpander', 'ojs/ojflattenedtreetabledatasource', 'ojs/ojmodel', 'ojs/ojjsontreedatasource',
    'ojs/ojcollectiontabledatasource', 'ojs/ojinputtext', 'ojs/ojinputsearch', 'ojs/ojnavigationlist', 'ojs/ojswitcher'],
        function (ko, Bootstrap, AsyncRegExpValidator, ojconverter_number_1, AsyncNumberRangeValidator, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider) {
            function FuelViewModel($params) {
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.selectedStation = ko.dataFor(document.getElementById('globalBody')).selectedStation;
                self.status = ko.dataFor(document.getElementById('globalBody')).status;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.fuel = ko.observable({id: 0, name: '', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    quantity: 0, updatedby: {id: 0, name: ''}});
                self.fuelStation = ko.observable({id: 0, sellingPrice: 0, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    station: {id: 0}, fuel: {id: 0}, updatedby: {id: 0, name: ''}});
                self.fuelArrayList = ko.observableArray([]);
                self.stationArrayList = ko.observableArray([]);
                self.stationFilter = ko.observable();
                self.datasource = ko.observable();
                self.fuelDatasource = ko.observable();
                self.isRequired = ko.observable(true);
                self.isHelpSource = ko.observable(true);
                self.isHelpDef = ko.observable(true);
                self.progressVisibility = ko.observable(false);
                self.addButtonVisibility = ko.observable(true);
                self.updateButtonVisibility = ko.observable(false);
                self.searchOption = ko.observable('Search');
                self.ModuleElementUtils = ModuleElementUtils;
                self.selectedItemHeader = ko.observable('main');
                self.selectedItemFooter = ko.observable('main');
                self.header = ko.observable('Add Fuel Type');
                self.selectedItem = ko.observable("fuel");
                self.selectedItemEdit = ko.observable("fuel");
                self.optionDatasource = ko.observable();
                self.crudOptionArrayList = ko.observableArray([
                    {id: 'UPDATE', label: 'Save Changes'}, {id: 'DISABLE', label: 'Disable'}, {id: 'DELETE', label: 'Delete'}, {id: 'CLOSE', label: 'Exit'}
                ]);

                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });


                self.fuelPrices = ko.dataFor(document.getElementById('globalBody')).fuelPrices;
                var fuelPriceSubscription = self.fuelPrices.subscribe(
                        function () {
                            self.getFuelStationList();
                        }
                );


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
                self.toggleFuelStationDrawer = function (param, option) {
                    switch (option) {
                        case 'fuelupdate':
                            self.addButtonVisibility(false);
                            self.updateButtonVisibility(true);
                            self.selectedItemEdit('fuel');
                            self.selectedItemHeader('edit');
                            break;
                        case 'addfuel':
                            self.addButtonVisibility(true);
                            self.updateButtonVisibility(false);
                            self.selectedItemEdit('fuel');
                            self.selectedItemHeader('edit');
                            self.header('add Fuel Type');
                            self.fuel({id: 0, name: '', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                                quantity: 0, updatedby: {id: 0, name: ''}});
                            break;
                        case 'add':
                            self.fuelStation({id: 0, sellingPrice: 0, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                                station: {id: 0}, fuel: {id: 0}, updatedby: {id: 0, name: ''}});
                            self.addButtonVisibility(true);
                            self.updateButtonVisibility(false);
                            break;
                        case 'update':
                            self.fuelStation().updatedby = self.user();
                            self.fuelStation().updatedon = oj.IntlConverterUtils.dateToLocalIso(new Date());
                            self.addButtonVisibility(false);
                            self.updateButtonVisibility(true);
                            self.selectedItemEdit('fuelstation');
                            self.selectedItemHeader('edit');
                            break;
                        default:
                            self.selectedItemHeader('main');
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

                self.openFuelPopUp = function () {
                    document.querySelector('#fuelPopup').open();
                };
                self.closeFuelPopUp = function () {
                    document.querySelector('#fuelPopup').close();
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


                self.getFuellist = function () {
                    var optionArray = [];
                    $.getJSON(self.serviceURL + '/stock/fuel/all').
                            then(function (returnedData) {
                                self.fuelArrayList.removeAll();
                                $.each(returnedData, function () {
                                    var fuel = {
                                        id: this.id,
                                        name: this.name,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : "",
                                        updatedby: this.updatedby
                                    };
                                    self.fuelArrayList().push(fuel);
                                });
                                self.fuelDatasource(new oj.ArrayTableDataSource(self.fuelArrayList, {idAttribute: 'id'}));
                                optionArray.push({id: 1, option: 'Save'});
                                optionArray.push({id: 2, option: 'Delete'});
                                optionArray.push({id: 3, option: 'Cancel'});
                                self.optionDatasource(new oj.ArrayTableDataSource(optionArray));
                            });

                };




                self.getFuelStationList = function () {
                    var stationArray = [];
                    var fuelStationArray = [];
                    var filteredStationArray = [];
                    var filterCounter = 0;
                    var url = self.serviceURL + '/station/fuelstation/'+self.user().station.id;
                    $.getJSON(url).
                            then(function (data) {
                                self.stationArrayList.removeAll();
                                $.each(data, function () {
                                    var fuelstation = {
                                        id: this.id,
                                        station: this.station,
                                        fuel: this.fuel,
                                        sellingPrice: this.sellingPrice,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : "",
                                        updatedby: this.updatedby
                                    };
                                    self.stationArrayList().push(fuelstation);
                                });
                                var stationurl = self.serviceURL + '/station/' + self.user().station.id;
                                $.getJSON(stationurl).
                                        then(function (data) {
                                            $.each(data, function () {
                                                var station_obj = {
                                                    id: this.id,
                                                    name: this.name,
                                                    updatedon: this.updatedon ? this.updatedon.split('T')[0] : "",
                                                    parent: {id: this.parent ? this.parent.id : null}};
                                                stationArray.push(station_obj);
                                            });

                                            stationArray.forEach(function (station) {
                                                self.fuelArrayList().forEach(function (fuel) {
                                                    var fuelstation_object = {id: station.id, station: station, fuel: fuel};
                                                    fuelStationArray.push(fuelstation_object);
                                                });
                                            });


                                            fuelStationArray.forEach(function (station) {
                                                filterCounter = 0;
                                                self.stationArrayList().forEach(function (fuelstation) {
                                                    if (station.station.id === fuelstation.station.id &&
                                                            station.fuel.id === fuelstation.fuel.id) {
                                                        filterCounter++;
                                                        var station_object = {id: fuelstation.station.id, station: fuelstation.station, fuel: fuelstation.fuel,
                                                            sellingPrice: fuelstation.sellingPrice, updatedon: fuelstation.updatedon, updatedby: fuelstation.updatedby, flag: 1};
                                                        if (station_object.station.parent) {
                                                            station_object.parent = station_object.station.parent;
                                                        }
                                                        filteredStationArray.push(station_object);
                                                    }

                                                });

                                                if (filterCounter < 1) {
                                                    var station_object = {id: station.station.id, station: station.station, fuel: station.fuel,
                                                        sellingPrice: 0, flag: 2, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()).split('T')[0]};
                                                    if (station_object.station.parent) {
                                                        station_object.parent = station_object.station.parent;
                                                    }
                                                    filteredStationArray.push(station_object);
                                                }
                                            });
                                            self.stationArrayList(filteredStationArray);
                                            self.datasource(new oj.ArrayTableDataSource(self.stationArrayList, {idAttribute: 'id'}));
                                        });
                            });
                };

                self.eatNonNumbers = function (event) {
                    var charCode = (event.which) ? event.which : event.keyCode;
                    var char = String.fromCharCode(charCode);
                    var replacedValue = char.replace(/[^0-9\.]/g, '');
                    if (char !== replacedValue) {
                        event.preventDefault();
                    }
                };


                self.getSelectedFuel = function (fuel) {
                    self.toggleFuelStationDrawer('end', 'fuelupdate');
                    self.fuel(fuel);
                    self.header(fuel.name);
                };

                self.getSelectedFuelStation = function (Fuelstation) {
                    self.toggleFuelStationDrawer('end', 'update');
                    self.header(Fuelstation.station.name);
                    self.fuelStation(Fuelstation);

                };



                self.handleFuelStationChanged = function (event) {
                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearFuelStationClick();
                        return;
                    }
                    var fuelStationArray = [];
                    var i;
                    for (i = self.stationArrayList.length; i >= 0; i--)
                    {
                        self.stationArrayList().forEach(function (value) {
                            if ((value['fuel'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['station'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (fuelStationArray.indexOf(self.stationArrayList[i]) < 0)
                                {
                                    var station_obj = {
                                        id: value['id'],
                                        station: value['station'],
                                        fuel: value['fuel'],
                                        sellingPrice: value['sellingPrice'],
                                        updatedon: value['updatedon'],
                                        updatedby: value['updatedby']
                                    };
                                    fuelStationArray.push(station_obj);
                                }
                            }
                        });
                    }
                    fuelStationArray.reverse();
                    self.datasource(new oj.ArrayTableDataSource(fuelStationArray, {idAttribute: 'id'}));
                };

                self.clearFuelStationClick = function (event) {
                    self.stationFilter('');
                    self.datasource(new oj.ArrayTableDataSource(self.stationArrayList, {idAttribute: 'id'}));
                    return true;
                };


                self.updateFuelPrice = function () {
                    if (self.fuelPriceValid() === 'valid') {
                        var url = self.serviceURL + '/station/fuelstation/crud/create';
                    self.progressVisibility(true);
                    var json_object = {station: {id: self.fuelStation().station.id}, fuel: {id: self.fuelStation().fuel.id},
                        sellingPrice: self.fuelStation().sellingPrice, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                        updatedby: {id: self.user().id}};
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(json_object),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            self.getFuelStationList();
                            self.toggleFuelStationDrawer('end', '');
                            self.progressVisibility(false);
                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                            self.progressVisibility(false);
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Fuel Station Failed'});
                            console.log(errorThrown);
                        }
                    });
                        
                    }else{
                      let amount = document.getElementById("amount");
                        amount.showMessages();  
                        
                    }
                    
                };




                self.addFuelType = function () {
                    if (self.fuelNameValid() === 'valid') {
                        var url = self.serviceURL + '/stock/crud/create';
                        self.progressVisibility(true);
                        var json_object = {name: self.fuel().name, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                            updatedby: {id: self.user().id}};
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(json_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                self.getFuellist();
                                self.toggleFuelStationDrawer('end', '');
                                self.progressVisibility(false);
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                var popup = document.getElementById('progressDialogue');
                                popup.close();
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Fuel Type Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {
                        let fuelname = document.getElementById("fuelname");
                        fuelname.showMessages();
                    }
                };


                self.showEditDialog = function () {
                    document.getElementById("editDialog").open();
                };

                self.crudFuel = function (data) {
                    document.getElementById("editDialog").close();
                    switch (data.id) {
                        case 1:
                            var json_object = {id: self.user().id, station: {id: self.user().station.id}, name: self.user().name, contact: self.user().contact,
                                userrole: {id: self.user().userrole.id},
                                nin: self.user().nin, password: self.user().password, updatedon: self.user().updatedon, status: self.user().status,
                                updatedby: {id: self.sessionUser().id}};
                            var url = self.serviceURL + '/stock/crud/update';
                            self.crudFuelData(json_object, url);
                            break;

                        case 2:
                            var json_object = {id: self.fuel().id};
                            var url = self.serviceURL + '/stock/crud/delete';
                            self.crudFuelData(json_object, url);
                            break;
                        default:

                            break;
                    }
                };



                self.crudFuelData = function (data, url) {

                    if (self.fuelNameValid() === 'valid') {
                        self.progressVisibility(true);
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(data),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                self.getFuellist();
                                self.progressVisibility(false);
                                self.selectedItemHeader('main');
                                self.toggleFuelStationDrawer('end');

                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                self.progressVisibility(false);
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Updating Fuel Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {
                        let fuelname = document.getElementById("fuelname");
                        fuelname.showMessages();
                    }


                };




                self.fuelNameValid = ko.observable("valid");
                self.fuelNameRequired = ko.observable(true);
                self.fuelPriceValid = ko.observable("valid");
                self.fuelPriceRequired = ko.observable(true);

                self.textValidators = [
                    new AsyncRegExpValidator({
                        pattern: "[a-zA-Z0-9]{3,}",
                        messageDetail: "Enter at least 3 letters "
                    })
                ];


                self.priceValidators = [
                    new AsyncRegExpValidator({
                        pattern: "[0-9]{3,}",
                        messageDetail: "Enter at least 3 Numbers "
                    })
                ];
              

                self.eatNonNumbers = (event) => {
                    let charCode = event.which ? event.which : event.keyCode;
                    let char = String.fromCharCode(charCode);
                    // Only allow ".0123456789" (and non-display characters)
                    let replacedValue = char.replace(/[^0-9\.]/g, "");
                    if (char !== replacedValue) {
                        event.preventDefault();
                    }
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
                    accUtils.announce('Fuel loaded.', 'assertive');
                    document.title = "Fuel Station";
                    self.getFuellist();
                    self.getFuelStationList();
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
            return FuelViewModel;
        }
);
