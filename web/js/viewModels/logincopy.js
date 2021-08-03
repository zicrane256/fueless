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
define(['knockout', 'jquery', 'appController', 'ojs/ojmodule-element-utils', 'accUtils', 'ojs/ojcontext', 'ojs/ojcore', 'knockout',
    'ojs/ojcorerouter',
    'ojs/ojurlparamadapter', 'ojs/ojknockout-keyset', 'ojs/ojvalidation-base', 'ojs/ojarraydataprovider', 'ojs/ojmessaging', 'ojs/ojmessages', 'ojs/ojmessage', 'ojs/ojresponsiveknockoututils',
    'ojs/ojknockout', 'ojs/ojvalidation-base', 'ojs/ojmodule', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojbutton', 'ojs/ojavatar',
    'ojs/ojdefer', 'ojs/ojfilepicker', 'ojs/ojpopup', 'ojs/ojdialog', 'ojs/ojswitcher', 'ojs/ojlabel',  'ojs/ojprogress-circle',
    'ojs/ojformlayout', 'ojs/ojswitch', 'ojs/ojinputtext', 'ojs/ojmenu', 'ojs/ojoption', 'ojs/ojrouter'],
        function (ko, $, app, moduleUtils, accUtils, Context) {
            function LoginViewModel(args) {
                var self = this;
                self.router = args.parentRouter;
                self.routerLinks = ko.dataFor(document.getElementById('globalBody')).routerLinks;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.network = ko.dataFor(document.getElementById('globalBody')).network;
                self.dbExists = ko.dataFor(document.getElementById('globalBody')).dbExists;
                self.datasource = ko.observable();
                self.sessionUser = ko.observable({id: 0, contact: '', password: ''});
                self.progressVisibility = ko.observable(false);
                self.loginButtonVisibility = ko.observable(true);
                self.feedbackVisibility = ko.observable(false);
                self.selectedItem = ko.observable('login');
                self.status = ko.observable(0);
                self.selectedItemHeader = ko.observable('login');
                self.selectedItemFooter = ko.observable('login');
                self.syncmasterArrayList = ko.observableArray([]);
                self.userArrayList = ko.observableArray([]);
                self.userRoleArrayList = ko.observableArray([]);
                self.vehicleArrayList = ko.observableArray([]);
                self.fuelArrayList = ko.observableArray([]);
                self.barcodeArrayList = ko.observableArray([]);
                self.stationArrayList = ko.observableArray([]);
                self.fuelStationArrayList = ko.observableArray([]);
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
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

//                , oj, ko, $, CoreRouter, UrlParamAdapter, keySet, ValidationBase, ArrayDataProvider, Message

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



                self.handleLogin = function () {
                    self.progressVisibility(true);
                    self.loginButtonVisibility(false);
                    self.feedbackVisibility(false);
                    var sql = "SELECT id,name,nin,password,contact,station,userrole,updatedon,updatedby,status,admin_level FROM t_user WHERE contact=? AND password=?  AND status=?";
                    db.transaction(function (tx) {
                        tx.executeSql('select *  from t_user WHERE contact=? AND password=?  AND status=?', [self.sessionUser().contact, self.sessionUser().password, 1], function (tx, res) {
                            if (res.rows.length > 0) {
                                for (var i = 0; i < res.rows.length; i++)
                                {
                                    var rowItem = res.rows.item(i);
//                                    let userrole = self.userRoleArrayList().find(r => r.id === rowItem.userrole);
                                    var user_object = {id: rowItem.id, name: rowItem.name, password: rowItem.password, nin: rowItem.nin, station: {id: rowItem.station},
                                        contact: rowItem.contact, userrole: {id:rowItem.userrole,adminLevel:rowItem.admin_level}, updatedby: {id: rowItem.updatedby},
                                        updatedon: rowItem.updatedon, status: rowItem.status};
                                    self.loginButtonVisibility(true);
                                    var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    rootViewModel.user(user_object);
                                    var pageViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    var roleViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    switch (user_object.userrole.adminLevel) {
                                        case 1:
                                            self.router.go({path: 'about'});
                                            pageViewModel.menuVisibility(true);
                                            roleViewModel.roleLevel(1);
                                            break;
                                        case 2:
                                            self.router.go({path: 'sale'});
                                            pageViewModel.menuVisibility(false);
                                            roleViewModel.roleLevel(2);

                                            break;
                                        case 3:
                                            self.router.go({path: 'registration'});
                                            pageViewModel.menuVisibility(false);
                                            roleViewModel.roleLevel(3);
                                            break;
                                    }
                                }

                            } else {
                                self.loginButtonVisibility(true);
                                self.feedbackVisibility(true);
                            }

                        });
                    }, function (err) {
                        alert("Handle Login Error " + err.message);
                    });
                };





                self.setScanner = function () {
                    
                    cordova.plugins.barcodeScanner.scan(
                            function (result) {
                                var popup = document.getElementById('progressDialogue');
                                popup.open();
                                let barcode = self.barcodeArrayList().find(obj => obj.code === result.text);
                                console.log(barcode);
                                var vehicle = {barcode:{id:barcode.id}};
                                
                             $.ajax({
                                    type: "POST",
                                    url: self.serviceURL + '/vehicle/search/barcode',
                                    data: ko.toJSON(vehicle),
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    success: function (res) {
                                         $.each(res.data, function () {
                                             var popup = document.getElementById('progressDialogue');
                                    popup.close();
                                    console.log(this);
//                                    if(this.id>0){
//                                    var pageViewModel = ko.dataFor(document.getElementById('globalBody'));
//                                    pageViewModel.customerVehicle({id:this.id,code:this.barcode.code});
//                                    self.router.go({path: 'customervehicle'});
//                                    var pageViewMenuModel = ko.dataFor(document.getElementById('globalBody'));
//                                    pageViewMenuModel.menuVisibility(false);
//                                    }else{
//                                    
//                                    alert('No Vehicle Match !!!'); 
//                                    }
                              
                                         });

                                    },
                                    failure: function (jqXHR, textStatus, errorThrown) {
                                        self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Vehicle Search '});
                                        console.log(errorThrown);
                                    }
                                });    
    
                            },
                            function (error) {
                                alert("Scanner Error " + error);
                            }
                    );
                };
                
//                self.setScanner = function () {
//                    cordova.plugins.barcodeScanner.scan(
//                            function (result) {
//                                var popup = document.getElementById('progressDialogue');
//                                popup.open();
//                                
//                            db.transaction(function (tx) {
//                            tx.executeSql("SELECT * from vehicle where code=?", [result.text], function (tx, res) {
//                            if (res.rows.length > 0) {
//                                for (var i = 0; i < res.rows.length; i++)
//                                {
//                                    var rowItem = res.rows.item(i);
//                                     var popup = document.getElementById('progressDialogue');
//                                    popup.close();
//                                    var pageViewModel = ko.dataFor(document.getElementById('globalBody'));
//                                    pageViewModel.customerVehicle({id:rowItem.ID,code:rowItem.code});
//                                    self.router.go({path: 'customervehicle'});
//                                    var pageViewMenuModel = ko.dataFor(document.getElementById('globalBody'));
//                                    pageViewMenuModel.menuVisibility(false);
//                                }
//                            }else{
//                                 var popup = document.getElementById('progressDialogue');
//                                    popup.close();
//                                    alert('No Vehicle Match !!!');
//                            }
//                        });
//                    });    
//                            },
//                            function (error) {
//                                alert("Scanner Error " + error);
//                            }
//                    );
//                };



                self.handleDataSynchronization = function () {
                    document.addEventListener('deviceready', function () {
                        db.executeSql('SELECT * FROM SyncMaster', [], function (res) {
                            if (res.rows.length < 2) {
                                alert('Check Network !!!');
                                if (self.network().status > 0) {
                                    self.createDB();
                                }
                            } 
                        }, function (error) {
                            self.createDB();
                            console.log('SELECT SQL statement ERROR: ' + error.message);
                        });
                    });
                };


                self.createDB = function () {
                    var popup = document.getElementById('progressDialogue');
                    popup.open();
                    self.syncmasterArrayList.removeAll();
                    db.transaction(function (tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS SyncMaster (id INTEGER,code varchar(16), name varchar(32))');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS fuel (id INTEGER, name varchar(32))');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS vehicle_category (id INTEGER, name varchar(32))');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS registration (id INTEGER, type INTEGER,code varchar(32))');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS station (id INTEGER, name varchar(32),latitude float,longitude float)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS barcode (id INTEGER, code varchar(16),status INTEGER)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS userrole (id INTEGER, name varchar(16),adminLevel INTEGER)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS t_user (id INTEGER, name varchar(64),nin varchar(16),' +
                                'password varchar(16),contact varchar(32),station INTEGER,' +
                                'userrole INTEGER,updatedon DATE,updatedby INTEGER,status INTEGER,admin_level INTEGER)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS vehicle (ID INTEGER PRIMARY KEY AUTOINCREMENT, registration_number varchar(16),fuel INTEGER,' +
                                'contact varchar(32),driver varchar(64),barcode INTEGER,code varchar(16),createdby INTEGER,createdon DATE,updatedby INTEGER,updatedon DATE,status INTEGER,parent INTEGER,category INTEGER,stage INTEGER)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS fuel_station (id INTEGER, station INTEGER,fuel INTEGER,selling_price INTEGER)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS sale_history (id INTEGER,fuel INTEGER,quantity double,' +
                                'unitcost INTEGER,amount INTEGER,station INTEGER,vehicle INTEGER,createdby INTEGER,createdon DATE,receiptno varchar(32),selling_price INTEGER,income_price INTEGER,commission INTEGER,status INTEGER)');
                    }, function (error) {
                        alert('Transaction ERROR:  Creating DB ' + error.message);
                    });



//                    $.getJSON(self.serviceURL + '/user/syncmaster/all', function (data) {
//                         $.each(data, function () {
//                                    db.transaction(function (tx) {
//                                        tx.executeSql('INSERT INTO SyncMaster VALUES (?,?,?)', [this.id, this.code, this.name]);
//                                    }, function (error) {
//                                        alert('Transaction ERROR: SyncMaster' + error.message);
//                                    });
//                                });
//                    }).done(function () {
//                                alert('getJSON request succeeded!');
//                            })
//                            .fail(function (jqXHR, textStatus, errorThrown) {
//                                alert('getJSON request failed! ' + textStatus);
//                                alert(errorThrown);
//                            })
//                            .always(function () {
//                                alert('getJSON request ended!');
//                            });
                    $.getJSON(self.serviceURL + '/user/syncmaster/all', function (data) {
                        $.each(data, function () {
                            var syncMaster_obj = this;
                            db.transaction(function (tx) {
                                tx.executeSql('INSERT INTO SyncMaster VALUES (?,?,?)', [syncMaster_obj.id, syncMaster_obj.code, syncMaster_obj.name]);
                            }, function (error) {
                                alert('Transaction ERROR: SyncMaster ' + error.message);
                            });
                        });
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        var popup = document.getElementById('progressDialogue');
                        popup.close();
                        alert('Check Network Connection !!! ');
                    });
                    
                    
                    $.getJSON(self.serviceURL + '/station/all').
                            then(function (data) {
                                self.stationArrayList.removeAll();
                                self.status(1);
                                $.each(data, function () {
                                    var station_object = this;
                                    self.stationArrayList().push(station_object);
                                    db.transaction(function (tx) {
                                        tx.executeSql('INSERT INTO station VALUES (?,?,?,?)', [station_object.id, station_object.name, 
                                            station_object.latitude, station_object.longtude]);
                                    }, function (error) {
                                        alert('Transaction ERROR:Inserting Station  ' + error.message);
                                    });
                                });
                            });
                            
                            
                    $.getJSON(self.serviceURL + '/stock/fuel/all').
                            then(function (data) {
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    db.transaction(function (tx) {
                                        tx.executeSql('INSERT INTO fuel VALUES (?,?)', [vehicle_object.id, vehicle_object.name]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Inserting Fuel Fuel' + error.message);
                                    });
                                });
                            });
                    $.getJSON(self.serviceURL + '/vehicle/category/all').
                            then(function (data) {
                                $.each(data, function () {
                                    var category_object = this;
                                    db.transaction(function (tx) {
                                        tx.executeSql('INSERT INTO vehicle_category VALUES (?,?)', [category_object.id, category_object.name]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Inserting Vehicle Category  ' + error.message);
                                    });
                                });
                            });

                    $.getJSON(self.serviceURL + '/station/fuelstation/all').
                            then(function (data) {
                                $.each(data, function () {
                                    var fuelstation_object = this;
                                    db.transaction(function (tx) {
                                        tx.executeSql('INSERT INTO fuel_station VALUES (?,?,?,?)', [fuelstation_object.id, fuelstation_object.station.id, fuelstation_object.fuel.id, fuelstation_object.sellingPrice]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Unserting Fuel Stations ' + error.message);
                                    });
                                });
                            });
                            
                    $.getJSON(self.serviceURL + '/vehicle/barcode/all').
                            then(function (data) {
                                self.barcodeArrayList.removeAll();
                                $.each(data, function () {
                                    var barcode_object = this;
                                    self.barcodeArrayList().push(barcode_object);
                                    db.transaction(function (tx) {

                                        tx.executeSql('INSERT INTO barcode VALUES (?,?,?)', [barcode_object.id, barcode_object.code, barcode_object.status]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Inserting  Barcodes ' + error.message);
                                    });
                                });
                            });
                            
                            
                    $.getJSON(self.serviceURL + '/user/userrole/all').
                            then(function (data) {
                                self.userRoleArrayList.removeAll();
                                $.each(data, function () {
                                    var userrole_object = this;
                                    self.userRoleArrayList().push(userrole_object);
                                    db.transaction(function (tx) {

                                        tx.executeSql('INSERT INTO userrole VALUES (?,?,?)', [userrole_object.id, userrole_object.code, userrole_object.status]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Inserting  Userroles ' + error.message);
                                    });
                                });

                            });

                    $.getJSON(self.serviceURL + '/vehicle/all').
                            then(function (data) {
                                $.each(data, function () {
                                    var vehicle_object = this;
                                    if (typeof vehicle_object.parent === 'undefined') {
                                        vehicle_object.parent = {id: 0};
                                    }
                                    db.transaction(function (tx) {
                                        tx.executeSql('INSERT INTO vehicle (ID,registration_number,fuel,contact,driver,barcode,code,createdby,createdon,updatedby,updatedon,status,parent,category,stage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [vehicle_object.id, vehicle_object.registrationNumber, vehicle_object.fuel.id,
                                            vehicle_object.contact, vehicle_object.driver, vehicle_object.barcode.id, vehicle_object.barcode.code, vehicle_object.createdby.id, vehicle_object.createdon, vehicle_object.updatedby.id, vehicle_object.updatedon,
                                            1, vehicle_object.parent.id, vehicle_object.category.id, 1]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Inserting Vehicle  ' + error.message);
                                    });
                                });
                            });

                    $.getJSON(self.serviceURL + '/user/all').
                            then(function (data) {
                                $.each(data, function () {
                                    var user_object = this;
                                    if (!user_object.updatedby) {
                                        user_object.updatedby = {id: 0};
                                    }
                                    ;
                                    db.transaction(function (tx) {
                                        tx.executeSql('INSERT INTO t_user VALUES (?,?,?,?,?,?,?,?,?,?,?)', [user_object.id, user_object.name, user_object.nin,
                                            user_object.password, user_object.contact, user_object.station.id, user_object.userrole.id, user_object.updatedon, 0,
                                            user_object.status, user_object.userrole.adminLevel]);
                                    }, function (error) {
                                        alert('Transaction ERROR: Inserting User  ' + error.message);
                                    });

                                });
                                
                                var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    rootViewModel.dbExists(true);
                                var popup = document.getElementById('progressDialogue');
                                popup.close();
                            });

                };

                self.updateLocalDB = function () {
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
                                                case 'user':
                                                    if (rowItem.code !== syncMaster_object.code) {
                                                        $.getJSON(self.serviceURL + '/user/all').
                                                                then(function (data) {
                                                                    db.transaction(function (tx) {
                                                                        tx.executeSql('Delete from t_user', []);
                                                                    }, function (error) {
                                                                        alert('Transaction ERROR: Deleting User ' + error.message);
                                                                    });
                                                                    $.each(data, function () {
                                                                        var user_object = this;
                                                                        if (!user_object.updatedby) {
                                                                            user_object.updatedby = {id: 0};
                                                                        };
                                                                        db.transaction(function (tx) {
                                                                            tx.executeSql('INSERT INTO t_user (id,name,nin,password,contact,station,userrole,updatedon,updatedby,status,admin_level) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [user_object.id, user_object.name, user_object.nin,
                                                                                user_object.password, user_object.contact, user_object.station.id, user_object.userrole.id, user_object.updatedon, user_object.updatedby.id,
                                                                                user_object.status, user_object.userrole.adminLevel]);
                                                                        }, function (error) {
                                                                            alert('Transaction ERROR: Updating User ' + error.message);
                                                                        });
                                                                    });
                                                                    tx.executeSql('Delete from SyncMaster');
                                                                    self.syncmasterArrayList().forEach(function (sync_object) {
                                                                        tx.executeSql('INSERT INTO SyncMaster VALUES (?,?,?)', [sync_object.id, sync_object.code, sync_object.name]);
                                                                    });
                                                                });

                                                        $.getJSON(self.serviceURL + '/user/userrole/all').
                                                                then(function (data) {
                                                                    self.userRoleArrayList.removeAll();
                                                                    $.each(data, function () {
                                                                        var userrole_object = this;
                                                                        self.userRoleArrayList().push(userrole_object);
                                                                        db.transaction(function (tx) {
                                                                            tx.executeSql('Delete from userrole');
                                                                            tx.executeSql('INSERT INTO userrole VALUES (?,?,?)', [userrole_object.id, userrole_object.code, userrole_object.status]);
                                                                        }, function (error) {
                                                                            alert('Transaction ERROR: Inserting  Userroles ' + error.message);
                                                                        });
                                                                    });

                                                                });

                                                    }
                                                    break;
                                                case 'station':
                                                    if (rowItem.code !== syncMaster_object.code) {
                                                        tx.executeSql('Delete from station');
                                                        $.getJSON(self.serviceURL + '/station/all').
                                                                then(function (data) {
                                                                    self.stationArrayList.removeAll();
                                                                     self.status(1);
                                                                    $.each(data, function () {
                                                                        var station_object = this;
                                                                        self.stationArrayList().push(station_object);
                                                                        db.transaction(function (tx) {
                                                                            tx.executeSql('INSERT INTO station VALUES (?,?)', [station_object.id, station_object.name]);
                                                                        }, function (error) {
                                                                            alert('Transaction ERROR: Update  Station  ' + error.message);
                                                                        });
                                                                    });
                                                                    tx.executeSql('Delete from SyncMaster');
                                                                    self.syncmasterArrayList().forEach(function (sync_object) {
                                                                        tx.executeSql('INSERT INTO SyncMaster VALUES (?,?,?)', [sync_object.id, sync_object.code, sync_object.name]);
                                                                    });
                                                                });

                                                    }
                                                    break;
                                                case 'fuel':
                                                    if (rowItem.code !== syncMaster_object.code) {
                                                        tx.executeSql('Delete from fuel');
                                                        $.getJSON(self.serviceURL + '/stock/fuel/all').
                                                                then(function (data) {
                                                                    $.each(data, function () {
                                                                        var vehicle_object = this;
                                                                        db.transaction(function (tx) {
                                                                            tx.executeSql('INSERT INTO fuel VALUES (?,?)', [vehicle_object.id, vehicle_object.name]);
                                                                        }, function (error) {
                                                                            alert('Transaction ERROR:  Adding  Fuel Type ' + error.message);
                                                                        });
                                                                    });
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



            


                self.serverStatus = function () {
                    $.getJSON(self.serviceURL + '/user/all').
                            then(function (data) {
                                if (self.network().status === 0) {
                                    var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    rootViewModel.network({status: 1, refresh: true});
                                }
                            }).fail(function (jqXHR, textStatus, errorThrown) {
                        if (self.network().status === 1) {
                            var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                            rootViewModel.network({status: 0, refresh: false});
                        }
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
                                    var barcode_object = {id: res.rows.item(i).id, code: res.rows.item(i).code, status: res.rows.item(i).status};
                                    self.barcodeArrayList().push(barcode_object);
                                }
                            }
                        });
                    });
                };
                
                self.showMap = function(){
                    self.selectedItem('map');
                    self.selectedItemFooter('login');
                    setTimeout(function() {
                        self.getMylocation();
                    }, 1000);
                };
                self.showLogin = function(){
                    self.selectedItem('login');
                    self.selectedItemFooter('map');
                };
                
                
                
                
                 self.getMylocation = function () {
                    var div = document.getElementById("googleMaps");
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
                    console.log('okkkkkkkkkkkkkkkkkk');
                    map.one(plugin.google.maps.event.MAP_READY, function () {
                        var onSuccess = function (location) {
                            self.latitude(location.latLng.lat);
                            self.longtude(location.latLng.lng);
                            var msg = ['Your Location'+"\n",
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
                            });
                           console.log('yyyyyyyyyyyyyyyyyyyyyy');
                        };
                        var onError = function (msg) {
                            alert(JSON.stringify(msg));
                        };
                        var options = {
                                enableHighAccuracy: false  // Set true if you want to use GPS. Otherwise, use network.
                            };
                        map.getMyLocation(options, onSuccess, onError,{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
                    });
                };
                
                
                
//                
//                self.getMylocation = function () {
//                    var div = document.getElementById("googleMaps");
//                    var map = plugin.google.maps.Map.getMap(div);
//                    db.transaction(function (tx) {
//                        tx.executeSql("SELECT * from station", [], function (tx, res) {
//                            if (res.rows.length > 0) {
//                                self.stationArrayList.removeAll();
//                                for (var i = 0; i < res.rows.length; i++)
//                                {
//                                    self.stationArrayList().push(res.rows.item(i));
//                                }
//                            }
//                        });
//                    });
//                    map.one(plugin.google.maps.event.MAP_READY, function () {
//                        var onSuccess = function (location) {
//                            var msg = ["Current your location:\n",
//                                "latitude:" + location.latLng.lat,
//                                "longitude:" + location.latLng.lng,
//                                "speed:" + location.speed,
//                                "time:" + location.time,
//                                "bearing:" + location.bearing].join("\n");
//                            map.addMarker({
//                                'position': location.latLng,
//                                'title': msg
//                            }, function (marker) {
//                                marker.showInfoWindow();
//                                map.animateCamera({
//                                    target: location.latLng,
//                                    zoom: 15
//                                }, function () {
//                                    marker.showInfoWindow();
//                                });
//                            });
//                            self.stationArrayList().forEach(function(station){
//                            map.addMarker({
//                                'position': {'lat': station.latitude, 'lng': station.longtude},
//                                'title': station.name
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
//                            });
//                            
//                        };
//                        var onError = function (msg) {
//                            alert(JSON.stringify(msg));
//                        };
//                        
//                         map.clear();
//                            var options = {
//                                enableHighAccuracy: false  // Set true if you want to use GPS. Otherwise, use network.
//                            };
//                            map.getMyLocation(options, onSuccess, onError);
// 
//                    });
//                };


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
                    accUtils.announce('Login page loaded.', 'assertive');
                    document.title = "Login";
                     
                    setInterval(function () {
                        self.serverStatus();
                    }, 3600000);
                    
                    if(self.dbExists()){
                         self.status(1);
                    self.updateLocalDB();
                    }

                    self.serverStatus();
                    self.handleDataSynchronization();
                    if (cordova.platformId == 'android') {
                        StatusBar.backgroundColorByHexString("#2d710a");
                    }
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
//                   self.getMylocation();
                };
            }

            /*
             * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
             * return a constructor for the ViewModel so that the ViewModel is constructed
             * each time the view is displayed.
             */
            return LoginViewModel;
        }
);
