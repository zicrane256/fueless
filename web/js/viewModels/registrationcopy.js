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
    'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojinputsearch', 'ojs/ojformlayout', 'ojs/ojtable', 'ojs/ojpopup', 'ojs/ojarraytabledatasource', 'ojs/ojdialog',
    'ojs/ojprogress-circle', 'ojs/ojnavigationlist', "ojs/ojswitcher"],
        function (ko, app, moduleUtils, accUtils, Context, oj, ko, $, Hammer, ValidationBase, Message) {
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
                self.vehicle = ko.observable({id: 0, registration_number: '', fuel: {id: 0, name: ''}, category: {id: 0, name: ''}, barcode: {id: 0, code: ''}, contact: 00000000,
                    driver: ''});
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
                    var popup = document.getElementById('progressDialogue');
                    popup.open();
                    cordova.plugins.barcodeScanner.scan(
                            function (result) {
                                db.transaction(function (tx) {
                                    tx.executeSql("SELECT * from vehicle where code=?", [result.text], function (tx, res) {
                                        if (res.rows.length > 0) {
                                            var popup = document.getElementById('progressDialogue');
                                            popup.close();
                                            alert('Already Used !!!');

                                        } else {
                                            let barcode = self.barcodeArrayList().find(f => f.code === result.text);
                                            if (typeof barcode === 'undefined') {
                                                var popup = document.getElementById('progressDialogue');
                                                popup.close();
                                                alert('No Match !!!');
                                            } else {
                                                var popup = document.getElementById('progressDialogue');
                                                popup.close();
                                                self.selectedItem('category');
                                                self.vehicle().barcode = barcode;
                                                self.vehicle(self.vehicle());

                                            }
                                        }
                                    });
                                });




                            },
                            function (error) {
                                alert("Scanner Error " + error);
                            }
                    );
                };


                self.clearScreen = function () {
                    self.registerButtonVisibility(false);
                    self.progressVisibility(false);
                    self.feedbackVisibility(false);
                    self.vehicle({id: 0, registration_number: '', fuel: {id: 0, name: ''}, barcode: {id: 0, code: ''}, contact: '',
                        driver: ''});

                };




                self.addVehicle = function () {
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(false);
                    self.progressVisibility(true);
                    self.feedbackVisibility(false);
                    var popup = document.getElementById('progressDialogue');
                    popup.open();

                    var vehicle_object = {id: self.vehicle().id, registration_number: self.vehicle().registrationNumber, fuel: {id: self.vehicle().fuel.id},
                        barcode: {id: self.vehicle().barcode.id, code: self.vehicle().barcode.code}, contact: self.vehicle().contact, parent: {id: 0},
                        driver: self.vehicle().driver, createdby: {id: self.sessionUser().id}, createdon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                        updatedby: {id: self.sessionUser().id}, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: 0, category: self.vehicle().category.id};
//                    if (typeof self.vehicle().parent !== 'undefined') {
//                        vehicle_object.parent = self.vehicle().parent;
//                    } else {
//                        vehicle_object.parent = {id: self.vehicle().parent};
//                    }

                    db.transaction(function (tx) {
                        tx.executeSql('INSERT INTO vehicle (registration_number,fuel,contact,driver,barcode,code,createdby,createdon,updatedby,updatedon,status,parent,category,stage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [vehicle_object.registration_number, vehicle_object.fuel.id,
                            vehicle_object.contact, vehicle_object.driver, vehicle_object.barcode.id, vehicle_object.barcode.code, vehicle_object.createdby.id, vehicle_object.createdon,
                            vehicle_object.updatedby.id, vehicle_object.updatedon,
                            0, 0, vehicle_object.category, 0]);
                        if (self.network().status === 1) {
                            self.postVehicleData();
                        } else {
                            self.getVehiclelist();
                        }
                        var popup = document.getElementById('progressDialogue');
                        popup.close();
                        self.selectedItem('vehiclelist');
                        self.selectedItemFooter('main');
                        self.selectedItemHeader('main');
//                        self.toggleRegistrationDrawer('end', '');

                    }, function (error) {
                        var popup = document.getElementById('progressDialogue');
                        popup.close();
                        alert('Transaction ERROR: Registration Vehicle ' + error.message);
                    });
                };


                self.addSubVehicle = function () {
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(false);
                    self.progressVisibility(true);
                    self.feedbackVisibility(false);
                    var vehicle_object = {registration_number: self.vehicle().registrationNumber, fuel: {id: self.vehicle().fuel.id},
                        barcode: {id: self.vehicle().barcode.id, code: self.vehicle().barcode.code}, createdby: {id: self.sessionUser().id}, createdon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                        updatedby: {id: self.sessionUser().id}, contact: self.vehicle().contact,
                        driver: self.vehicle().driver, parent: self.vehicle().parent, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: 0, category: self.vehicle().category.id};
                    db.transaction(function (tx) {
                        tx.executeSql('INSERT INTO vehicle (registration_number,fuel,contact,driver,barcode,code,createdby,createdon,updatedby,updatedon,status,parent,category,stage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [vehicle_object.registration_number, vehicle_object.fuel.id,
                            vehicle_object.contact, vehicle_object.driver, vehicle_object.barcode.id, vehicle_object.barcode.code, vehicle_object.createdby.id, vehicle_object.createdon,
                            vehicle_object.updatedby.id, vehicle_object.updatedon,
                            0, vehicle_object.parent.id, vehicle_object.category, 0]);
                        if (self.network().status === 1) {
                            self.postVehicleData();
                        } else {
                            self.getVehiclelist();
                        }
                        self.selectedItem('vehiclelist');
                        self.selectedItemFooter('main');
                        self.selectedItemHeader('main');
//                        self.toggleRegistrationDrawer('end', '');
                    }, function (error) {
                        var popup = document.getElementById('progressDialogue');
                        popup.close();
                        alert('Transaction ERROR: Add Vehicle ' + error.message);
                    });

                    db.transaction(function (tx) {
                        tx.executeSql("update barcode set status=? where code=?",
                                [2, self.vehicle().barcode.id], function (tx, res) {

                        });
                    }, function (err) {
                        var popup = document.getElementById('progressDialogue');
                        popup.close();
                        alert("An error occured while Updating Vehicle Code  " + err.message);
                    });

                };


                self.updateVehicle = function () {
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(false);
                    self.progressVisibility(true);
                    self.feedbackVisibility(false);
                    var popup = document.getElementById('progressDialogue');
                    popup.open();
                    var json_object = {id: self.vehicle().id, registration_number: self.vehicle().registrationNumber, fuel: {id: self.vehicle().fuel.id},
                        barcode: self.vehicle().barcode, contact: self.vehicle().contact, driver: self.vehicle().driver, createdby: self.vehicle().createdby, createdon: self.vehicle().createdon,
                        updatedby: {id: self.sessionUser().id}, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: 0, parent: self.vehicle().parent};

                    db.transaction(function (tx) {
                        tx.executeSql("update vehicle set registration_number=?,fuel=?,contact=?,driver=?,updatedby=?,updatedon=?,status=?,parent=? where code=?",
                                [json_object.registration_number, json_object.fuel.id, json_object.contact, json_object.driver,
                                    json_object.updatedby.id, json_object.updatedon, 0, json_object.parent, json_object.barcode.code], function (tx, res) {
                            self.progressVisibility(false);
                            if (self.network().status === 1) {
                                self.postVehicleData();
                            } else {
                                self.getVehiclelist();
                            }
                            self.toggleRegistrationDrawer('end', '');
                            var popup = document.getElementById('progressDialogue');
                            popup.close();
                        });
                    }, function (err) {
                        var popup = document.getElementById('progressDialogue');
                        popup.close();
                        alert("An error occured while Updating Vehicle  " + err.message);
                    });
                };


                self.postVehicleData = function () {
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM Vehicle where status=?", [0], function (tx, res) {
                            if (res.rows.length > 0) {
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    var vehicle_object = {registrationNumber: rowItem.registration_number, barcode: {id: rowItem.barcode}, fuel: {id: rowItem.fuel},
                                        driver: rowItem.driver, contact: rowItem.contact, createdby: {id: rowItem.createdby}, createdon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                                        updatedby: {id: rowItem.updatedby}, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), category: {id: rowItem.category}};
//                                     createdby: {id: rowItem.createdby}, createdon: rowItem.createdon,
                                    if (rowItem.parent > 0) {
                                        vehicle_object.parent = {id: rowItem.parent};
                                    }
                                    var url;
                                    if (rowItem.stage === 0) {
                                        url = self.serviceURL + '/vehicle/crud/create';
                                    } else {
                                        vehicle_object.id = rowItem.ID;
                                        url = self.serviceURL + '/vehicle/crud/update';
                                    }
                                    $.ajax({
                                        type: "POST",
                                        url: url,
                                        data: ko.toJSON(vehicle_object),
                                        dataType: 'json',
                                        contentType: 'application/json',
                                        success: function (res) {
                                            var vehicle = res.data;
                                            if (typeof res.data.parent === 'undefined') {
                                                vehicle.parent = {id: 0};
                                            }
                                            let barcode = self.barcodeArrayList().find(f => f.id === vehicle.barcode.id);
                                            db.transaction(function (tx) {
                                                tx.executeSql("update vehicle set ID=?,status=?,stage=?,parent=? where code=?",
                                                        [vehicle.id, 1, 1, vehicle.parent.id, barcode.code], function (tx, res) {
                                                });
                                                tx.executeSql("update barcode set status=? where code=?", [2, vehicle.code], function (tx, res) {});
                                            }, function (err) {
                                                alert("An error occured while Updating Vehicle  :Registration" + err.message);
                                            });
                                            self.getVehiclelist();

                                        },
                                        failure: function (jqXHR, textStatus, errorThrown) {
                                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Creating Vehicle Failed'});
                                            console.log(errorThrown);
                                        }
                                    });

                                }

                            }
                        });
                    });
                };



                self.getSelectedFuel = function (data) {
                    self.fuel(data);
                    self.vehicle().fuel = self.fuel();
                    self.vehicle(self.vehicle());
                    self.selectedItem('form');
//                    document.querySelector('#fuelPopup').close();
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
//                    document.querySelector('#vehicleCategoryPopup').close();
                };

                self.getSelectedVehicle = function (data) {
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
                    self.vehicle(data);
                    self.selectedItem('form');
                    self.selectedItemFooter('add');
                    self.selectedItemHeader('add');
//                    self.toggleRegistrationDrawer('end', 'update');
                };

                self.addVehicleview = function (data) {
                    self.selectedItem('form');
                    self.vehicle({id: 0, registration_number: '', category: {id: 0, name: ''}, fuel: {id: 0, name: ''}, barcode: {id: 0, code: ''}, contact: '',
                        driver: ''});
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
                    self.vehicle({id: 0, registration_number: '', fuel: {id: 0, name: ''}, barcode: {id: 0, code: ''}, contact: '',
                        driver: self.vehicle().driver, parent: {id: self.vehicle().id}});
                    self.registerButtonVisibility(false);
                    self.updateButtonVisibility(false);
                    self.registerSubButtonVisibility(false);
                    self.scannerVisibility(true);
                    self.parent(true);
                    self.selectedItemFooter('add');
                    self.selectedItemHeader('add');
//                    self.toggleRegistrationDrawer('end', 'sub');
                };

                self.showFuelTypes = function () {
                    self.selectedItem('fuel');
//                    document.querySelector('#fuelPopup').open();

                };


                self.getVehiclelist = function () {
                    document.getElementById("progressDialogue").open();
                     $.getJSON(self.serviceURL + '/vehicle/all').
                            then(function (data) {
                             self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    vehicle_object.code = this.barcode.code;
                                    vehicle_object.status = 1;
                                    vehicle_object.updatedon = vehicle_object.updatedon ? vehicle_object.updatedon.split('T')[0] : "";
                                    if (typeof vehicle_object.parent === 'undefined') {
                                        vehicle_object.parent = {id: 0};
                                    }
                                    self.vehicleArrayList().push(vehicle_object);
                                });
                                document.getElementById("progressDialogue").close();
                                self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayList, {idAttribute: 'id'}));
                            });
                            
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM Vehicle", [], function (tx, res) {
                            if (res.rows.length > 0) {
                                self.vehicleArrayListoffline.removeAll();
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    let fuel = self.fuelArrayList().find(f => f.id === res.rows.item(i).fuel);
                                    let barcode = self.barcodeArrayList().find(f => f.id === res.rows.item(i).barcode);
                                    let createdby = self.userArrayList().find(u => u.id === res.rows.item(i).createdby);
                                    let updatedby = self.userArrayList().find(u => u.id === res.rows.item(i).updatedby);
                                    let category = self.vehicleCategoryArrayList().find(c => c.id === res.rows.item(i).category);
                                    var vehicle_object = {id: rowItem.ID, registrationNumber: rowItem.registration_number, barcode: barcode, fuel: fuel, status: rowItem.status,
                                        driver: rowItem.driver, contact: rowItem.contact, createdby: createdby, updatedby: updatedby, parent: rowItem.parent, category: category};
                                    vehicle_object.createdon = res.rows.item(i).createdon ? res.rows.item(i).createdon.split('T')[0] : "";
                                    vehicle_object.updatedon = res.rows.item(i).updatedon ? res.rows.item(i).updatedon.split('T')[0] : "";
                                    self.vehicleArrayListoffline().push(vehicle_object);
                                }
                               if (self.network().status === 0) {
                                   document.getElementById("progressDialogue").close();
                                self.vehicleDatasource(new oj.ArrayTableDataSource(self.vehicleArrayListoffline, {idAttribute: 'id'}));
                            }
                            }
                        });
                    });
                };


                self.getUserlist = function () {
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM t_user", [], function (tx, res) {

                            if (res.rows.length > 0) {
                                self.userArrayList.removeAll();
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    var user_object = {id: res.rows.item(i).id, name: res.rows.item(i).name};
                                    self.userArrayList().push(user_object);
                                }
                            }
                        });
                    });
                };

                self.getFuellist = function () {
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM fuel", [], function (tx, res) {
                            if (res.rows.length > 0) {
                                self.fuelArrayList.removeAll();
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    var fuel_object = {id: res.rows.item(i).id, name: res.rows.item(i).name};
                                    self.fuelArrayList().push(fuel_object);
                                }
                                self.fuelDatasource(new oj.ArrayTableDataSource(self.fuelArrayList, {idAttribute: 'id'}));
                            }
                        });
                    });
                };

                self.getBarcodelist = function () {
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * from barcode", [], function (tx, res) {
                            if (res.rows.length > 0) {
                                self.barcodeArrayList.removeAll();
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    var barcode_object = {id: rowItem.id, code: rowItem.code, status: rowItem.status};
                                    self.barcodeArrayList().push(barcode_object);
                                }
                            }
                        });
                    });
                };

                self.getVehicleCategorylist = function () {
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT * from vehicle_category", [], function (tx, res) {
                            if (res.rows.length > 0) {
                                self.vehicleCategoryArrayList.removeAll();
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
                                    var category_object = {id: rowItem.id, name: rowItem.name};
                                    self.vehicleCategoryArrayList().push(category_object);
                                }
                                self.vehicleCategoryDatasource(new oj.ArrayTableDataSource(self.vehicleCategoryArrayList, {idAttribute: 'id'}));
                            }
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
                            self.vehicle({id: 0, registration_number: '', category: {id: 0, name: ''}, fuel: {id: 0, name: ''}, barcode: {id: 0, code: ''}, contact: '',
                                driver: ''});
                            self.registerButtonVisibility(false);
                            self.updateButtonVisibility(false);
                            self.registerSubButtonVisibility(false);
                            self.parent(false);
                            self.scannerVisibility(true);
                            self.selectedItemFooter('add');
                            self.selectedItemHeader('add');
                            break;
                        case 'sub':
                            self.vehicle({id: 0, registration_number: '', fuel: {id: 0, name: ''}, barcode: {id: 0, code: ''}, contact: '',
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






                self.logout = function () {
                    self.router.go({path: 'login'});
                };

                self.showUpdatePassword = function () {
                    document.getElementById("logoutdialogreg").open();
                    self.password(self.sessionUser().password);
                    self.confirmPassword(self.sessionUser().password);
                };

                self.updatePassword = function () {
                    document.getElementById("logoutdialogreg").close();
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

                                db.transaction(function (tx) {
                                    tx.executeSql("update t_user set password=? where id=?",
                                            [self.password(), self.sessionUser().id], function (tx, res) {
                                        self.progressVisibility(false);
                                        var popup = document.getElementById('progressDialogue');
                                        popup.close();
                                        self.router.go({path: 'login'});
                                    });
                                }, function (err) {
                                    var popup = document.getElementById('progressDialogue');
                                    popup.close();
                                    alert("An error occured while Updating User " + err.message);
                                });

                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                var popup = document.getElementById('progressDialogue');
                                popup.close();
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Updating User Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {
                        alert('Confirm Password');
                    };
                };


                self.updateVehicleBarcode = function () {
                    $.getJSON(self.serviceURL + '/user/syncmaster/all').
                            then(function (data) {
                                self.syncmasterArrayList.removeAll();
                                $.each(data, function () {
                                    self.syncmasterArrayList().push(this);
                                });
                                db.transaction(function (tx) {
                                    tx.executeSql("SELECT * FROM SyncMaster", [], function (tx, res) {
                                        for (var i = 0; i < res.rows.length; i++)
                                        {
                                            var rowItem = res.rows.item(i);
                                            let syncMaster_object = self.syncmasterArrayList().find(obj => obj.id === rowItem.id);
                                            switch (rowItem.name) {

                                                case 'vehicle':
                                                    if (rowItem.code !== syncMaster_object.code) {
                                                        tx.executeSql('Delete from vehicle where status=?', [1]);
                                                        $.getJSON(self.serviceURL + '/vehicle/all').
                                                                then(function (data) {
                                                                    $.each(data, function () {
                                                                        var vehicle_object = this;
                                                                        if (typeof vehicle_object.parent === 'undefined') {
                                                                            vehicle_object.parent = {id: 0};
                                                                        }
                                                                        db.transaction(function (tx) {
                                                                            tx.executeSql('INSERT INTO vehicle (ID,registration_number,fuel,contact,driver,barcode,code,createdby,createdon,updatedby,updatedon,status,parent,category) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [vehicle_object.id, vehicle_object.registrationNumber, vehicle_object.fuel.id,
                                                                                vehicle_object.contact, vehicle_object.driver, vehicle_object.barcode.id, vehicle_object.barcode.code, vehicle_object.createdby, vehicle_object.createdon, vehicle_object.updatedby.id, vehicle_object.updatedon,
                                                                                1, vehicle_object.parent.id, vehicle_object.category.id]);
                                                                        }, function (error) {
                                                                            alert('Transaction ERROR: Updating Vehicle ' + error.message);
                                                                        });
                                                                    });
                                                                    tx.executeSql('Delete from SyncMaster');
                                                                    self.syncmasterArrayList().forEach(function (sync_object) {
                                                                        tx.executeSql('INSERT INTO SyncMaster VALUES (?,?,?)', [sync_object.id, sync_object.code, sync_object.name]);
                                                                    });
                                                                });

                                                    }
                                                    break;

                                                case 'barcode':
                                                    if (rowItem.code !== syncMaster_object.code) {
                                                        $.getJSON(self.serviceURL + '/vehicle/barcode/search/status/' + 1).
                                                                then(function (data) {
                                                                    $.each(data, function () {
                                                                        var barcode_object = this;
                                                                        tx.executeSql("SELECT * from barcode where code=?", [barcode_object.code], function (tx, res) {
                                                                            if (res.rows.length < 1) {
                                                                                tx.executeSql('INSERT INTO barcode VALUES (?,?,?)', [barcode_object.id, barcode_object.code, barcode_object.status]);
                                                                            }
                                                                        });
                                                                    });
                                                                    self.getBarcodelist();
                                                                    tx.executeSql('Delete from SyncMaster');
                                                                    self.syncmasterArrayList().forEach(function (sync_object) {
                                                                        tx.executeSql('INSERT INTO SyncMaster VALUES (?,?,?)', [sync_object.id, sync_object.code, sync_object.name]);
                                                                    });

                                                                });
                                                    }
                                                    break;

                                                default:

                                                    break;

                                            }
                                        }
                                    });

                                }, function (err) {
                                    alert("An error occured while Retrieving Sync Master   " + err.message);
                                });
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
                self.connected = function () {
                    accUtils.announce('Vehicle page loaded.', 'assertive');
                    document.title = "Registration";
                    self.registerButtonVisibility(false);
                    if (self.network().status === 1) {
                        self.postVehicleData();
                    }
                    setInterval(function () {
                        if (self.network().status > 0) {
                            self.updateVehicleBarcode();
                            self.getVehiclelist();
                        }
                    }, 900000);
//                    self.updateVehicleBarcode();
                    self.getVehicleCategorylist();
                    self.getFuellist();
                    self.getBarcodelist();
                    self.getUserlist();
                   
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
                    setTimeout(function() {
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
