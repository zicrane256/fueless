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
define(['knockout', "ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-number", "ojs/ojasyncvalidator-numberrange", 'appController', 'ojs/ojmodule-element-utils', 'ojs/ojcontext', 'accUtils', 'ojs/ojcore', 'knockout', 'jquery', 'ojs/ojvalidation-base', 'ojs/ojmodule-element-utils',
    "ojs/ojarraydataprovider", "ojs/ojknockout-keyset", "ojs/ojkeyset", "ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", 'ojs/ojbutton', 'ojs/ojpopup', 'ojs/ojlistview', 'ojs/ojlistitemlayout',
    'ojs/ojformlayout', 'ojs/ojdefer', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojinputtext', 'ojs/ojcheckboxset', "ojs/ojprogress-circle", 'ojs/ojdatetimepicker',
    'ojs/ojtable', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', "ojs/ojinputnumber", 'ojs/ojpagingtabledatasource', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojarraydataprovider',
    'ojs/ojarraytabledatasource', 'ojs/ojmodule', 'ojs/ojdefer', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojoption', "ojs/ojselectcombobox",
    'ojs/ojcollectiontreedatasource', 'ojs/ojarraytreedataprovider', 'ojs/ojinputtext', 'ojs/ojinputsearch', "ojs/ojswitcher"],
        function (ko, Bootstrap, AsyncRegExpValidator, ojconverter_number_1, AsyncNumberRangeValidator, app, moduleUtils, Context, accUtils, oj, ko, $, ValidationBase, ModuleElementUtils, ArrayDataProvider, keySet) {
            function UserViewModel(args) {
                var self = this;
                self.router = args.parentRouter;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.sessionUser = ko.dataFor(document.getElementById('globalBody')).user;
                self.selectedStation = ko.dataFor(document.getElementById('globalBody')).selectedStation;
                self.selectedRole = ko.dataFor(document.getElementById('globalBody')).selectedRole;
                self.status = ko.dataFor(document.getElementById('globalBody')).status;
                self.msg = ko.dataFor(document.getElementById('globalBody')).msg;
                self.user = ko.observable({id: 0, name: '', nin: '', password: '', contact: 0, confirmPassword: '', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()),
                    status: 1, updatedby: {id: 0, name: ''}, userrole: {id: 0, name: ''}});
                self.userArrayList = ko.observableArray([]);
                self.userFilter = ko.observable();
                self.datasource = ko.observable();
                self.optionDatasource = ko.observable();
                self.isRequired = ko.observable(true);
                self.isHelpSource = ko.observable(true);
                self.isHelpDef = ko.observable(true);
                self.progressVisibility = ko.observable(false);
                self.addButtonVisibility = ko.observable(true);
                self.updateButtonVisibility = ko.observable(false);
                self.syncmasterArrayList = ko.observableArray([]);
                self.password = ko.observable();
                self.confirmPassword = ko.observable();
                self.searchOption = ko.observable('Search');
                self.searchOptionDatasource = ko.observable();
                self.header = ko.observable('Membership');
                self.ModuleElementUtils = ModuleElementUtils;
                self.selectedItem = ko.observable("form");
                self.selectedItemMain = ko.observable('main');
                self.selectedItemHeader = ko.observable('main');
                self.selectedItemFooter = ko.observable('main');
                self.crudOptionArrayList = ko.observableArray([
                    {id: 'UPDATE', label: 'Save Changes'}, {id: 'ENABLE', label: 'Enable'}, {id: 'DISABLE', label: 'Disable'}, {id: 'DELETE', label: 'Delete'}, {id: 'CLOSE', label: 'Exit'}
                ]);



                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });

                self.selectedUserItems = new keySet.ObservableKeySet();
                self.handleSelectedUserChanged = (event) => {
                    Array.from(event.detail.value.values()).forEach(function (roleId) {
                        let user = self.userArrayList().find(p => p.id === roleId);
                        self.user(user);
                        self.selectedItemHeader('edit');
                        self.selectedItemMain('edit');
                        self.selectedItemFooter('edit');
                        self.header(self.user().name);
                        self.user().updatedby = self.sessionUser();
                        self.addButtonVisibility(false);
                        self.updateButtonVisibility(true);
                        self.selectedItem('form');
                        self.header(self.user().name);

                    });
                };


                var subscription = self.selectedStation.subscribe(
                        function () {
                            self.user().station = self.selectedStation();
                            self.user(self.user());
                            self.selectedItem('form');
                            self.selectedItemHeader('edit');
                        }
                );
                var roleSubscription = self.selectedRole.subscribe(
                        function () {
                            self.user().userrole = self.selectedRole();
                            self.user(self.user());
                            self.selectedItem('form');
                            self.selectedItemHeader('edit');
                        }
                );


                self.showMainview = function () {
                    self.selectedItem('form');
                    self.selectedItemHeader('main');
                    self.selectedItemMain('main');
                    self.selectedItemFooter('main');
                    self.selectedItem('form');
                    self.header('Membership');

                };




                self.showUpdatePassword = function () {
                    self.selectedItemMain('edit');
                    self.selectedItemFooter('edit');
                    self.selectedItem('password');
                    self.user().updatedby = self.sessionUser();
                    self.selectedItemHeader('password');
                    self.header(self.user().name);
                    self.password(self.sessionUser().password);
                    self.confirmPassword(self.sessionUser().password);
                };


                self.addRegistrationview = function () {
                    self.selectedItem('form');
                    self.user({id: 0, name: '', nin: '', password: null, confirmPassword: '',
                        updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: 1, updatedby: self.sessionUser()});
                    self.selectedItemHeader('edit');
                    self.selectedItemMain('edit');
                    self.selectedItemFooter('edit');
                    self.selectedItem('form');
                    self.header('Membership');
                    self.addButtonVisibility(true);
                    self.updateButtonVisibility(false);
                };



                self.showSearch = function () {
                    self.selectedItemHeader('search');
                };

                self.showEdit = function () {
                    self.selectedItemHeader('edit');
                    self.selectedItem('edit');
                };

                self.showMain = function () {
                    self.selectedItemHeader('main');
                    setTimeout(function () {
                        self.userFilter('');
                    }, 2000);
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
                

                self.showRolelist = function () {
                    self.selectedItem('staffrole');
                    self.selectedItemHeader('rolelist');
//                    document.querySelector('#rolePopup').open();
                };
                self.closeRolelist = function () {
                    self.selectedItem('form');
                };
                self.openStationlist = function () {
                    self.selectedItem('station');
                    self.selectedItemHeader('station');
                };
                self.closeStationPopUp = function () {
                    document.querySelector('#stationPopup').close();
                };


                self.handleUserChanged = function (event) {
                    var filter = event.target.rawValue;
                    if (filter.length === 0)
                    {
                        self.clearUserClick();
                        return;
                    }
                    var userArray = [];
                    var i;
                    for (i = self.userArrayList.length; i >= 0; i--)
                    {
                        self.userArrayList().forEach(function (value) {
                            if ((value['name'].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) ||
                                    (value['station'].name.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0))
                            {
                                if (userArray.indexOf(self.userArrayList[i]) < 0)
                                {
                                    var user_obj = {
                                        id: value['id'],
                                        station: value['station'],
                                        contact: value['contact'],
                                        name: value['name'],
                                        nin: value['nin'],
                                        updatedon: value['updatedon'],
                                        updatedby: value['updatedby'],
                                        userrole: value['userrole'],
                                        password: value['password'],
                                        status: value['status'],
                                        description: value['description']
                                    };
                                    userArray.push(user_obj);
                                }
                            }
                        });
                    }
                    userArray.reverse();
//                    self.datasource(new oj.ArrayTableDataSource(userArray, {idAttribute: 'id'}));
                    self.datasource(new ArrayDataProvider(userArray, {keyAttributes: "id"}));
                };

                self.clearUserClick = function (event) {
                    self.userFilter('');
//                    self.datasource(new oj.ArrayTableDataSource(self.userArrayList, {idAttribute: 'id'}));
                    self.datasource(new ArrayDataProvider(self.userArrayList, {keyAttributes: "id"}));
                    return true;
                };


                self.addUser = function () {
                    if (self.userNameValid() === 'valid'
                            && self.userContactValid() === 'valid' && self.userNinValid() === 'valid') {
                        var url = self.serviceURL + '/user/crud/create';
                        document.getElementById("progressDialogue").open();
                        var json_object = {station: {id: self.user().station.id}, updatedby: {id: self.sessionUser().id}, name: self.user().name, contact: self.user().contact,
                            userrole: {id: self.user().userrole.id},
                            nin: self.user().nin, password: 'FueLess', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: self.user().status};
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(json_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                document.getElementById("progressDialogue").close();
                                self.getUserList();
                                self.toggleUserDrawer('end');
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                document.getElementById("progressDialogue").close();
                                console.log(errorThrown);
                            }
                        });

                    } else {
                        let username = document.getElementById("username");
                        username.showMessages();
                        let contact = document.getElementById("contact");
                        contact.showMessages();
                        let nin = document.getElementById("nin");
                        nin.showMessages();
                        let userrole = document.getElementById("userrole");
                        userrole.showMessages();
                        let station = document.getElementById("station");
                        station.showMessages();
                    }
                };




                self.getUserList = function () {
                    var optionArray = [];
                    var url = self.serviceURL + '/user/search/station/' + self.sessionUser().station.id;
                    $.getJSON(url).
                            then(function (data) {
                                self.userArrayList.removeAll();
                                $.each(data, function () {
                                    var user = {
                                        id: this.id,
                                        station: this.station,
                                        name: this.name,
                                        nin: this.nin,
                                        contact: parseInt(this.contact),
                                        userrole: this.userrole,
                                        updatedon: this.updatedon ? this.updatedon.split('T')[0] : "",
                                        password: this.password,
                                        status: this.status,
                                        updatedby: this.updatedby,
                                        description: 'Position : ' + this.userrole.name + ' Created  On ' + this.updatedon ? this.updatedon.split('T')[0] : ""
                                    };

                                    if (user.status === 1) {
                                        user.image = 'css/images/userapproved.png';
                                    } else {
                                        user.image = 'css/images/userdisabled.png';
                                    }
                                    self.userArrayList().push(user);
                                });
                                self.datasource(new ArrayDataProvider(self.userArrayList, {keyAttributes: "id"}));
//                                self.datasource(new oj.ArrayTableDataSource(self.userArrayList, {idAttribute: 'id'}));
                            });
                    optionArray.push({id: 1, option: 'Save'});
                    optionArray.push({id: 2, option: 'Enable'});
                    optionArray.push({id: 3, option: 'Disable'});
                    optionArray.push({id: 4, option: 'Delete'});
                    optionArray.push({id: 5, option: 'Cancel'});
                    self.optionDatasource(new oj.ArrayTableDataSource(optionArray));
                };



                self.showEditDialog = function () {
                    document.getElementById("editDialog").open();
                };


                self.crudUser = function (data) {
                    document.getElementById("editDialog").close();
//                    var option = event.target.id;
                    var json_object = {id: self.user().id, station: {id: self.user().station.id}, name: self.user().name, contact: self.user().contact.toString(),
                        userrole: {id: self.user().userrole.id},
                        nin: self.user().nin, password: self.user().password, updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: self.user().status};
                    var url = self.serviceURL + '/user/crud/update';
                    switch (data.option) {
                        case 'Save':
                            self.crudUserData(json_object, url);
                            break;
                        case 'Enable':

                            json_object.status = 1;
                            var url = self.serviceURL + '/user/crud/update';
                            self.user().status = 1;
                            self.user(self.user());
                            self.crudUserData(json_object, url);
                            break;
                        case 'Disable':
                            json_object.status = 0;
                            var url = self.serviceURL + '/user/crud/update';
                            self.user().status = 0;
                            self.user(self.user());
                            self.crudUserData(json_object, url);
                            break;
                        case 'Delete':
                            var json_object = {id: self.user().id};
                            var url = self.serviceURL + '/user/crud/delete';
                            self.crudUserData(json_object, url);
                            break;
                        default:
                            document.getElementById("editDialog").close();
                            self.toggleUserDrawer('end', '');
                            break;
                    }
                };


                self.crudUserData = function (data, url) {

                    if (self.userNameValid() === 'valid'
                            && self.userContactValid() === 'valid' && self.userNinValid() === 'valid') {
                        var json_object = {station: {id: self.user().station.id}, updatedby: {id: self.sessionUser().id}, name: self.user().name, contact: self.user().contact.toString(),
                            userrole: {id: self.user().userrole.id},
                            nin: self.user().nin, password: 'FueLess', updatedon: oj.IntlConverterUtils.dateToLocalIso(new Date()), status: self.user().status};
                        document.getElementById("progressDialogue").open();
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(data),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                document.getElementById("progressDialogue").close();
                                self.getUserList();
                                self.toggleUserDrawer('end');
                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                document.getElementById("progressDialogue").close();
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Updating User Failed'});
                                console.log(errorThrown);
                            }
                        });

                    } else {
                        let username = document.getElementById("username");
                        username.showMessages();
                        let contact = document.getElementById("contact");
                        contact.showMessages();
                        let nin = document.getElementById("nin");
                        nin.showMessages();
                        let userrole = document.getElementById("userrole");
                        userrole.showMessages();
                        let station = document.getElementById("station");
                        station.showMessages();
                    }
                };


                self.logout = function () {
                    self.router.go({path: 'login'});
                };



                self.updatePassword = function () {
                    document.getElementById("logoutdialogreg").close();
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


                self.userNameValid = ko.observable("valid");
                self.userNameRequired = ko.observable(true);
                self.userNinValid = ko.observable("valid");
                self.userNinRequired = ko.observable(true);
                self.userContactValid = ko.observable("valid");
                self.userContactRequired = ko.observable(true);

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
                    document.title = "User Management";
                    self.getUserList();
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
            return UserViewModel;
        }
);
