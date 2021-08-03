/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojmodule-element-utils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojarraydataprovider', 'ojs/ojoffcanvas', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojmodule-element', 'ojs/ojbutton'],
        function (ko, moduleUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ArrayDataProvider, OffcanvasUtils, KnockoutTemplateUtils) {
            function ControllerViewModel() {
                var self = this;
                self.url = window.location.href;
                self.arr = self.url.split("/");
                self.result = self.arr[0] + "//" + self.arr[2];
//                self.serviceURL = "http://197.221.159.202:9999/fueless-server";
//                self.serviceURL = "http://10.42.0.1:9999/fueless-server";
//                self.serviceURL = "http://localhost:9999/fueless-server";
                self.serviceURL = "http://154.66.218.218:8282/fueless-server";
                self.KnockoutTemplateUtils = KnockoutTemplateUtils;
                self.selectedVehicle = ko.observable({id: 0});
                self.selectedStation = ko.observable({id: 0, name: ''});
                self.selectedRole = ko.observable({id: 0, name: ''});
                self.user = ko.observable({id: 1,name:'Your Location', station: {id: 1},password:''});
                self.fuelPrices = ko.observable(0);
                self.network = ko.observable({status: 0, refresh: false});
                self.customerVehicle = ko.observable({code: ''});
                self.dbExists = ko.observable(false);
                // Handle announcements sent when pages change, for Accessibility.
                self.manner = ko.observable('polite');
                self.message = ko.observable();
                self.menuVisibility = ko.observable(true);
                self.roleLevel = ko.observable(0);
                self.waitForAnnouncement = false;
                self.navDrawerOn = false;
                self.navData = ko.observableArray([{path: '', redirect: 'login'},
                    {path: 'user', detail: {label: 'Membership'}},
                    {path: 'station', detail: {label: 'Station'}},
                    {path: 'fuel', detail: {label: 'Station Prices'}},
                   {path: 'vehicle', detail: {label: 'Vehicles'}},
                    {path: 'salehistory', detail: {label: 'Sale History'}},
                   {path: 'login', detail: {label: 'Sign Out'}},
                    {path: 'about', detail: {label: 'About'}}]);
                document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

                /*
                 @waitForAnnouncement - set to true when the announcement is happening.
                 If the nav-drawer is ON, it is reset to false in 'ojclose' event handler of nav-drawer.
                 If the nav-drawer is OFF, then the flag is reset here itself in the timeout callback.
                 */
                function announcementHandler(event) {
                    self.waitForAnnouncement = true;
                    setTimeout(function () {
                        self.message(event.detail.message);
                        self.manner(event.detail.manner);
                        if (!self.navDrawerOn) {
                            self.waitForAnnouncement = false;
                        }
                    }, 200);
                }
                ;


                      this.navDataProvider = new ArrayDataProvider(self.navData().slice(1), {keyAttributes: "path"});
                var subscriptionnetwork = self.roleLevel.subscribe(
                        function () {
                            switch (self.roleLevel()) {
                                case 1:
                                    self.navData().push({path: 'dashboard', detail: {label: 'Dashboard', iconClass: 'oj-ux-ico-bar-chart'}},
                                            {path: 'user', detail: {label: 'User Management', iconClass: 'oj-ux-ico-contact-group'}},
                                            {path: 'customervehicle', detail: {label: 'Customer Vehicles', iconClass: 'oj-ux-ico-contact-group'}});
                                    break;
                                case 2:

                                    break;
                                case 3:

                                    break;

                                default:

                                    break;
                            }
                        }
                );




                // Router setup
                var router = new CoreRouter(self.navData(), {
                    urlAdapter: new UrlParamAdapter()
                });
                router.sync();

                this.moduleAdapter = new ModuleRouterAdapter(router);
                this.selection = new KnockoutRouterAdapter(router);

                // Setup the navDataProvider with the routes, excluding the first redirected
                // route.
//                this.navDataProvider = new ArrayDataProvider(self.navData().slice(1), {keyAttributes: "path"});


                // Drawer setup
                self.toggleButtonVisibility = function () {
                    return false;
                };



                // Drawer setup
                self.toggleDrawer = function () {
                    if (self.menuVisibility()) {
                        self.navDrawerOn = true;
                        return OffcanvasUtils.toggle({selector: '#navDrawer', modality: 'modal', content: '#pageContent'});
                    }
                };
                // Add a close listener so we can move focus back to the toggle button when the drawer closes
                document.getElementById('navDrawer').addEventListener("ojclose", onNavDrawerClose);

                /*
                 - If there is no aria-live announcement, bring focus to the nav-drawer button immediately.
                 - If there is any aria-live announcement in progress, add timeout to bring focus to the nav-drawer button.
                 - When the nav-drawer is ON and annoucement happens, then after nav-drawer closes reset 'waitForAnnouncement' property to false.
                 */
                function onNavDrawerClose(event) {
                    self.navDrawerOn = false;
                    if (!self.waitForAnnouncement) {
                        document.getElementById('drawerToggleButton').focus();
                        return;
                    }

                    setTimeout(function () {
                        document.getElementById('drawerToggleButton').focus();
                        self.waitForAnnouncement = false;
                    }, 2500);
                }

                // Used by modules to get the current page title and adjust padding
                self.getHeaderModel = function () {
                    // Return an object containing the current page title
                    // and callback handlers
                    return {
                        pageTitle: self.selection.state().detail.label,
                        transitionCompleted: self.adjustContentPadding,
                        toggleDrawer: self.toggleDrawer
                    };
                };

                // Method for adjusting the content area top/bottom paddings to avoid overlap with any fixed regions.
                // This method should be called whenever your fixed region height may change.  The application
                // can also adjust content paddings with css classes if the fixed region height is not changing between
                // views.
                self.adjustContentPadding = function () {
                    var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
                    var contentElem = document.getElementsByClassName('oj-applayout-content')[0];
                    var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];

                    if (topElem) {
                        contentElem.style.paddingTop = topElem.offsetHeight + 'px';
                    }
                    if (bottomElem) {
                        contentElem.style.paddingBottom = bottomElem.offsetHeight + 'px';
                    }
                    // Add oj-complete marker class to signal that the content area can be unhidden.
                    // See the override.css file to see when the content area is hidden.
                    contentElem.classList.add('oj-complete');
                };



            }

            return new ControllerViewModel();
        }
);
