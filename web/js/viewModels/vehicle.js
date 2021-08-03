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
define(['knockout', "ojs/ojbootstrap", 'appController', 'ojs/ojmodule-element-utils', 'ojs/ojcontext', 'accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojvalidation-base', 'ojs/ojmodule-element-utils',
    "ojs/ojarraydataprovider", "ojs/ojknockout-keyset", "ojs/ojkeyset", "ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", 'ojs/ojbutton', 'ojs/ojpopup', 'ojs/ojlistview', 'ojs/ojlistitemlayout',
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset', "ojs/ojprogress-circle", 'ojs/ojdatetimepicker',
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', "ojs/ojinputnumber", 'ojs/ojpagingtabledatasource', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojdefer', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojcollectiontreedatasource', 'ojs/ojarraytreedataprovider', 'ojs/ojinputtext', 'ojs/ojinputsearch', "ojs/ojswitcher"],
        function (ko, Bootstrap, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider, keySet) {
            function VehicleViewModel(context) {
                var self = this;
                self.router = context.parentRouter;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.sessionUser = ko.dataFor(document.getElementById('globalBody')).user;
                self.network = ko.dataFor(document.getElementById('globalBody')).network;
                self.vehicleDatasource = ko.observable();
                self.saleDatasource = ko.observable();
                self.header = ko.observable();
                self.vehicleArrayList = ko.observableArray([]);
                self.salehistoryArrayList = ko.observableArray([]);
                self.vehicle = ko.observable({id: 0, registrationNumber: null, fuel: {id: 0, name: null}, category: {id: 0, name: null}, barcode: {id: 0, code: ''}, contact: null,
                    driver: null});
                self.vehicleFilter = ko.observable();
                self.saleFilter = ko.observable();
                self.selectedItem = ko.observable("vehiclelist");
                self.selectedItemHeader = ko.observable("main");
                self.selectedItemFooter = ko.observable("main");
                self.totalAmount = ko.observable(0);
                self.totalQty = ko.observable(0);
                self.totalDiscount = ko.observable(0);
                self.rawValue = ko.observable("");
                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });

                self.selectedVehicleItems = new keySet.ObservableKeySet();
                self.handleSelectedVehicleChanged = (event) => {
                    Array.from(event.detail.value.values()).forEach(function (vehicleId) {
                        let vehicle = self.vehicleArrayList().find(v => v.id === vehicleId);
                        self.vehicle(vehicle);
                        self.selectedItemHeader('consumption');
                        self.selectedItemFooter('consumption');
                        self.header(self.vehicle().registrationNumber);
                        self.selectedItem('consumption');
                        self.getVehicleSales();
                    });
                };

                self.isSmall = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(
                        oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));

                // For small screens: labels on top
                // For medium screens and up: labels inline

                self.labelEdge = ko.computed(function () {
                    return self.isSmall() ? "top" : "start";
                }, this);

                this.isModal = ko.observableArray(["modeless"]);
                this.modalityValue = ko.computed(function ()
                {
                    return self.isModal().length ? "modal" : "modeless";
                }, self);

                this.displayModeValue = ko.observable("none");





                self.showSearchVehicle = function () {
                    if (cordova.platformId === 'android') {
                        StatusBar.backgroundColorByHexString("#fbf6f6");
                    }
                    self.selectedItemFooter('search');
                    self.selectedItemHeader('search');
                };


                self.showSearchConsumption = function () {
                    document.getElementById("searchDialogue").open();
                };
                self.closeSearchDialogue = function () {
                    document.getElementById("searchDialogue").close();
                };


                self.showMain = function () {
                    if (cordova.platformId === 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('main');
                    self.selectedItem('vehiclelist');
                    setTimeout(function () {
                        self.vehicleFilter('');
                    }, 1000);
                };






                self.showForm = function () {
                    self.selectedItem('form');
                };





                self.getVehiclelist = function () {
                    $.getJSON(self.serviceURL + '/vehicle/all').
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    vehicle_object.code = this.barcode.code;
                                    vehicle_object.contact = '+256 ' + this.contact;
                                    vehicle_object.updatedon = vehicle_object.updatedon ? vehicle_object.updatedon.split('T')[0] : "";
                                    vehicle_object.description = vehicle_object.driver + ' ' + '+256 ' + this.contact +
                                            ' ~:' + vehicle_object.createdby.name + ' ' + vehicle_object.createdon.split('T')[0];
                                    self.vehicleArrayList().push(vehicle_object);
                                });
                                self.vehicleDatasource(new ArrayDataProvider(self.vehicleArrayList, {keyAttributes: "id"}));
//                                self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
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
                            if ((value['registrationNumber'].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['createdby'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (vehicleArray.indexOf(self.vehicleArrayList[i]) < 0)
                                {
                                    var vehicle_obj = {
                                        id: value['id'],
                                        barcode: value['barcode'],
                                        registrationNumber: value['registrationNumber'],
                                        fuel: value['fuel'],
                                        updatedon: value['updatedon'],
                                        updatedby: value['updatedby'],
                                        createdon: value['createdon'],
                                        createdby: value['createdby'],
                                        driver: value['driver'],
                                        contact: value['contact'],
                                        category: value['category'],
                                        parent: value['parent']
                                    };
                                    vehicleArray.push(vehicle_obj);
                                }
                            }
                        });
                    }
                    vehicleArray.reverse();
                    self.vehicleDatasource(new ArrayDataProvider(vehicleArray, {keyAttributes: "id"}));
                };

                self.clearVehicleClick = function (event) {
                    self.vehicleFilter('');
                    self.vehicleDatasource(new ArrayDataProvider(self.vehicleArrayList, {keyAttributes: "id"}));
                    return true;
                };





                self.getVehicleSales = function () {
                    var totalAmt = 0;
                    var totalQty = 0;
                    var totalDiscount = 0;
                    self.totalQty(0);
                    self.totalAmount(0);
                    self.totalDiscount(0);
                    var url = self.serviceURL + '/sale/search/customer/vehicle/' + self.vehicle().id;
                    $.getJSON(url).
                            then(function (data) {
                                $.each(data, function () {
                                    var sale_history = this;
                                    var sale_object = {id: sale_history.id, quantity: sale_history.quantity, unitcost: sale_history.unitcost.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"), vehicle: sale_history.vehicle,
                                        amount: sale_history.amount, receiptno: sale_history.receiptno, createdby: sale_history.createdBy, fuel: sale_history.fuel, station: sale_history.station, status: sale_history.status
                                    };
                                    sale_object.description = '~: ' + sale_history.createdOn.split('T')[0] + '  Qty ' + this.quantity + '  ' + ' @' + sale_history.unitcost.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' Servedby ' + this.createdBy.name + ' :  ' + sale_history.station.name;
                                    sale_object.createdon = sale_history.createdOn ? sale_history.createdOn.split('T')[0] : "";
                                    self.salehistoryArrayList().push(sale_object);
                                    totalAmt = totalAmt + sale_object.amount;
                                    totalQty = totalQty + sale_object.quantity;
                                });
                                self.totalQty(totalQty.toFixed(2));
                                var totalamount = parseInt(totalAmt);
                                self.totalAmount(totalamount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                var totalDiscount = parseInt(totalQty) * 40;
                                self.totalDiscount(totalDiscount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                self.saleDatasource(new ArrayDataProvider(self.salehistoryArrayList, {keyAttributes: "id"}));
                            });

                };



                self.handleSaleChanged = function (event) {
                    var totalAmt = 0;
                    var totalQty = 0;
                    var totalDiscount = 0;
                    self.totalQty(0);
                    self.totalAmount(0);
                    self.totalDiscount(0);

                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearSaleClick();
                        return;
                    }
                    var saleArray = [];
                    var i;
                    for (i = self.salehistoryArrayList.length; i >= 0; i--)
                    {
                        self.salehistoryArrayList().forEach(function (value) {
                            if ((value['vehicle'].registrationNumber.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['station'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['vehicle'].fuel.name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (saleArray.indexOf(self.salehistoryArrayList[i]) < 0)
                                {

                                    saleArray.push(value);
                                }
                            }
                        });
                    }
                    saleArray.reverse();
                    saleArray.forEach(function (sale) {
                        totalAmt = totalAmt + sale.amount;
                        totalQty = totalQty + sale.quantity;
                    });
                    self.totalQty(totalQty.toFixed(2));
                    var totalamount = parseInt(totalAmt);
                    self.totalAmount(totalamount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    var totalDiscount = parseInt(totalQty) * 40;
                    self.totalDiscount(totalDiscount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));

                    self.saleDatasource(new ArrayDataProvider(saleArray, {keyAttributes: "id"}));
                };

                self.clearSaleClick = function (event) {
                    self.saleFilter('');
                    self.saleDatasource(new ArrayDataProvider(self.salehistoryArrayList, {keyAttributes: "id"}));
                    return true;
                };





                self.logout = function () {
                    self.router.go({path: 'login'});
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
                self.connected = function () {
                    accUtils.announce('Vehicle page loaded.', 'assertive');
                    document.title = "Vehicle";

                    setInterval(function () {
                        self.getVehiclelist();

                    }, 900000);

                    self.getVehiclelist();

                    // Implement further logic if needed
                };

                /**
                 * Optional ViewModel method invoked after the View is disconnected from the DOM.
                 */
                self.disconnected = function () {
                    // Implement if needed
                };

                /**
                 * Optional ViewModel method invoked after transition to the new View is complete.
                 * That includes any possible animation between the old and the new View.
                 */
                self.transitionCompleted = function () {
                    setTimeout(function () {
                        self.getVehiclelist();
                    }, 1000);
                    // Implement if needed
                };
            }

            /*
             * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
             * return a constructor for the ViewModel so that the ViewModel is constructed
             * each time the view is displayed.
             */
            return VehicleViewModel;
        }
);
