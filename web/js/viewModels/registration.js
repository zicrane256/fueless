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
define(['knockout', "ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-number", "ojs/ojasyncvalidator-numberrange", 'appController', 'ojs/ojmodule-element-utils', 'accUtils', 'ojs/ojcontext',
    'ojs/ojcore', 'knockout', 'jquery', 'hammerjs', 'ojs/ojjquery-hammer', 'ojs/ojvalidation-base', 'ojs/ojmessaging', 'ojs/ojmessages', 'ojs/ojmessage',
    'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojinputsearch', 'ojs/ojformlayout', 'ojs/ojtable', 'ojs/ojpopup', 'ojs/ojarraytabledatasource', 'ojs/ojdialog',
    'ojs/ojprogress-circle', 'ojs/ojnavigationlist', "ojs/ojswitcher"],
        function (ko,Bootstrap, AsyncRegExpValidator, ojconverter_number_1, AsyncNumberRangeValidator, app, moduleUtils, accUtils, Context, oj, ko, $, Hammer, ValidationBase, Message) {
            function RegistrationViewModel(context) {
                var self = this;
                self.router = context.parentRouter;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.sessionUser = ko.dataFor(document.getElementById('globalBody')).user;
                self.network = ko.dataFor(document.getElementById('globalBody')).network;
                self.vehicleDatasource = ko.observable();
                self.fuelDatasource = ko.observable();
                self.vehicleCategoryDatasource = ko.observable();
                self.syncmasterArrayList = ko.observableArray();
                self.barcodeArrayList = ko.observableArray();
                self.vehicleArrayList = ko.observableArray([]);
                self.vehicleArrayListoffline = ko.observableArray([]);
                self.userArrayList = ko.observableArray([]);
                self.fuelArrayList = ko.observableArray();
                self.vehicleCategoryArrayList = ko.observableArray();
                self.vehicle = ko.observable({id: 0, registrationNumber: null, fuel: {id: 0, name: null}, category: {id: 0, name: null}, barcode: {id: 0, code: ''}, contact: null,
                    driver: null});
                self.fuel = ko.observable({id: 0, name: ''});
                self.barcode = ko.observable({id: 0, code: ''});
                self.registerButtonVisibility = ko.observable(true);
                self.registerSubButtonVisibility = ko.observable(false);
                self.updateButtonVisibility = ko.observable(true);
                self.scannerVisibility = ko.observable(true);
                self.progressVisibility = ko.observable(false);
                self.feedbackVisibility = ko.observable(false);
                self.parent = ko.observable(false);
                self.password = ko.observable();
                self.confirmPassword = ko.observable();
                self.vehicleFilter = ko.observable();
                self.selectedItem = ko.observable("vehiclelist");
                self.selectedItemHeader = ko.observable("main");
                self.selectedItemFooter = ko.observable("main");
                self.rawValue = ko.observable("");
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

                var subscriptionnetwork = self.network.subscribe(
                        function () {
                            if (self.network().status === 1) {
                                self.postVehicleData();
                            }
                        }
                );

                self.eatNonNumbers = function (event) {
                    var charCode = (event.which) ? event.which : event.keyCode;
                    var char = String.fromCharCode(charCode);
                    var replacedValue = char.replace(/[^0-9\.]/g, '');
                    if (char !== replacedValue) {
                        event.preventDefault();
                    }
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
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#fbf6f6");
                    }
                    self.selectedItemFooter('search');
                    self.selectedItemHeader('search');
                };
                self.closeSearch = function () {

                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('main');
                    setTimeout(function () {
                        self.vehicleFilter('');
                    }, 1000);
                };
                self.closeVehicleRegistration = function () {
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
                    self.selectedItemFooter('main');
                    self.selectedItemHeader('main');
                    self.selectedItem('vehiclelist');

                };



                self.callScanner = function () {
                    document.getElementById("progressDialogue").open();
                    cordova.plugins.barcodeScanner.scan(
                            function (result) {
                                let vehicle = self.vehicleArrayList().find(vehicle => vehicle.barcode.code === result.text);
                                if (typeof vehicle === 'undefined') {
                                    let barcode = self.barcodeArrayList().find(f => f.code === result.text);
                                    if (typeof barcode === 'undefined') {
                                        document.getElementById("progressDialogue").close();
                                        alert('No Match !!!');
                                    } else {
                                        document.getElementById("progressDialogue").close();
                                        self.selectedItem('category');
                                        self.vehicle().barcode = barcode;
                                        self.vehicle(self.vehicle());
                                    }
                                } else {
                                    document.getElementById("progressDialogue").close();
                                    alert('Already Used !!!');
                                }
                            },
                            function (error) {
                                document.getElementById("progressDialogue").close();
                                alert("Scanner Error " + error);
                            }
                    );
                };


                self.clearScreen = function () {
                    self.registerButtonVisibility(false);
                    self.progressVisibility(false);
                    self.feedbackVisibility(false);
                    self.vehicle({id: 0, registrationNumber: null, fuel: {id: 0, name: null}, category: {id: 0, name: null}, barcode: {id: 0, code: ''}, contact: null,
                    driver: null});

                };




                self.addVehicle = function () {
                    if (self.barcodeValid() === 'valid' && self.registrationNumberValid() === 'valid'
                            && self.driverValid() === 'valid' && self.fuelValid() === 'valid'
                            && self.contactValid() === 'valid') {
                        self.registerButtonVisibility(false);
                        self.updateButtonVisibility(false);
                        self.progressVisibility(true);
                        self.feedbackVisibility(false);
                        document.getElementById("progressDialogue").open();
                        var vehicle_object = {id: self.vehicle().id, registrationNumber: self.vehicle().registrationNumber.toUpperCase(), fuel: {id: self.vehicle().fuel.id},
                            barcode: {id: self.vehicle().barcode.id, code: self.vehicle().barcode.code}, contact: self.vehicle().contact,
                            driver: self.vehicle().driver, createdby: {id: self.sessionUser().id}, createdon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                            updatedby: {id: self.sessionUser().id}, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), category: self.vehicle().category.id};
                        var url = self.serviceURL + '/vehicle/crud/create';
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(vehicle_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                console.log(res);
                                var vehicle = res.data;
                                document.getElementById("progressDialogue").close();
                                self.getVehiclelist();
                                self.selectedItem('vehiclelist');
                                self.selectedItemFooter('main');
                                self.selectedItemHeader('main');
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Vehicle Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {

                        let barcode = document.getElementById("barcode");
                        barcode.showMessages();
                        let registrationNumber = document.getElementById("registrationNumber");
                        registrationNumber.showMessages();
                        let fuel = document.getElementById("fuel");
                        fuel.showMessages();
                        let driver = document.getElementById("driver");
                        driver.showMessages();
                        let contact = document.getElementById("contact");
                        contact.showMessages();
                    }



                };


                self.addSubVehicle = function () {
                    if (self.barcodeValid() === 'valid' && self.registrationNumberValid() === 'valid'
                            && self.driverValid() === 'valid' && self.fuelValid() === 'valid'
                            && self.contactValid() === 'valid') {
                        self.registerButtonVisibility(false);
                        self.updateButtonVisibility(false);
                        self.progressVisibility(true);
                        self.feedbackVisibility(false);
                        var vehicle_object = {registrationNumber: self.vehicle().registrationNumber.toUpperCase(), fuel: {id: self.vehicle().fuel.id},
                            barcode: {id: self.vehicle().barcode.id, code: self.vehicle().barcode.code}, createdby: {id: self.sessionUser().id}, createdon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                            updatedby: {id: self.sessionUser().id}, contact: self.vehicle().contact,
                            driver: self.vehicle().driver, parent: self.vehicle().parent, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), category: self.vehicle().category.id};
                        var url = self.serviceURL + '/vehicle/crud/create';
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(vehicle_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                var vehicle = res.data;
                                document.getElementById("progressDialogue").close();
                                self.getVehiclelist();
                                self.selectedItem('vehiclelist');
                                self.selectedItemFooter('main');
                                self.selectedItemHeader('main');
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Vehicle Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {

                        let barcode = document.getElementById("barcode");
                        barcode.showMessages();
                        let registrationNumber = document.getElementById("registrationNumber");
                        registrationNumber.showMessages();
                        let fuel = document.getElementById("fuel");
                        fuel.showMessages();
                        let driver = document.getElementById("driver");
                        driver.showMessages();
                        let contact = document.getElementById("contact");
                        contact.showMessages();
                    }



                };


                self.updateVehicle = function () {
                    if (self.barcodeValid() === 'valid' && self.registrationNumberValid() === 'valid'
                            && self.driverValid() === 'valid' && self.fuelValid() === 'valid'
                            && self.contactValid() === 'valid') {
                        self.registerButtonVisibility(false);
                        self.updateButtonVisibility(false);
                        self.progressVisibility(true);
                        self.feedbackVisibility(false);
                        var popup = document.getElementById('progressDialogue');
                        popup.open();
                        var vehicle_object = {id: self.vehicle().id, registrationNumber: self.vehicle().registrationNumber.toUpperCase(), fuel: {id: self.vehicle().fuel.id},
                            barcode: {id: self.vehicle().barcode.id}, contact: self.vehicle().contact, driver: self.vehicle().driver,
                            updatedby: {id: self.sessionUser().id}, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date())};
                        if (typeof self.vehicle().parent !== 'undefined') {
                            vehicle_object.parent = {id: self.vehicle().parent.id};
                        }
                        var url = self.serviceURL + '/vehicle/crud/update';
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(vehicle_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                document.getElementById("progressDialogue").close();
                                self.getVehiclelist();
                                self.selectedItem('vehiclelist');
                                self.selectedItemFooter('main');
                                self.selectedItemHeader('main');
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Vehicle Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {

                        let barcode = document.getElementById("barcode");
                        barcode.showMessages();
                        let registrationNumber = document.getElementById("registrationNumber");
                        registrationNumber.showMessages();
                        let fuel = document.getElementById("fuel");
                        fuel.showMessages();
                        let driver = document.getElementById("driver");
                        driver.showMessages();
                        let contact = document.getElementById("contact");
                        contact.showMessages();
                    }


                };

                self.barcodeValid = ko.observable("valid");
                self.barcodeRequired = ko.observable(true);
                self.registrationNumberValid = ko.observable("valid");
                self.registrationNumberRequired = ko.observable(true);
                self.driverValid = ko.observable("valid");
                self.fuelRequired = ko.observable(true);
                self.fuelValid = ko.observable("valid");
                self.driverRequired = ko.observable(true);
                self.contactValid = ko.observable("valid");
                self.contactRequired = ko.observable(true);

                self.textValidators = [
                    new AsyncRegExpValidator({
                        pattern: "[a-zA-Z0-9]{3,}",
                        messageDetail: "Enter at least 3 letters "
                    })
                ];
                self.contactValidators = [
                    new AsyncRegExpValidator({
                        pattern: "[0-9]{6,}",
                        messageDetail: "Enter at least 6 Numbers "
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


                self.getSelectedFuel = function (data) {
                    self.fuel(data);
                    self.vehicle().fuel = self.fuel();
                    self.vehicle(self.vehicle());
                    self.selectedItem('form');
                };

                self.showForm = function () {
                    self.selectedItem('form');
                };

                self.getSelectedCategory = function (data) {
                    self.vehicle().category = data;
                    self.vehicle(self.vehicle());
                    if (self.parent()) {
                        self.registerButtonVisibility(false);
                        self.registerSubButtonVisibility(true);
                    } else {
                        self.registerButtonVisibility(true);
                        self.registerSubButtonVisibility(false);
                    }
                    self.selectedItem('form');
                };

                self.getSelectedVehicle = function (data) {
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
                    self.vehicle(data);
                    self.selectedItem('form');
                    self.selectedItemFooter('add');
                    self.selectedItemHeader('add');
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(true);
                };

                self.addVehicleview = function (data) {
                    self.selectedItem('form');
                    self.vehicle({id: 0, registrationNumber: '', fuel: {id: 0, name: null}, category: {id: 0, name: null}, barcode: {id: 0, code: ''}, contact: null,
                    driver: null});
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(false);
                    self.registerSubButtonVisibility(false);
                    self.parent(false);
                    self.scannerVisibility(true);
                    self.selectedItemFooter('add');
                    self.selectedItemHeader('add');
                };
                self.addSubVehicleview = function (data) {
                    self.vehicle(data);
                    self.selectedItem('form');
                    self.vehicle({id: 0, registrationNumber: '', fuel: {id: 0, name: null}, category: {id: 0, name: null}, barcode: {id: 0, code: ''}, contact: null,
                    driver: null});
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(false);
                    self.registerSubButtonVisibility(false);
                    self.scannerVisibility(true);
                    self.parent(true);
                    self.selectedItemFooter('add');
                    self.selectedItemHeader('add');
                };

                self.showFuelTypes = function () {
                    self.selectedItem('fuel');

                };


                self.getVehiclelist = function () {
                    $.getJSON(self.serviceURL + '/vehicle/all').
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    vehicle_object.code = this.barcode.code;
                                    vehicle_object.contact = parseInt(this.contact);
                                    vehicle_object.updatedon = vehicle_object.updatedon ? vehicle_object.updatedon.split('T')[0] : "";
                                    if (typeof vehicle_object.parent === 'undefined') {
                                        vehicle_object.parent = {id: 0};
                                    }
                                    self.vehicleArrayList().push(vehicle_object);
                                });
                                self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
                            });

                };




                self.getFuellist = function () {
                    $.getJSON(self.serviceURL + '/stock/fuel/all').
                            then(function (data) {
                                self.fuelArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    self.fuelArrayList().push(this);
                                });
                                self.fuelDatasource(new oj.ArrayTableDataSource(self.fuelArrayList, {idAttribute: 'id'}));
                            });
                };

                self.getVehicleCategorylist = function () {
                    $.getJSON(self.serviceURL + '/vehicle/category/all').
                            then(function (data) {
                                self.vehicleCategoryArrayList.removeAll();
                                $.each(data, function () {
                                    var category_object = this;
                                    self.vehicleCategoryArrayList().push(category_object);
                                });
                                self.vehicleCategoryDatasource(new oj.ArrayTableDataSource(self.vehicleCategoryArrayList, {idAttribute: 'id'}));
                            });

                };


                self.getBarcodelist = function () {
                    $.getJSON(self.serviceURL + '/vehicle/barcode/all').
                            then(function (data) {
                                self.barcodeArrayList.removeAll();
                                $.each(data, function () {
                                    var barcode_object = this;
                                    self.barcodeArrayList().push(barcode_object);
                                });
                            });
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

                self.showSearch = function () {
                    self.toggleRegistrationDrawer('top', '');
                };

                // toggle show/hide offcanvas
                self.toggle = ko.observable(false);
                self.toggleRegistrationDrawer = function (param, option) {
                    switch (option) {
                        case 'add':
                            self.vehicle({id: 0, registrationNumber: null, fuel: {id: 0, name: null}, category: {id: 0, name: null}, barcode: {id: 0, code: ''}, contact: null,
                    driver: null});
                            self.registerButtonVisibility(false);
                            self.updateButtonVisibility(false);
                            self.registerSubButtonVisibility(false);
                            self.parent(false);
                            self.scannerVisibility(true);
                            self.selectedItemFooter('add');
                            self.selectedItemHeader('add');
                            break;
                        case 'sub':
                            self.vehicle({id: 0, registration_number: null, fuel: {id: 0, name: null}, barcode: {id: 0, code: null}, contact: null,
                                driver: self.vehicle().driver, parent: {id: self.vehicle().id}});
                            self.registerButtonVisibility(false);
                            self.updateButtonVisibility(false);
                            self.registerSubButtonVisibility(false);
                            self.scannerVisibility(true);
                            self.parent(true);
                            self.selectedItemFooter('add');
                            self.selectedItemHeader('add');
                            break;


                        default:
                            self.registerButtonVisibility(false);
                            self.updateButtonVisibility(true);
                            self.scannerVisibility(false);
                            self.selectedItemFooter('main');
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
                //add a close listener so when a offcanvas is autoDismissed we can synchronize the page state.
                $("#topDrawer").on("ojclose", function () {
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
                    self.vehicleDatasource(new oj.ArrayTableDataSource(vehicleArray, {idAttribute: 'id'}));
                };

                self.clearVehicleClick = function (event) {
                    self.vehicleFilter('');
                    self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
                    return true;
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
                    
                    var url = self.serviceURL + '/user/crud/update';
                    if (self.password() === self.confirmPassword()) {
                        document.getElementById("progressDialogue").open();
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


              self.validChangedListener = (event) => {
                  let id = event.currentTarget.id;
                  let validProperty = event.detail.value;
                  self.registrationNumberValid(validProperty);
              };
           
           
              let upperCaseConverter = {
                  parse: (value) => {
                      return value;
                  },
                  // take model value and display it in upper case
                  format: (value) => {
                      return value.toUpperCase();
                  }
              };
              let loadConverter = () => {
                  // Use setTimeout to simulate a slow loading converter.
                  return new Promise((resolve, reject) => {
                      setTimeout(() => {
                          resolve(upperCaseConverter);
                      }, 2000);
                  });
              };
              self.upperCaseLoadingConverter = loadConverter();




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
                    document.title = "Registration";
                    self.registerButtonVisibility(false);

                    setInterval(function () {
                        self.getVehiclelist();

                    }, 900000);
                    self.getVehicleCategorylist();
                    self.getFuellist();
                    self.getBarcodelist();
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
            return RegistrationViewModel;
        }
);
