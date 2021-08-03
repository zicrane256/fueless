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
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset', "ojs/ojprogress-circle", 'ojs/ojdatetimepicker',
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojprogress', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource',  'ojs/ojlistview', 'ojs/ojlistitemlayout', 'ojs/ojmodule', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojcollectiontreedatasource', 'ojs/ojarraytreedataprovider', 'ojs/ojinputtext', 'ojs/ojinputsearch', "ojs/ojconveyorbelt"],
        function (ko, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider) {
            function SalehistoryViewModel($params) {
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.status = ko.dataFor(document.getElementById('globalBody')).status;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.sale = ko.observable({id: 0, quantity: 0, unitcost: 0, amount: 0, createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    fuel: {id: 0, name: ''}, station: {id: 0, name: ''}, createdBy: {id: 0, name: ''},
                    vehicle: {id: 0, registrationNumber: '', barcode: ''},
                    driver: ''});
                self.salehistoryArrayList = ko.observableArray([]);
                self.vehicleArrayList = ko.observableArray([]);
                self.saleFilter = ko.observable();
                self.datasource = ko.observable();
                self.saleDatasource = ko.observable();
                self.selectedSale = ko.observable();
                self.totalAmount = ko.observable(0);
                self.totalQty = ko.observable(0);
                self.discountAmount = ko.observable(0);
                self.discountQty = ko.observable(0);
                self.totalVehicle = ko.observable(0);
                self.isRequired = ko.observable(true);
                self.isHelpSource = ko.observable(true);
                self.isHelpDef = ko.observable(true);
                self.progressVisibility = ko.observable(false);
                self.searchOption = ko.observable('Search');
                self.searchOptionDatasource = ko.observable();
                self.ModuleElementUtils = ModuleElementUtils;
                self.fuelOptionArrayList = ko.observableArray([]);
                self.selectedItemHeader = ko.observable('main');
                self.selectedItemMain = ko.observable('main');
                self.selectedItemFooter = ko.observable('main');
                self.startDate = ko.observable(ValidationBase.IntlConverterUtils.dateToLocalIso(new Date()));
                self.endDate = ko.observable(ValidationBase.IntlConverterUtils.dateToLocalIso(new Date()));
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


                self.showSearchList = function () {
                    self.selectedItemHeader('search');

                };
                self.showDatesSearch = function () {
                    self.selectedItemHeader('searchdate');
                    self.selectedItemMain('search');
                    self.selectedItemFooter('search');
                };

                self.showMain = function () {
                    self.selectedItemHeader('main');
                    self.selectedItemMain('main');
                    self.selectedItemFooter('main');
                    setTimeout(function () {
                        self.saleFilter('');
                    }, 2000);
                };



                

                self.showSaleSearch = function () {
                    document.querySelector('#saleSearchPopup').open();

                };
                self.closeSaleSearchPopUp = function () {
                    document.querySelector('#saleSearchPopup').close();

                };



                self.getSaleHistoryDates = function () {
                    self.progressVisibility(true);
                    var qty = 0;
                    var amt = 0;
                    var url = self.serviceURL + '/sale/search/historydate/station/' + self.user().station.id;
                    var json_object = {startDate: self.startDate(), endDate: self.endDate()};
                    var qty = 0;
                    var amt = 0;
                    var discountQty = 0;
                    var discountAmt = 0;
                    document.querySelector('#progressDialogue').open();
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(json_object),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            document.querySelector('#progressDialogue').close();
                             self.salehistoryArrayList.removeAll();
                             self.vehicleArrayList.removeAll();
                             self.showMain();
                              $.each(res.data, function () {
                                    self.vehicleArrayList().push(this.vehicle);
                                    var sale = {
                                        id: this.id,
                                        unitcost: this.unitcost,
                                        sellingprice: this.sellingprice,
                                        amount: this.amount,
                                        quantity: this.quantity,
                                        createdon: this.createdOn ? this.createdOn.split('T')[0] : "",
                                        fuel: this.fuel,
                                        station: this.station,
                                        createdby: this.createdBy,
                                        vehicle: this.vehicle
                                    };
                                    discountQty = discountQty + ((this.amount / this.sellingprice) - (this.amount / this.unitcost));
                                    discountAmt = discountAmt + ((this.amount / this.sellingprice) - (this.amount / this.unitcost)) * this.unitcost;
                                    sale.discountQty = ((this.amount / this.sellingprice) - (this.amount / this.unitcost)).toFixed(2);
                                    sale.discountAmt = Math.round(((this.amount / this.sellingprice) - (this.amount / this.unitcost)) * this.unitcost);
                                    sale.description = ' Qty  ' + sale.quantity + ' Ltrs' + '  D-qty  ' + discountQty.toFixed(2) + ' Ltrs ' +
                                            sale.station.name + ' ' + sale.unitcost + ' Shs' + '  D-Amt ' + discountAmt.toFixed(2) + ' Shs';
                                    qty = qty + this.quantity;
                                    amt = amt + this.amount;
                                    self.salehistoryArrayList().push(sale);
                                });
                        
                          const uniqueVehicles = Array.from(new Set(self.vehicleArrayList().map(a => a.id)))
                                        .map(id => {
                                            return self.vehicleArrayList().find(a => a.id === id);
                                        });
                                self.vehicleArrayList(uniqueVehicles);
                                self.totalVehicle(self.vehicleArrayList().length);
                                self.totalQty(qty.toFixed(2));
                                self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                self.discountQty(discountQty.toFixed(2));
                                self.discountAmount(Math.round(discountAmt).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                self.datasource(new ArrayDataProvider(self.salehistoryArrayList, {keyAttributes: "id"}));
                        
                        
                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                            document.querySelector('#progressDialogue').close();
                            
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Sale Search Failed'});
                            console.log(errorThrown);
                        }
                    });

                };


                self.getSaleHistoryList = function () {
                    self.progressVisibility(true);
                    var url = self.serviceURL + '/sale/search/station/' + self.user().station.id;
                    var qty = 0;
                    var amt = 0;
                    var discountQty = 0;
                    var discountAmt = 0;
                    $.getJSON(url).
                            then(function (data) {
                                self.salehistoryArrayList.removeAll();
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                    self.vehicleArrayList().push(this.vehicle);
                                    var sale = {
                                        id: this.id,
                                        unitcost: this.unitcost,
                                        sellingprice: this.sellingprice,
                                        amount: this.amount,
                                        quantity: this.quantity,
                                        createdon: this.createdOn ? this.createdOn.split('T')[0] : "",
                                        fuel: this.fuel,
                                        station: this.station,
                                        createdby: this.createdBy,
                                        vehicle: this.vehicle
                                    };
                                    discountQty = discountQty + ((this.amount / this.sellingprice) - (this.amount / this.unitcost));
                                    discountAmt = discountAmt + ((this.amount / this.sellingprice) - (this.amount / this.unitcost)) * this.unitcost;
                                    sale.discountQty = ((this.amount / this.sellingprice) - (this.amount / this.unitcost)).toFixed(2);
                                    sale.discountAmt = Math.round(((this.amount / this.sellingprice) - (this.amount / this.unitcost)) * this.unitcost);
                                    sale.description = ' Qty  ' + sale.quantity + ' Ltrs' + '  D-qty  ' + discountQty.toFixed(2) + ' Ltrs ' +
                                            sale.station.name + ' ' + sale.unitcost + ' Shs' + '  D-Amt ' + discountAmt.toFixed(2) + ' Shs';
                                    qty = qty + this.quantity;
                                    amt = amt + this.amount;
                                    self.salehistoryArrayList().push(sale);
                                });
                                const uniqueVehicles = Array.from(new Set(self.vehicleArrayList().map(a => a.id)))
                                        .map(id => {
                                            return self.vehicleArrayList().find(a => a.id === id);
                                        });
                                self.vehicleArrayList(uniqueVehicles);
                                self.totalVehicle(self.vehicleArrayList().length);
                                self.totalQty(qty.toFixed(2));
                                self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                self.discountQty(discountQty.toFixed(2));
                                self.discountAmount(Math.round(discountAmt).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                self.datasource(new ArrayDataProvider(self.salehistoryArrayList, {keyAttributes: "id"}));
//                                console.log(self.vehicleArrayList());
                            });
                };

           

                self.printSaleList = function () {
                    var qty = 0;
                    var amt = 0;
                    var discountQty = 0;
                    var discountAmt = 0;
                    var paymentArray = [];
                    var columnValues = [];
                    var columns = [];
                    columns.push('No');
                    columns.push('Date');
                    columns.push('Vehicle');
                    columns.push('Station');
                    columns.push('Teller');
                    columns.push('Fuel');
                    columns.push('Price');
                    columns.push('Quantity');
                    columns.push('DiscountQty');
                    columns.push('Discount');
                    columns.push('Amount');
                    var numCounter = 0;
                    var columnHeaders = [[columns]];
                    self.salehistoryArrayList().forEach(function (salehistory) {
                        numCounter = numCounter + 1;
                        columnValues = [numCounter, salehistory.createdon, salehistory.vehicle.registrationNumber,
                            salehistory.station.name, salehistory.createdby.name,
                            salehistory.fuel.name,
                            salehistory.unitcost, salehistory.quantity, salehistory.discountQty, salehistory.discountAmt, salehistory.amount];
                        columnHeaders.push([columnValues]);
                    });

                    self.salehistoryArrayList().forEach(function (sale) {
                        discountQty = discountQty + ((sale.amount / sale.sellingprice) - (sale.amount / sale.unitcost));
                        discountAmt = discountAmt + ((sale.amount / sale.sellingprice) - (sale.amount / sale.unitcost)) * sale.unitcost;
                        sale.discountQty = ((sale.amount / sale.sellingprice) - (sale.amount / sale.unitcost)).toFixed(2);
                        sale.discountAmt = Math.round(((sale.amount / sale.sellingprice) - (sale.amount / sale.unitcost)) * sale.unitcost);
                        qty = qty + sale.quantity;
                        amt = amt + sale.amount;
                    });

                    self.totalQty(qty.toFixed(2));
                    self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    self.discountQty(discountQty.toFixed(2));
                    self.discountAmount(Math.round(discountAmt).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));


                    var totalColumnValues = [' ', ' ', ' ', 'Total ', ' ', ' ', ' ',
                        self.totalQty(),
                        self.discountQty(),
                        self.discountAmount(), self.totalAmount()];
                    columnHeaders.push([totalColumnValues]);

                    var excelSheet = "";
                    columnHeaders.forEach(function (RowItem, RowIndex) {
                        RowItem.forEach(function (ColItem, ColIndex) {
                            excelSheet += ColItem + ',';
                        });
                        excelSheet += "\r\n";
                    });
                    var m = new Date();
                    var time_signature = m.getFullYear() + '-' + ("0" + (m.getMonth() + 1)).slice(-2) + '-' + ("0" + m.getDate()).slice(-2) +
                            ("0" + m.getHours()).slice(-2) + '-' +
                            ("0" + m.getMinutes()).slice(-2);
                    excelSheet = "data:application/xls," + encodeURIComponent(excelSheet);
                    var salehistoryexcel = document.createElement("A");
                    salehistoryexcel.setAttribute("href", excelSheet);
                    var date = new Date();
                    salehistoryexcel.setAttribute("download", "SaleHistory " + time_signature + ".xls");
                    document.body.appendChild(salehistoryexcel);
                    salehistoryexcel.click();
                };


                self.handleSaleChanged = function (event) {
                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearSaleClick();
                        return;
                    }
                    var saleArray = [];
                    var i;
                    var qty = 0;
                    var amt = 0;
                    for (i = self.salehistoryArrayList.length; i >= 0; i--)
                    {
                        self.salehistoryArrayList().forEach(function (value) {
                            if ((value['vehicle'].registrationNumber.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['station'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['updatedby'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (saleArray.indexOf(self.salehistoryArrayList[i]) < 0)
                                {
                                    var sale_obj = {
                                        id: value['id'],
                                        unitcost: value['unitcost'],
                                        quantity: value['quantity'],
                                        amount: value['amount'],
                                        createdon: value['createdon'],
                                        fuel: value['fuel'],
                                        station: value['station'],
                                        createdby: value['createdby'],
                                        discountAmt: value['discountAmt'],
                                        discountQty: value['discountQty'],
                                        vehicle: value['vehicle']
                                    };
                                    qty = qty + value['quantity'];
                                    amt = amt + value['amount'];
                                    saleArray.push(sale_obj);
                                }
                                self.totalQty(qty.toFixed(2));
                                self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                            }
                        });
                    }
                    saleArray.reverse();
//                    self.datasource(new oj.ArrayTableDataSource(saleArray, {idAttribute: 'id'}));
                    self.datasource(new ArrayDataProvider(saleArray, {keyAttributes: "id"}));
                    self.vehicleArrayList.removeAll();
                    saleArray.forEach(function (sale) {
                        self.vehicleArrayList().push(sale.vehicle);
                    });
                    const uniqueVehicles = Array.from(new Set(self.vehicleArrayList().map(a => a.id)))
                            .map(id => {
                                return self.vehicleArrayList().find(a => a.id === id);
                            });
                    self.vehicleArrayList(uniqueVehicles);
                    self.totalVehicle(self.vehicleArrayList().length);
                };

                self.clearSaleClick = function (event) {
                    self.saleFilter('');
                    var qty = 0;
                    var amt = 0;
                    self.salehistoryArrayList().forEach(function (sale) {
                        qty = qty + sale.quantity;
                        amt = amt + sale.amount;
                    });
                    self.totalQty(qty.toFixed(2));
                    self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    const uniqueVehicles = Array.from(new Set(self.vehicleArrayList().map(a => a.id)))
                            .map(id => {
                                return self.vehicleArrayList().find(a => a.id === id);
                            });
                    self.vehicleArrayList(uniqueVehicles);
                    self.totalVehicle(self.vehicleArrayList().length);
//                    self.datasource(new oj.ArrayTableDataSource(self.salehistoryArrayList, {idAttribute: 'id'}));
                    self.datasource(new ArrayDataProvider(self.salehistoryArrayList, {keyAttributes: "id"}));
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
                    accUtils.announce('Sale hIstory page loaded.', 'assertive');
                    document.title = "Sales";
                    self.getSaleHistoryList();
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
            return SalehistoryViewModel;
        }
);
