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
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojcollectiontreedatasource', 'ojs/ojarraytreedataprovider', 'ojs/ojinputtext', 'ojs/ojinputsearch'],
        function (ko, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider) {
            function StockhistoryViewModel($params) {
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.stock = ko.observable({costPrice: 0, availableQty: 0, stockQuantity: 0, updatedOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    fuel: {id: 0, name: ''}, station: {id: 0, name: ''}, updatedby: {id: 0, name: ''}});
                self.stockhistoryArrayList = ko.observableArray([]);
                self.fuelArrayList = ko.observableArray([]);
                self.stockFilter = ko.observable();
                self.datasource = ko.observable();
                self.fuelDatasource = ko.observable();
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



                self.columnArray = [
                    {"headerText": "Date"},
                    {"headerText": "Station"},
                    {"headerText": "Type"},
                    {"headerText": "Quantity"},
                    {"headerText": "Amount"}
                ];



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
                self.toggleStockhistoryDrawer = function (param) {

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
                
                self.eatNonNumbers = function (event) {
                    var charCode = (event.which) ? event.which : event.keyCode;
                    var char = String.fromCharCode(charCode);
                    var replacedValue = char.replace(/[^0-9\.]/g, '');
                    if (char !== replacedValue) {
                        event.preventDefault();
                    }
                };

               self.setFuel = function(event){
                    if(typeof event.detail.data!=='undefined'){
                        self.stock().fuel = {id:parseInt(event.detail.data.value),name:event.detail.data.label,quantity:event.detail.data.quantity};
                        self.stock(self.stock());
                    }
                    
                };
                
                
                
                self.updateStockQuantity = function () {
                    document.querySelector('#progressDialogue').open();
                        var url = self.serviceURL + '/stock/stockhistory/crud/create';
                    self.progressVisibility(true);
                    var stockhistory_object= {costPrice:self.stock().costPrice,availableQty:self.stock().fuel.quantity,stockQuantity:self.stock().stockQuantity,
                        updatedQty:self.stock().fuel.quantity+self.stock().stockQuantity,updatedOn:oj.IntlConverterUtils.dateToLocalIso(new Date()),
                         fuel:{id:self.stock().fuel.id},updatedby:{id:self.user().id},station:{id:self.user().station.id}};
                        $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(stockhistory_object),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            self.progressVisibility(false);
                             self.toggleStockhistoryDrawer('end');
                             document.querySelector('#progressDialogue').close();
                            self.getStockHistoryList();
                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                             document.querySelector('#progressDialogue').close();
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'updating Vehicle Failed'});
                            console.log(errorThrown);
                        }
                    });

                };
                


                self.getStockHistoryList = function () {
                    self.progressVisibility(true);
                    var url = self.serviceURL + '/stock/stockhistory/all';
                    var qty = 0;
                    var amt = 0;
                    $.getJSON(url).
                            then(function (data) {
                                console.log(data);
                                self.stockhistoryArrayList.removeAll();
                                $.each(data, function () {
                                    var stock = {
                                        id: this.id,
                                        costPrice: this.costPrice,
                                        availableQty: this.availableQty,
                                        updatedQty: this.updatedQty,
                                        stockQuantity: this.stockQuantity,
                                        updatedOn: this.updatedOn ? this.updatedOn.split('T')[0] : "",
                                        fuel: this.fuel,
                                        station: this.station,
                                        updatedby: this.updatedby
                                    };
                                    stock.amount = (this.stockQuantity*this.costPrice).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                                    qty = qty + this.stockQuantity;
                                    amt = amt + this.costPrice;
                                    self.stockhistoryArrayList().push(stock);
                                });
                                self.totalQty(qty.toFixed(2));
                                self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(self.stockhistoryArrayList, {idAttribute: 'id'})));
                            });
                };



                self.handleStockChanged = function (event) {
                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearStockClick();
                        return;
                    }
                    var stockArray = [];
                    var i;
                    var qty = 0;
                    var amt = 0;
                    for (i = self.stockhistoryArrayList.length; i >= 0; i--)
                    {
                        self.stockhistoryArrayList().forEach(function (value) {
                            if ((value['fuel'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                 (value['station'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0)   )
                            {
                                if (stockArray.indexOf(self.stockhistoryArrayList[i]) < 0)
                                {
                                    var sale_obj = {
                                        id: value['id'],
                                        costPrice: value['costPrice'],
                                        availableQty: value['availableQty'],
                                        updatedQty: value['updatedQty'],
                                        stockQuantity: value['stockQuantity'],
                                        updatedOn: value['updatedOn'],
                                        station: value['station'],
                                        updatedby: value['updatedby'],
                                        fuel: value['fuel'],
                                        amount: value['amount']
                                    };
                                    qty = qty + value['stockQuantity'];
                                    amt = amt + value['costPrice'];
                                    stockArray.push(sale_obj);
                                }
                                self.totalQty(qty.toFixed(2));
                                self.totalAmount(amt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                            }
                        });
                    }
                    stockArray.reverse();
                    self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(stockArray, {idAttribute: 'id'})));
                };

                self.clearSaleClick = function (event) {
                    self.stockFilter('');
                    
                    self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(self.stockhistoryArrayList, {idAttribute: 'id'})));
                    return true;
                };

                self.getFuellist = function () {
                    $.getJSON(self.serviceURL + '/stock/fuel/all').
                            then(function (returnedData) {
                                self.fuelOptionArrayList.removeAll();
                                $.each(returnedData, function () {
                                    self.fuelOptionArrayList().push({value: this.id, label: this.name,quantity:this.quantity});
                                });
                                self.searchOptionDatasource(new ArrayDataProvider(self.fuelOptionArrayList(), {keyAttributes: "value"}));
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
                self.connected = () => {
                    accUtils.announce('Vehicle page loaded.', 'assertive');
                    document.title = "Stock";
                    self.getFuellist();
                    self.getStockHistoryList();
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
            return StockhistoryViewModel;
        }
);
