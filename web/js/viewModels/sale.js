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
define(['knockout', 'appController', 'ojs/ojmodule-element-utils', 'accUtils', 'ojs/ojcontext',
    'ojs/ojcore', 'knockout', 'jquery', 'hammerjs', 'ojs/ojjquery-hammer', 'ojs/ojvalidation-base', 'ojs/ojmessaging', 'ojs/ojmessages', 'ojs/ojmessage',
    'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojformlayout', 'ojs/ojtable', 'ojs/ojinputsearch', 'ojs/ojarraytabledatasource',
    'ojs/ojinputnumber', 'ojs/ojprogress-circle', 'ojs/ojnavigationlist', "ojs/ojswitcher", "ojs/ojdialog"],
        function (ko, app, moduleUtils, accUtils, Context, oj, ko, $, Hammer, ValidationBase, Message) {

            function SaleViewModel(args) {
                var self = this;
                self.router = args.parentRouter;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.sessionUser = ko.dataFor(document.getElementById('globalBody')).user;
                self.network = ko.dataFor(document.getElementById('globalBody')).network;
                self.datasource = ko.observable();
                self.vehicleDatasource = ko.observable();
                self.syncmasterArrayList = ko.observableArray();
                self.barcodeArrayList = ko.observableArray();
                self.fuelArrayList = ko.observableArray();
                self.stationArrayList = ko.observableArray();
                self.fuelPriceArrayList = ko.observableArray();
                self.vehicleArrayList = ko.observableArray();
                self.vehicleArrayListoffline = ko.observableArray();
                self.userArrayList = ko.observableArray([]);
                self.salehistoryArrayList = ko.observableArray([]);
                self.sale = ko.observable({id: 0, quantity: 0, unitcost: 0, amount: 0, createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    fuel: {id: 0, name: '', selling_price: 0}, station: {id: 0, name: ''}, createdBy: {id: 0, name: ''},
                    vehicle: {id: 0, registrationNumber: '', barcode: ''},
                    driver: ''});
                self.vehicle = ko.observable({id: 0, registration_number: '', fuel: {id: 0, name: '', selling_price: 0}, barcode: {id: 0, code: ''}, contact: '',
                    driver: ''});
                self.fuel = ko.observable({id: 0, name: '', selling_price: 0});
                self.barcode = ko.observable({id: 0, code: ''});
                self.searchButtonVisibility = ko.observable(true);
                self.previewButtonVisibility = ko.observable(false);
                self.progressVisibility = ko.observable(false);
                self.registerButtonVisibility = ko.observable(false);
                self.feedbackVisibility = ko.observable(false);
                self.tabVisibility = ko.observable(true);
                self.currentCancelBehaviorOpt = ko.observable('icon');
                self.computedQuantity = ko.observable(0);
                self.computedPrice = ko.observable(0);
                self.password = ko.observable();
                self.confirmPassword = ko.observable();
                self.selectedItem = ko.observable('sale');
                self.currentEdge = ko.observable("top");
                self.alertCount = ko.observable(0);
                self.vehicleFilter = ko.observable();
                self.selectedItemHeader = ko.observable("main");
                self.selectedItemFooter = ko.observable("main");
                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });
                const db = window.sqlitePlugin.openDatabase({
                    name: 'jet.db',
                    location: 'default',
                    androidDatabaseProvider: 'system'
                });

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


                var subscriptionnetwork = self.network.subscribe(
                        function () {
                            if (self.network().status === 1) {
                                self.postSaleData();
                            }
                        }
                );




                self.showSearchVehicle = function () {
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#fbf6f6");
                    }
                    self.selectedItemFooter('search');
                    self.selectedItemHeader('search');
                    self.selectedItem('vehiclelist');
                };
                self.closeSearch = function () {
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('main');
                    setTimeout(function () {
                        self.vehicleFilter('');
                    }, 2000);
//                    self.selectedItem('main');
                };


                self.checkedState = {};
                self.checkedState['start'] = ko.observableArray([]);
                self.checkedState['bottom'] = ko.observableArray([]);
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
                        "bottom": {
                            "selector": "#bottomDrawer",
                            "content": "#mainContent",
                            "modality": self.modalityValue()
                        },
                        "top": {
                            "selector": "#topDrawer",
                            "content": "#mainContent",
                            "modality": self.modalityValue()
                        }

                    };
                }, self);

                var logMessage = function (message) {
                    console.log(message);
                };



                self.eatNonNumbers = function (event) {
                    var charCode = (event.which) ? event.which : event.keyCode;
                    var char = String.fromCharCode(charCode);
                    var replacedValue = char.replace(/[^0-9\.]/g, '');
                    if (char !== replacedValue) {
                        event.preventDefault();
                    }
                };

                // toggle show/hide offcanvas
                self.toggle = ko.observable(false);
                self.toggleSaleDrawer = function (param) {
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
                $("#bottomDrawer").on("ojclose", function () {
                    if (self._activeOffcanvas)
                        self.checkedState[self._activeOffcanvas.edge]([]);
                    self._activeOffcanvas = null;
                });
                //add a close listener so when a offcanvas is autoDismissed we can synchronize the page state.
                $("#topDrawer").on("ojclose", function () {
                    if (self._activeOffcanvas)
                        self.checkedState[self._activeOffcanvas.edge]([]);
                    self._activeOffcanvas = null;
                });



                self.clearScreen = function () {
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('main');
                    self.selectedItem('sale');
                    self.registerButtonVisibility(false);
                    self.searchButtonVisibility(true);
                    self.previewButtonVisibility(false);
                    self.progressVisibility(false);
                    self.feedbackVisibility(false);
                    self.sale({id: 0, quantity: 0, createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                        fuel: {id: 0, name: ''}, station: {id: 0, name: ''}, createdBy: {id: 0, name: ''},
                        vehicle: {id: 0, registrationNumber: '', barcode: ''},
                        driver: ''});

                };



                self.logout = function () {
                    self.router.go({path: 'login'});
                };

                self.showUpdatePassword = function () {
                    document.getElementById("logoutdialogreg").open();
                    self.password(self.sessionUser().password);
                    self.confirmPassword(self.sessionUser().password);
                };

                self.updatePassword = function () {
//                    document.getElementById("logoutdialogreg").close();
                    var url = self.serviceURL + '/user/crud/update';
                    if (self.password() === self.confirmPassword()) {
                        var popup = document.getElementById('progressDialogue');
                        popup.open();
                        var json_object = {id: self.sessionUser().id, station: {id: self.sessionUser().station.id}, name: self.sessionUser().name, contact: self.sessionUser().contact,
                            userrole: {id: self.sessionUser().userrole.id},
                            nin: self.sessionUser().nin, password: self.password(), updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: self.sessionUser().status};
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(json_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                             document.getElementById("progressDialogue").close();
                                self.router.go({path: 'login'});

                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                document.getElementById("progressDialogue").close();
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Updating User Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {
                        alert('Confirm Password');
                    }
                    ;

                };


                self.setScanner = function () {
                    self.selectedItemFooter('search');
                    cordova.plugins.barcodeScanner.scan(
                            function (result) {

                                document.getElementById("progressDialogue").open();
                                let vehicle = self.vehicleArrayList().find(v => v.barcode.code === result.text);
                                if (typeof vehicle === 'undefined') {
                                    document.getElementById("progressDialogue").close();
                                    alert('No Match !!!');
                                } else {
                                    var vehicle_object = {id: vehicle.id, registrationNumber: vehicle.registrationNumber, contact: vehicle.contact,
                                        driver: vehicle.driver, fuel: vehicle.fuel, code: vehicle.code, barcode: vehicle.barcode};
                                    self.registerButtonVisibility(true);
                                    self.vehicle(vehicle_object);
                                    self.sale().barcode = self.vehicle().registrationNumber + '   ' + self.vehicle().fuel.name;
                                    self.sale().vehicle = self.vehicle();
                                    self.sale(self.sale());
                                    self.searchButtonVisibility(false);
                                    self.previewButtonVisibility(true);
                                    document.getElementById("progressDialogue").close();
                                }
                            },
                            function (error) {
                                document.getElementById("progressDialogue").close();
                                alert("Scanner Error " + error);
                            }
                    );
                };

                self.cancelVehicleSearch = function () {
                    self.tabVisibility(true);
                    self.selectedItem('sale');
                };


                self.getSelectedVehicle = function (data) {
                    self.tabVisibility(true);
                    self.vehicle(data);
                    self.selectedItem('sale');
                    self.sale().barcode = self.vehicle().registrationNumber + '     ' + self.vehicle().fuel.name;
                    self.sale().vehicle = self.vehicle();
                    self.sale(self.sale());
                    self.searchButtonVisibility(false);
                    self.previewButtonVisibility(true);
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('main');
                };

                self.searchVehicle = function () {
                    self.tabVisibility(false);
                    self.selectedItem('vehiclelist');
                };


                self.multipleConsumption = function () {
                    var qty = 0;
                    self.fuelPriceArrayList().forEach(function (fuelStation) {
                        if ((fuelStation.fuel.id === self.vehicle().fuel.id && self.sessionUser().station.id === fuelStation.station.id)) {
                            qty = self.sale().amount / (fuelStation.sellingPrice - 40);
                            self.vehicle().fuel.selling_price = fuelStation.sellingPrice - 40;
                            var computedPrice = parseInt(qty * (fuelStation.sellingPrice - 40) - qty * 40);
                            self.computedPrice(computedPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                        }
                    });
                    self.computedQuantity(qty.toFixed(1));
                    if (isNaN(self.computedQuantity())) {
                        alert('Check Station Prices !!!');
                    } else {
                        self.toggleSaleDrawer('bottom');
                    }

                };

                self.salePreview = function () {
                    var qty = 0;
                    self.selectedItemFooter('search');
                    self.fuelPriceArrayList().forEach(function (fuelStation) {
                        if ((fuelStation.fuel.id === self.vehicle().fuel.id && self.sessionUser().station.id === fuelStation.station.id)) {
                            qty = self.sale().amount / (fuelStation.sellingPrice - 40);
                            self.vehicle().fuel.selling_price = fuelStation.sellingPrice - 40;
                            var computedPrice = parseInt(qty * (fuelStation.sellingPrice - 40) + qty * 40);
                            self.computedPrice(computedPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                        }
                    });
                    self.computedQuantity(qty.toFixed(1));

                    if (isNaN(self.computedQuantity())) {
                        alert('Check Station Prices !!!');
                    } else {
                        self.toggleSaleDrawer('bottom');

                    }
                };


                self.cancelSale = function () {
                    self.sale({id: 0, quantity: 0, unitcost: 0, amount: 0, createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                        fuel: {id: 0, name: ''}, station: {id: 0, name: ''}, createdBy: {id: 0, name: ''},
                        vehicle: {id: 0, registrationNumber: '', barcode: ''},
                        driver: ''});
                    self.previewButtonVisibility(false);
                    self.searchButtonVisibility(true);
                    self.toggleSaleDrawer('bottom');
                    self.selectedItemFooter('main');

                };


                self.makeSale = function () {
                    self.selectedItemFooter('main');
                    document.getElementById("progressDialogue").open();
                    var m = new Date();
                    var time_signature = m.getFullYear() + ("0" + (m.getMonth() + 1)).slice(-2) + ("0" + m.getDate()).slice(-2) +
                            ("0" + m.getHours()).slice(-2) +
                            ("0" + m.getMinutes()).slice(-2);
                    var receiptno = self.vehicle().barcode.code + time_signature;
                    var sale_object = {unitcost: self.vehicle().fuel.selling_price,
                        amount: self.sale().amount,
                        quantity: self.computedQuantity(), createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()), fuel: {id: self.vehicle().fuel.id}, receiptno: receiptno,
                        station: {id: self.sessionUser().station.id}, commission: parseInt(self.computedQuantity() * 40),
                        sellingprice: self.vehicle().fuel.selling_price - 40, incomeprice: self.vehicle().fuel.selling_price - 80,
                        createdBy: {id: self.sessionUser().id}, vehicle: {id: self.vehicle().id}};
                    if (self.vehicle().id > 0) {
                        $.ajax({
                            type: "POST",
                            url: self.serviceURL + '/sale/crud/create',
                            data: ko.toJSON(sale_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                document.getElementById("progressDialogue").close();
                                self.searchButtonVisibility(true);
                                self.previewButtonVisibility(false);
                                var sale_object = {id: res.data.id, quantity: res.data.quantity, unitcost: res.data.unitcost, vehicle: self.vehicle(),
                                    amount: res.data.amount, receiptno: res.data.receiptno, createdby: self.sessionUser(), fuel: self.vehicle().fuel,
                                    station: self.sessionUser().station, createdon: oj.IntlConverterUtils.dateToLocalIso(new Date()).split('T')[0]
                                };

                                self.salehistoryArrayList().push(sale_object);
                                self.datasource(new oj.ArrayTableDataSource(self.salehistoryArrayList, {idAttribute: 'id'}));
                                self.selectedItem('salelist');
                                self.sale({id: 0, quantity: 0, unitcost: 0, amount: 0, createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                                    fuel: {id: 0, name: ''}, station: {id: 0, name: ''}, createdBy: {id: 0, name: ''},
                                    vehicle: {id: 0, registrationNumber: '', barcode: ''},
                                    driver: ''});
                                self.toggleSaleDrawer('bottom');

                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                document.getElementById("progressDialogue").close();
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Sale Failed'});
                                console.log(errorThrown);
                            }
                        });



                    } else {
                        alert('Transaction Failed Try Again!!!');
                    }
                    ;
                };




                self.postSaleData = function () {
                    var salelist = [];
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM sale_history where status=?", [0], function (tx, res) {
                            if (res.rows.length > 0) {
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    var sale_object = {quantity: rowItem.quantity, createdOn: rowItem.createdon, unitcost: rowItem.unitcost, amount: rowItem.amount,
                                        receiptno: rowItem.receiptno, sellingprice: rowItem.selling_price, incomeprice: rowItem.income_price,
                                        commission: rowItem.commission, fuel: {id: rowItem.fuel}, station: {id: rowItem.station}, createdBy: {id: rowItem.createdby},
                                        vehicle: {id: rowItem.vehicle}};
                                    salelist.push(sale_object);
                                }

                                $.ajax({
                                    type: "POST",
                                    url: self.serviceURL + '/sale/salelist/crud/create',
                                    data: ko.toJSON(salelist),
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    success: function (res) {
                                        if (res.data.id > 0) {
                                            db.transaction(function (tx) {
                                                tx.executeSql("update sale_history set status=?",
                                                        [1], function (tx, res) {
                                                });
                                                self.getSalelist();
                                            }, function (err) {
                                                alert("An error occured while Updating Sale History  " + err.message);
                                            });
                                        }

                                    },
                                    failure: function (jqXHR, textStatus, errorThrown) {
                                        self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Sale Failed'});
                                        console.log(errorThrown);
                                    }
                                });
                            }
                        });
                    });
                };





                self.getSalelist = function () {
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM sale_history where createdby=?", [self.sessionUser().id], function (tx, res) {
                            if (res.rows.length > 0) {
                                self.salehistoryArrayList.removeAll();
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    let createdby = self.userArrayList().find(u => u.id === rowItem.createdby);
                                    let fuel = self.fuelArrayList().find(f => f.id === rowItem.fuel);
                                    let station = self.stationArrayList().find(s => s.id === rowItem.station);
                                    let vehicle = self.vehicleArrayList().find(v => v.id === rowItem.vehicle);
                                    var sale_object = {id: rowItem.id, quantity: rowItem.quantity, unitcost: rowItem.unitcost, vehicle: vehicle,
                                        amount: rowItem.amount, receiptno: rowItem.receiptno, createdby: createdby, fuel: fuel, station: station, status: rowItem.status
                                    };
                                    sale_object.createdon = rowItem.createdon ? rowItem.createdon.split('T')[0] : "";
                                    self.salehistoryArrayList().push(sale_object);
                                }
                                self.datasource(new oj.ArrayTableDataSource(self.salehistoryArrayList, {idAttribute: 'id'}));
                            }
                        });
                    });
                };







                self.getFuelStationList = function () {
                    $.getJSON(self.serviceURL + '/station/fuelstation/all').
                            then(function (data) {
                                self.fuelPriceArrayList.removeAll();
                                $.each(data, function () {
                                    var price = this;
                                    self.fuelPriceArrayList().push(price);
                                });

                            });
                };


                self.getVehiclelist = function () {
                    $.getJSON(self.serviceURL + '/vehicle/all').
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    vehicle_object.code = this.barcode.code;
                                    if (typeof vehicle_object.parent === 'undefined') {
                                        vehicle_object.parent = {id: 0};
                                    }
                                    self.vehicleArrayList().push(vehicle_object);
                                });
                                console.log(self.vehicleArrayList());
                                self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
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
                    self.vehicleDatasource(new oj.ArrayTableDataSource(vehicleArray, {idAttribute: 'id'}));
                };

                self.clearVehicleClick = function (event) {
                    self.vehicleFilter('');
                    self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
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
                self.connected = function () {
                    accUtils.announce('Sale page loaded.', 'assertive');
                    document.title = "Sale";
                    setInterval(function () {
                        if (self.network().status > 0) {
                            self.getVehiclelist();
                            self.getFuelStationList();
                        }
                    }, 600000);

                    self.getVehiclelist();
                    self.getFuelStationList();
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
                    // Implement if needed
                };
            }

            /*
             * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
             * return a constructor for the ViewModel so that the ViewModel is constructed
             * each time the view is displayed.
             */
            return SaleViewModel;
        }
);
