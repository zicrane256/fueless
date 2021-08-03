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
define(['knockout', 'appController', 'ojs/ojmodule-element-utils', 'ojs/ojcontext', 'accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojvalidation-base', 'ojs/ojmodule-element-utils', "ojs/ojarraydataprovider",
    'ojs/ojbutton', 'ojs/ojpopup', 'ojs/ojswitch',
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset', "ojs/ojprogress-circle",
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojprogress', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojcollectiontreedatasource', 'ojs/ojarraytreedataprovider', 'ojs/ojinputtext', 'ojs/ojinputsearch', 'ojs/ojnavigationlist', 'ojs/ojswitcher'],
        function (ko, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider) {
            function CustomerVehicleViewModel(params) {
                var self = this;
                self.router = params.parentRouter;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.status = ko.dataFor(document.getElementById('globalBody')).status;
                self.network = ko.dataFor(document.getElementById('globalBody')).network;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.customerVehicle = ko.dataFor(document.getElementById('globalBody')).customerVehicle;
                self.vehicle = ko.observable({id: 0, barcode: {id: 0, code: ''}, registrationNumber: '', contact: '', driver: '',
                    updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), fuel: {id: 0, name: ''}, updatedby: {id: 0, name: ''}});
                self.vehicleArrayList = ko.observableArray([]);
                self.userArrayList = ko.observableArray([]);
                self.customerVehicleArrayList = ko.observableArray([]);
                self.barcodeArrayList = ko.observableArray();
                self.saleArrayList = ko.observableArray([]);
                self.stationArrayList = ko.observableArray([]);
                self.fuelArrayList = ko.observableArray();
                self.salehistoryArrayList = ko.observableArray();
                self.vehicleFilter = ko.observable();
                self.addVisibility = ko.observable(false);
                self.updateVisibility = ko.observable(false);
                self.datasource = ko.observable();
                self.saleDatasource = ko.observable();
                self.selectedSale = ko.observable();
                self.totalAmount = ko.observable(0);
                self.totalQty = ko.observable(0);
                self.totalDiscount = ko.observable(0);
                self.customerBarcode = ko.observable();
                self.salesHeader = ko.observable('Sales');
                self.selectedItem = ko.observable('salelist');
                self.isRequired = ko.observable(true);
                self.isRequired = ko.observable(true);
                self.isHelpSource = ko.observable(true);
                self.isHelpDef = ko.observable(true);
                self.progressVisibility = ko.observable(false);
                self.searchOption = ko.observable('Search');
                self.ModuleElementUtils = ModuleElementUtils;
                self.selectedHeader = ko.observable("main");
                const db = window.sqlitePlugin.openDatabase({
                    name: 'jet.db',
                    location: 'default',
                    androidDatabaseProvider: 'system'
                });


                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });




               self.logOut = function(){
                   self.router.go({path: 'login'});
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
                self.toggleVehicleDrawer = function (param, salelistOption) {
                    switch (salelistOption) {
                        case'salelist':
                            self.selectedItem('salelist');
                            self.salesHeader('Sales');
                            self.showSalelistView();
                            
                            break;
                        case'vehiclesale':
                            self.selectedItem('vehiclesale');
                            break;
                        default:
                            self.selectedItem('salelist');
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
                                        createdon: value['createdon'],
                                        createdby: value['createdby'],
                                        driver: value['driver'],
                                        contact: value['contact']
                                    };
                                    vehicleArray.push(vehicle_obj);
                                }
                            }
                        });
                    }
                    vehicleArray.reverse();
                    self.datasource(new oj.ArrayTableDataSource(vehicleArray, {idAttribute: 'id'}));
                };

                self.clearVehicleClick = function (event) {
                    self.vehicleFilter('');
                    self.datasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
                    return true;
                };


               
               self.getCustomerVehicleList = function(){
                    $.getJSON(self.serviceURL + '/vehicle/customer/'+self.customerVehicle().id).
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                 self.vehicleArrayList().push(this);  
                                });
                                self.datasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
                            });
                };
               
                 
                self.getCustomerSales = function () {
                    var totalAmt = 0;
                    var totalQty = 0;
                    var url = self.serviceURL + '/sale/search/customer/vehicle/' + self.customerVehicle().id;
                    $.getJSON(url).
                            then(function (data) {
                                $.each(data, function () {
                                    var sale_history = this;
                                    var sale_object = {id: sale_history.id, quantity: sale_history.quantity, unitcost: sale_history.unitcost.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"), vehicle: sale_history.vehicle,
                                        amount: sale_history.amount, receiptno: sale_history.receiptno, createdby: sale_history.createdBy, fuel: sale_history.fuel, station: sale_history.station, status: sale_history.status
                                    };
                                    sale_object.createdon = sale_history.createdOn ? sale_history.createdOn.split('T')[0] : "";
                                    self.salehistoryArrayList().push(sale_object);
                                });
                            });

                };


                self.getSelectedVehicle = function (data) {
                    self.toggleVehicleDrawer('end', 'vehiclesale');
                    self.vehicle(data);
                    var vehicle_obj = self.vehicle();
                    if (typeof vehicle_obj.parent !== 'undefined') {
                        vehicle_obj.driver = self.vehicle().registrationNumber + '   ' + self.vehicle().fuel.name;
                        self.salesHeader(self.vehicle().registrationNumber);
                    } else {
                        self.salesHeader(self.vehicle().registrationNumber);
                    }
                    var totalAmt = 0;
                    var totalQty = 0;
                    var totalDiscount = 0;
                    let vehicleSales = self.salehistoryArrayList().filter(function (e) {
                        return e.vehicle.id ===self.vehicle().id;
                    });
                    vehicleSales.forEach(function(sale){
                        totalAmt= totalAmt+sale.amount;
                        totalQty = totalQty+sale.quantity;
                    });
                    
                    self.totalQty(totalQty.toFixed(2));
                    var totalamount = parseInt(totalAmt);
                    self.totalAmount(totalamount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    var totalDiscount = parseInt(totalQty)*40;
                    self.totalDiscount(totalDiscount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    self.saleDatasource(new oj.ArrayTableDataSource(vehicleSales, {idAttribute: 'id'}));
                };
                
                self.showSalelistView = function(){
                     var totalAmt = 0;
                    var totalQty = 0;
                    var totalDiscount = 0;
                    self.salehistoryArrayList().forEach(function(sale){
                        totalAmt= totalAmt+sale.amount;
                        totalQty = totalQty+sale.quantity;
                    });
                    
                    self.totalQty(totalQty.toFixed(2));
                    var totalamount = parseInt(totalAmt);
                    self.totalAmount(totalAmt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    var totalDiscount = parseInt(totalQty)*40;
                    self.totalDiscount(totalDiscount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    self.saleDatasource(new oj.ArrayTableDataSource(self.salehistoryArrayList, {idAttribute: 'id'}));
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
                    accUtils.announce('Customer Sales page loaded.', 'assertive');
                    document.title = "Customer Sales";
                    
                    self.getCustomerVehicleList();
                    self.getCustomerSales();

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
            return CustomerVehicleViewModel;
        }
);
