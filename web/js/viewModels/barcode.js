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
    'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojformlayout', 'ojs/ojtable', 'ojs/ojarraytabledatasource',
    'ojs/ojpagingcontrol', 'ojs/ojpagingtabledatasource', 'ojs/ojdialog',
    'ojs/ojinputnumber', 'ojs/ojprogress-circle', 'ojs/ojinputsearch'],
        function (ko, app, moduleUtils, accUtils, Context, oj, ko, $, Hammer, ValidationBase, Message) {

            function BarcodeViewModel(context) {
                var self = this;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.datasource = ko.observable();
                self.barcode = ko.observable({id: 0, code: '', status: 0, createdOn: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    usedby: {id: 0, name: ''}});
                self.progressVisibility = ko.observable(false);
                self.feedbackVisibility = ko.observable(false);
                self.barcodeFilter = ko.observable('');
                self.currentCancelBehaviorOpt = ko.observable('icon');
                self.barcodeArrayList = ko.observableArray([]);
                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });


                self.isSmall = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(
                        oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));

                self.columnArray = [
                    {"headerText": "Code"},
                    {"headerText": "Status"},
                    {"headerText": "CreatedOn"}
                ];


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
                        }

                    };
                }, self);

                var logMessage = function (message) {
                    console.log(message);
                };


                self.handleBarcodeChanged = function (event) {
                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearBarcodeClick();
                        return;
                    }
                    var barcodeArray = [];
                    var i;
                    for (i = self.barcodeArrayList.length; i >= 0; i--)
                    {
                        self.barcodeArrayList().forEach(function (value) {
                            if ((value['code'].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (barcodeArray.indexOf(self.barcodeArrayList[i]) < 0)
                                {
                                    var barcode_obj = {
                                        id: value['id'],
                                        code: value['code'],
                                        status: value['status'],
                                        createdon: value['createdon'],
                                        usedby: value['usedby']
                                    };
                                    barcodeArray.push(barcode_obj);
                                }
                            }
                        });
                    }
                    barcodeArray.reverse();
                    self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(barcodeArray, {idAttribute: 'id'})));
                };

                self.clearBarcodeClick = function (event) {
                    self.barcodeFilter('');
                    self.datasource(new oj.PagingTableDataSource(new oj.ArrayTableDataSource(self.barcodeArrayList, {idAttribute: 'id'})));
                    return true;
                };



                // toggle show/hide offcanvas
                self.toggle = ko.observable(false);
                self.toggleBarcodeDrawer = function (param) {
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



                self.getBarcodeList = function () {
                    self.progressVisibility(true);
                    var url = self.serviceURL + '/vehicle/barcode/all';
                    $.getJSON(url).
                            then(function (data) {
                                self.barcodeArrayList.removeAll();
                                $.each(data, function () {
                                    var barcode = {
                                        id: this.id,
                                        code: this.code,
                                        status: this.status,
                                        createdon: this.createdOn ? this.createdOn.split('T')[0] : "",
                                        usedby: this.usedby
                                    };
                                    self.barcodeArrayList().push(barcode);
                                });
                                self.datasource(new oj.ArrayTableDataSource(self.barcodeArrayList, {idAttribute: 'id'}));
                            });
                };




                self.generateBarcodes = function () {
                    self.progressVisibility(true);
                    var url = self.serviceURL + '/vehicle/generate/barcode';
                    $.getJSON(url).
                            then(function (data) {
                                self.barcodeArrayList.removeAll();
                                $.each(data, function () {
                                    var barcode = {
                                        id: this.id,
                                        code: this.code,
                                        status: this.status,
                                        createdon: this.createdOn ? this.createdOn.split('T')[0] : "",
                                        usedby: this.usedby
                                    };
                                    self.barcodeArrayList().push(barcode);
                                });
                                self.datasource(new oj.ArrayTableDataSource(self.barcodeArrayList, {idAttribute: 'id'}));
                            });
                };





                self.printBarcodes = function () {
                    var barcodeArray = [];
                    var paymentArray = [];
                    var columnValues = [];
                    var columns = [];
                    columns.push('No');
                    columns.push('Referenceno');

                    var numCounter = 0;
                    var columnHeaders = [[columns]];
                    self.barcodeArrayList().forEach(function (barcode) {
                        if (barcode.status === 0) {
                            barcodeArray.push({id: barcode.id, code: barcode.code, status: 1, createdOn: barcode.createdon});
                            numCounter = numCounter + 1;
                            columnValues = [numCounter, barcode.code];
                            columnHeaders.push([columnValues]);
                        }
                    });

                    console.log(barcodeArray);


                    var url = self.serviceURL + '/vehicle/barcode/print';
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: ko.toJSON(barcodeArray),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (res) {
                            var excelSheet = "";
                            columnHeaders.forEach(function (RowItem, RowIndex) {
                                RowItem.forEach(function (ColItem, ColIndex) {
                                    excelSheet += ColItem + ',';
                                });
                                excelSheet += "\r\n";
                            });
                            excelSheet = "data:application/xls," + encodeURIComponent(excelSheet);
                            var excelform = document.createElement("A");
                            excelform.setAttribute("href", excelSheet);
                            var date = new Date();
                            excelform.setAttribute("download", "Fueless.xls");
                            document.body.appendChild(excelform);
                            excelform.click();

                        },
                        failure: function (jqXHR, textStatus, errorThrown) {
                            self.msg({severity: 'error', summary: 'Failed!!!', detail: 'updating Printed Barcodes  Failed ! ! !'});
                            console.log(errorThrown);
                        }
                    });
//                    
//                    



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
                    accUtils.announce('Barcode page loaded.', 'assertive');
                    document.title = "Barcode";
                    self.getBarcodeList();
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
            return BarcodeViewModel;
        }
);
