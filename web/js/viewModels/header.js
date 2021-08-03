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
define(['knockout', 'appController', 'ojs/ojmodule-element-utils', 'accUtils', 'ojs/ojcontext', 'ojs/ojcore', 'knockout',
    'jquery', 'ojs/ojcorerouter',
    'ojs/ojurlparamadapter', 'ojs/ojknockout-keyset', 'ojs/ojvalidation-base', 'ojs/ojarraydataprovider', 'ojs/ojmessaging', 'ojs/ojmessages', 'ojs/ojmessage', 'ojs/ojresponsiveknockoututils',
    'ojs/ojknockout', 'ojs/ojvalidation-base', 'ojs/ojmodule', 'ojs/ojanimation', 'ojs/ojoffcanvas', 'ojs/ojbutton', 'ojs/ojavatar',
    'ojs/ojdefer', 'ojs/ojfilepicker', 'ojs/ojpopup', 'ojs/ojdialog', 'ojs/ojswitcher', 'ojs/ojlabel', 'ojs/ojprogress',
    'ojs/ojformlayout', 'ojs/ojswitch', 'ojs/ojinputtext', 'ojs/ojmenu', 'ojs/ojswitcher', 'ojs/ojoption', 'ojs/ojprogress',
    'ojs/ojrouter'],
        function (ko, app, moduleUtils, accUtils, Context) {
            function HeaderViewModel(args) {
                var self = this;
                self.router = args.parentRouter;
                self.progressVisibility = ko.observable(false);
                self.loginButtonVisibility = ko.observable(true);
                self.feedbackVisibility = ko.observable(false);


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
                    console.log('aaaaaaaaaaaaaaaaaaaaa');
                    accUtils.announce('Login page loaded.', 'assertive');
//                    document.title = "Login";
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
            return HeaderViewModel;
        }
);
