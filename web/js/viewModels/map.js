/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout', 'appController', 'ojs/ojmodule-element-utils', 'accUtils', 'ojs/ojcontext'],
        function (ko, app, moduleUtils, accUtils, Context) {

            function MapViewModel() {
                var self = this;
                const GOOGLE = {"lat": 37.422476, "lng": -122.08425};
                // Wait until header show up to resolve
                var resolve = Context.getPageContext().getBusyContext().addBusyState({description: "wait for header"});
                // Header Config
                self.headerConfig = ko.observable({'view': [], 'viewModel': null});
                moduleUtils.createView({'viewPath': 'views/header.html'}).then(function (view) {
                    self.headerConfig({'view': view, 'viewModel': app.getHeaderModel()});
                    resolve();
                });
                self.latitude = ko.observable();
                self.longtude = ko.observable();

//                var div = document.getElementById("googleMaps");
//                var map = plugin.google.maps.Map.getMap(div);
//
//                var initializeMap = function ()
//                {
//                    var div = document.getElementById("googleMaps");
//                    var map = plugin.google.maps.Map.getMap(div);
//                    // map = new plugin.google.maps.Map(document.getElementById('map_canvas'), {
//                    //   zoom: 13,
//
//                    // });
//                };
//
//                var displayAndWatch = function (position) {
//                    // set current position
//                    setCurrentPosition(position);
//                    // watch position
//                    watchCurrentPosition();
//                };
//
//                var errorCallback_highAccuracy = function (position) {
//
//                };
//
//                var setMarkerPosition = function (marker, position) {
//                    marker.setPosition(
//                            new plugin.google.maps.LatLng(
//                                    position.coords.latitude,
//                                    position.coords.longitude)
//
//                            );
//                };
//
//
//                var setCurrentPosition = function (pos) {
//                    map.addMarker({
//                        'position': new plugin.google.maps.LatLng(
//                                pos.coords.latitude,
//                                pos.coords.longitude
//                                )
//
//                    }, function (marker) {
//                        currentPositionMarker = marker;
//                        watchCurrentPosition();
//                    });
//                    map.setCenter(new plugin.google.maps.LatLng(
//                            pos.coords.latitude,
//                            pos.coords.longitude
//                            ));
//
//
//                };
//
//                var error = function () {
//                };
//
//                var watchCurrentPosition = function () {
//                    var positionTimer = navigator.geolocation.watchPosition(
//                            function (position) {
//                                setMarkerPosition(currentPositionMarker, position);
//                            }, error, {maximumAge: 600000, timeout: 5000, enableHighAccuracy: true});
//                };
//
//
//                var initLocationProcedure = function () {
//                    initializeMap();
//                    if (navigator.geolocation) {
//                        navigator.geolocation.getCurrentPosition(
//                                displayAndWatch,
//                                errorCallback_highAccuracy,
//                                {maximumAge: 600000, timeout: 5000, enableHighAccuracy: true});
//                    } else {
//                        alert("Your Phone does not support Geolocation");
//                    }
//                };


                self.getMylocation = function () {

                };


                self.getMylocation = function () {
                    var div = document.getElementById("googleMaps");
                    var map = plugin.google.maps.Map.getMap(div);
                    map.one(plugin.google.maps.event.MAP_READY, function () {
                        var onSuccess = function (location) {
                            var msg = ["Current your location:\n",
                                "latitude:" + location.latLng.lat,
                                "longitude:" + location.latLng.lng,
                                "speed:" + location.speed,
                                "time:" + location.time,
                                "bearing:" + location.bearing].join("\n");

                            map.addMarker({
                                'position': location.latLng,
                                'title': msg,
                                'icon': {'url': 'css/images/avatar.png'}
                            }, function (marker) {
                                marker.showInfoWindow();
                                map.animateCamera({
                                    target: location.latLng,
                                    zoom: 15
                                }, function () {
                                    marker.showInfoWindow();
                                });
                            });
                        };
                        var onError = function (msg) {
                            alert(JSON.stringify(msg));
                        };
                        var button = div.getElementsByTagName('button')[0];
                        button.addEventListener('click', function () {
                            map.clear();
                            var options = {
                                enableHighAccuracy: false  // Set true if you want to use GPS. Otherwise, use network.
                            };
                            map.getMyLocation(options, onSuccess, onError);
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
                    accUtils.announce('Map page loaded.', 'assertive');
                    document.title = "Map";
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
                    self.getMylocation();
                    // Implement if needed
                };
            }

            /*
             * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
             * return a constructor for the ViewModel so that the ViewModel is constructed
             * each time the view is displayed.
             */
            return MapViewModel;
        }
);
