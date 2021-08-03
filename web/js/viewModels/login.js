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
define(['knockout',"ojs/ojbootstrap", "ojs/ojasyncvalidator-regexp", "ojs/ojconverter-number", "ojs/ojasyncvalidator-numberrange", 'jquery', 'appController', 'ojs/ojmodule-element-utils', 'accUtils', 'ojs/ojcontext', 'ojs/ojcore', 'knockout',
    'ojs/ojcorerouter',
    'ojs/ojurlparamadapter', 'ojs/ojknockout-keyset', 'ojs/ojvalidation-base', 'ojs/ojarraydataprovider', 'ojs/ojmessaging', 'ojs/ojmessages', 'ojs/ojmessage', 'ojs/ojresponsiveknockoututils',
    'ojs/ojknockout', 'ojs/ojvalidation-base', 'ojs/ojmodule', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojbutton', 'ojs/ojavatar',
    'ojs/ojdefer', 'ojs/ojpopup', 'ojs/ojdialog', 'ojs/ojswitcher', 'ojs/ojlabel',  'ojs/ojprogress-circle',
    'ojs/ojformlayout',  'ojs/ojinputtext', 'ojs/ojmenu', 'ojs/ojoption',"ojs/ojinputnumber", 'ojs/ojrouter'],
        function (ko,Bootstrap, AsyncRegExpValidator, ojconverter_number_1, AsyncNumberRangeValidator, $, app, moduleUtils, accUtils, Context) {
            function LoginViewModel(args) {
                var self = this;
                self.router = args.parentRouter;
                self.routerLinks = ko.dataFor(document.getElementById('globalBody')).routerLinks;
                self.serviceURL = ko.dataFor(document.getElementById('globalBody')).serviceURL;
                self.user = ko.dataFor(document.getElementById('globalBody')).user;
                self.datasource = ko.observable();
                self.sessionUser = ko.observable({id: 0, contact:null, password: null});
                self.progressVisibility = ko.observable(false);
                self.loginButtonVisibility = ko.observable(true);
                self.feedbackVisibility = ko.observable(false);
                self.selectedItem = ko.observable('login');
                self.status = ko.observable(0);
                self.selectedItemHeader = ko.observable('login');
                self.selectedItemFooter = ko.observable('login');
                
                self.vehicleArrayList = ko.observableArray([]);
                self.stationArrayList = ko.observableArray([]);
                
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
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


                
                self.setUserLogin = function(){
                    if (self.passwordValid() === 'valid' && self.userContactValid() === 'valid') {
                        
                                            document.getElementById("progressDialogue").open();
                    self.loginButtonVisibility(false);
                    self.feedbackVisibility(false);
                    var url = self.serviceURL + '/user/login';
                    var json_object = {contact:self.sessionUser().contact, password:self.sessionUser().password};
                             $.ajax({
                            type: "POST",
                            url: url,
                            data: ko.toJSON(json_object),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (res) {
                                document.getElementById("progressDialogue").close();
                               if(res.data.id>0){
                                   if(res.data.status>0){
                                      self.loginButtonVisibility(true);
                                    var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    rootViewModel.user(res.data);
                                    var pageViewModel = ko.dataFor(document.getElementById('globalBody'));
                                    var roleViewModel = ko.dataFor(document.getElementById('globalBody')); 
                                    switch (res.data.userrole.adminLevel) {
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
                                       
                                   }else{
                                       self.loginButtonVisibility(true);
                                self.feedbackVisibility(true);
                                     alert('Access Dennied Contact System Administrator... !!!');  
                                   }
                                   
                               }else{
                                   alert('Invalid Credentials... !!!');
                                   self.loginButtonVisibility(true);
                               }

                            },
                            failure: function (jqXHR, textStatus, errorThrown) {
                                document.getElementById("progressDialogue").close();
                                self.msg({severity: 'error', summary: 'Failed!!!', detail: 'Signing User Failed'});
                                console.log(errorThrown);
                            }
                        });
                        
                            }else{
                               let username = document.getElementById("password");
                        username.showMessages();
                        let contact = document.getElementById("contact");
                        contact.showMessages();
                            }
                    

                };
                
                self.getVehicleList = function(){
                    $.getJSON(self.serviceURL + '/vehicle/all').
                            then(function (data) {
                                self.vehicleArrayList.removeAll();
                                $.each(data, function () {
                                 self.vehicleArrayList().push(this);  
                                });
                            });
                };

                
                self.passwordValid = ko.observable("valid");
                self.passwordRequired = ko.observable(true);
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
                self.connected = function () {
                    accUtils.announce('Login page loaded.', 'assertive');
                    document.title = "Login";
                     
                    setInterval(function () {
                        self.getVehicleList();
                    }, 3600000);
                    self.getVehicleList();
                   
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
            return LoginViewModel;
        }
);
