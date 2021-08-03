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
define(['knockout', 'appController', 'ojs/ojmodule-element-utils', 'ojs/ojcontext', 'accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojvalidation-base', 'ojs/ojmodule-element-utils',"ojs/ojarraydataprovider",
    'ojs/ojbutton', 'ojs/ojpopup', 'ojs/ojswitch',
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset',"ojs/ojprogress-circle",
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojprogress', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojcollectiontreedatasource', 'ojs/ojarraytreedataprovider', 'ojs/ojinputtext', 'ojs/ojinputsearch'],
        function (ko, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils,ArrayDataProvider) {
            function CustomersViewModel($params) {
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.status = ko.dataFor(document.getElementById('globalBody')).status;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.vehicle = ko.observable({id: 0, barcode: {id: 0, code: ''}, registrationNumber: '', contact: '', driver: '',
                    updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), fuel: {id: 0, name: ''}, updatedby: {id: 0, name: ''}});
                self.vehicleArrayList = ko.observableArray([]);
                self.saleArrayList = ko.observableArray([]);
                self.vehicleFilter = ko.observable();
                self.addVisibility = ko.observable(false);
                self.updateVisibility = ko.observable(false);
                self.datasource = ko.observable();
                self.saleDatasource = ko.observable();
                self.selectedSale = ko.observable();
                self.totalAmount = ko.observable(0);
                self.totalQty = ko.observable(0);
                self.isRequired = ko.observable(true);
                self.isHelpSource = ko.observable(true);
                self.isHelpDef = ko.observable(true);
                self.progressVisibility = ko.observable(false);
                self.searchOption = ko.observable('Search');
                self.searchOptionDatasource = ko.observable();
                self.ModuleElementUtils = ModuleElementUtils;
                self.fuelOptionArrayList = ko.observableArray([]);
                
              self.fuelOptions = new ArrayDataProvider(self.fuelOptionArrayList, {
                  keyAttributes: "value"
              });

                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });

//                 var subscriptionVehicle = self.vehicle.subscribe(
//                        function () {
//                            self.getVehicleList();
//                            self.toggleVehicleDrawer('end','');
//                        }
//                );


                self.columnArray = [
                    {"headerText": "Code"},
                    {"headerText": "RegistrationNo"},
                    {"headerText": "Driver"},
                    {"headerText": "Fuel"},
                    {"headerText": "Consumption"}
                ];
                self.saleColumnArray = [
                    {"headerText": "Date"},
                    {"headerText": "Unitcost"},
                    {"headerText": "Amount"},
                    {"headerText": "Station"}
                ];

                self.getSelectedVehicle = function (data) {
                    self.toggleVehicleDrawer('end');
                    self.vehicle(data);
                    self.progressVisibility(true);
                    var totalAmt = 0;
                    var totalQty = 0;
                    
                    
                    
                    var url = self.serviceURL + '/sale/search/vehicle';
                    var json_object = {vehicle: {id:self.vehicle().id}};
                        $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(json_object),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            self.saleArrayList.removeAll();
                            $.each(res.data, function () {
                                    var vehicle = {
                                        id: this.id,
                                        unitcost: this.unitcost.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                                        quantity: this.quantity,
                                        amount: this.amount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
                                        createdon: this.createdOn ? this.createdOn.split('T')[0] : "",
                                        fuel: this.fuel,
                                        station: this.station,
                                        createdby: this.createdBy,
                                        vehicle: this.vehicle
                                    };
                                    totalAmt = totalAmt + this.amount;
                                    totalQty = totalQty + this.quantity;
                                    self.saleArrayList().push(vehicle);
                                });
                                self.totalQty(totalQty.toFixed(2));
                                self.totalAmount(totalAmt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                
                                self.saleDatasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(self.saleArrayList, {idAttribute: 'id'})));
                            self.progressVisibility(false);
                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Getting Vehicle Sales  Failed'});
                            console.log(errorThrown);
                        }
                    });
                    
                    
                };
                
                
                self.getSelectedSale = function(saleData){
                   self.selectedSale(saleData);
                    document.querySelector('#salePreviewPopup').open();
                    
                };
                
                
                
                self.setFuel = function(event){
                    if(typeof event.detail.data!=='undefined'){
                        self.vehicle().fuel = {id:event.detail.data.value,name:event.detail.data.label};
                        self.vehicle(self.vehicle());
                    }
                    
                };

                self.updateFueltype = function () {
                    document.querySelector('#progressDialogue').open();
                        var url = self.serviceURL + '/vehicle/crud/update';
                    self.progressVisibility(true);
                    var json_object = {id:self.vehicle().id,registrationNumber: self.vehicle().registrationNumber, fuel: {id: self.vehicle().fuel.id},
                        barcode: {id: self.vehicle().barcode.id},updatedby:{id:self.user().id}, contact: self.vehicle().contact, driver: self.vehicle().driver};
                        $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(json_object),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            self.progressVisibility(false);
                            self.getVehicleList();
                             document.querySelector('#progressDialogue').close();
                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                             document.querySelector('#progressDialogue').close();
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'updating Vehicle Failed'});
                            console.log(errorThrown);
                        }
                    });

                };


                self.closeVehiclePopUp = function () {
                    document.querySelector('#vehiclePopup').close();
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
                self.toggleVehicleDrawer = function (param) {

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

                self.getVehicleSaleList = function () {
                    self.progressVisibility(true);
                    var url = self.serviceURL + '/sale/search/vehicle';
                    $.getJSON(url).
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle = {
                                        id: this.id,
                                        barcode: this.barcode,
                                        registrationNumber: this.registrationNumber,
                                        fuel: this.fuel,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : "",
                                        contact: this.contact,
                                        driver: this.driver,
                                        updatedby: this.updatedby
                                    };
                                    self.vehicleArrayList().push(vehicle);
                                });
                                self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'})));
                            });
                };
                
                
                self.getVehicleList = function () {
                    self.progressVisibility(true);
                    var url = self.serviceURL + '/vehicle/all';
                    $.getJSON(url).
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle = {
                                        id: this.id,
                                        barcode: this.barcode,
                                        registrationNumber: this.registrationNumber,
                                        fuel: this.fuel,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : "",
                                        contact: this.contact,
                                        driver: this.driver,
                                        updatedby: this.updatedby
                                    };
                                    self.vehicleArrayList().push(vehicle);
                                });
                                self.datasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
                            });
                };


                self.getFuellist = function () {
                    $.getJSON(self.serviceURL + '/stock/fuel/all').
                            then(function (returnedData) {
                                self.fuelOptionArrayList.removeAll();
                                $.each(returnedData, function () {
                                    self.fuelOptionArrayList().push({value: this.id, label: this.name});
                                });
                                self.searchOptionDatasource(new ArrayDataProvider(self.fuelOptionArrayList(), {keyAttributes: "value"}));
                            });

                };



                self.handleVehicleChanged = function (event) {
                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearVehicleClick();
                        return;
                    }
                    var vehicleArray = [];
                    var i;
                    for (i = self.vehicleArrayList.length; i >= 0; i--)
                    {
                        self.vehicleArrayList().forEach(function (value) {
                            if ((value['registrationNumber'].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (vehicleArray.indexOf(self.vehicleArrayList[i]) < 0)
                                {
                                    var vehicle_obj = {
                                        id: value['id'],
                                        registrationNumber: value['registrationNumber'],
                                        barcode: value['barcode'],
                                        fuel: value['fuel'],
                                        updatedon: value['updatedon'],
                                        updatedby: value['updatedby'],
                                        driver: value['driver'],
                                        contact: value['contact']
                                    };
                                    vehicleArray.push(vehicle_obj);
                                }
                            }
                        });
                    }
                    vehicleArray.reverse();
                    self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(vehicleArray, {idAttribute: 'id'})));
                };

                self.clearVehicleClick = function (event) {
                    self.vehicleFilter('');
                    self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'})));
                    return true;
                };


                self.selectItemPopUp = function (param) {
                    switch (param) {

                        case "adminlevelopen":
                            document.querySelector('#adminLevelPopup').open();
                            break;

                        default:
                            break;
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
                    accUtils.announce('Vehicle page loaded.', 'assertive');
                    document.title = "Vehicle";
                    self.getVehicleList();
                    self.getFuellist();
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
            return CustomersViewModel;
        }
);
