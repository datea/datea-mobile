'use strict';

angular.module('dateaMobileApp')
    .controller('MainCtrl', ['$scope', '$rootScope', '$ionicLoading', 'User', 'config', 'Api', 'Find', 'leafletData', 'leafletEvents', 'Nav', '$state', 'Marker', '$interval', 'Notifications', '$ionicScrollDelegate', 'localStorageService', '$timeout', '$filter', '$ionicPlatform',
        function(
            $scope, $rootScope, $ionicLoading, User, config, Api, Find, leafletData, leafletEvents, Nav, $state, Marker, $interval, Notifications, $ionicScrollDelegate, localStorageService, $timeout, $filter, $ionicPlatform
        ) {
            var data,
                lastBounds,
                unreadNotificationInterval,
                ls = localStorageService,
                // fn declarations
                createBoundsFromCoords,
                dontCheckCenterOutOfBounds,
                geolocateAndBuildMap,
                isCenterOutOfBounds,
                resetMarkers,
                onSignIn, onSignUp, onSignOut,
                buildMap, buildMarkers ;

            $scope.nav = Nav;

            $scope.flow = {};
            $scope.flow.fromToTags = false;
            $scope.flow.visForceMap = false;
            $scope.flow.showDatearBtn = true;
            $scope.flow.homeLoaded = false;
            $scope.flow.dateosInRoll = [];
            $scope.flow.showRollNumResults = 20;

            $scope.query = Find.query;
            $scope.user = User.data;
            $scope.user = User.data;
            if (User.data.bg_image) {
              $scope.flow.userBg = {
                'background-image': 'url('+$filter('apiImg')(User.data.bg_image)+')',
                'background-position': 'center center',
                'background-size' : 'cover'
              };
            }

            $scope.homeSI = {};
            $scope.homeSI.leaflet = {};
            $scope.homeSI.selectedMarker = 'last';
            $scope.homeSI.mapTranslate = false;

            onSignOut = function() {
                $scope.flow.isSignedIn = false;
            };

            onSignUp = function() {
                onSignIn();
            };

            onSignIn = function() {
                Api.resetRsrc();

                var map         = angular.copy( config.defaultMap );
                map.center.zoom = config.homeSI.mapZoomOverride;
                angular.extend( $scope.homeSI.leaflet, map );

                /* Build Map */
                $scope.loadingShow();
                var searchArgs = {
                    mode: Nav.vis.current,
                    callback: function () {
                        $scope.homeSI.leaflet.markers = Find.query.markers;
                        $scope.loadingHide();
                        $rootScope.$broadcast('home:loaded');
                        $scope.flow.homeLoaded = true;
                    },
                    onError: function () {
                        $scope.loadingHide();
                        Nav.alert.checkConnection();
                    }
                };
                
                if (!!window.cordova) {
                    $ionicPlatform.ready(function () {
                        Find.query.geolocateAndStartSearch(searchArgs);
                    });
                }else{
                    Find.query.geolocateAndStartSearch(searchArgs);
                }

                // get unread notifications and setup interval for checking
                Notifications.loadUnread();
                if (unreadNotificationInterval) $interval.cancel(unreadNotificationInterval);
                unreadNotificationInterval = $interval(function () {
                    Notifications.loadUnread();
                }, 1000 * 60 * 5); // every 5 minutes
            };

            $scope.loadingShow = function() {
                $ionicLoading.show(config.loadingTpl);
            };

            $scope.loadingHide = function(){
                $ionicLoading.hide();
            };

            $scope.flow.loadingUpdateShow = function (val) {
                $scope.flow.showUpdateLoading = val;
            };

            $scope.flow.toggleMainView = function() {
                Find.query.result = [];
                Nav.vis.current = Nav.vis.current ===  'map' ? 'list' : 'map';
                $rootScope.$broadcast('query:updated');
            };

            $scope.flow.showMyDateos = function () {
              Nav.reduceMap(false);
              Find.query.inputSearch = '';
              Find.query.filter = 'own';
              $rootScope.$broadcast('query:updated');
              //Nav.pages.show = false;
              Nav.state.go('home');
            };

            $scope.flow.geolocate = function () {
                $scope.flow.geolocateLoading = true;
                navigator.geolocation.getCurrentPosition(function(pos) {
                    var center = {lat: pos.coords.latitude, lng: pos.coords.latitude};
                    leafletData.getMap('leafletHomeSI')
                    .then(function (map) {
                        var center = L.latLng(pos.coords.latitude, pos.coords.longitude);
                        map.setView(center, 16);
                    });
                    $scope.flow.geolocateLoading = false;
                }, function () {
                    $scope.flow.geolocateLoading = false;
                    $scope.flow.geolocateError = true;
                    $timeout(function () {
                      $scope.flow.geolocateError = false;
                    }, 3000);
                });
            };

            $scope.flow.fitBounds = function () {
                leafletData.getMap('leafletHomeSI')
                .then(function (map) {
                    var bounds = [];
                    for (var idx in $scope.homeSI.leaflet.markers) {
                      var marker = $scope.homeSI.leaflet.markers[idx];
                      bounds.push([marker.lat, marker.lng]);
                    }
                    map.fitBounds(bounds);
                });
            };

            $scope.flow.refreshMapResults = function () {
                var args = {
                    callbefore: function () { $scope.flow.loadingUpdateShow(true);},
                    callback  : function () {
                        $scope.homeSI.leaflet.markers = Find.query.markers;
                        $scope.flow.loadingUpdateShow(false);
                    },
                    onError : function () {
                        $scope.flow.loadingUpdateShow(false);
                        $scope.flow.geoSearchMsg = 'Error de conexión';
                    },
                    refresh: true
                };
                Find.query.updateGeoSearch(args);
            };

            $scope.flow.showMoreRollResults = function () {
                if ($scope.flow.showRollNumResults < 80) {
                    $scope.flow.showRollNumResults += 20;
                }
                $ionicScrollDelegate.$getByHandle('mainDateoRoll').resize();
            };

            $scope.flow.refreshDateoRoll = function () {
                $rootScope.$broadcast('query:updated', {silent: true});
            };

            $scope.flow.signOut = function () {
                Find.query.init();
                User.signOut();
                Nav.vis.current = 'map';
                Nav.state.go('landing');
            };

            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            // EVENT LISTENING

            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name ===  'home.dateo' || toState.name ===  'home.datear' || toState.name ===  'home.dateo.followTag') {
                    if (fromState.name ===  'home' && Nav.vis.current ===  'map') {
                        $scope.flow.visForceMap = false;
                    }else{
                        $scope.flow.visForceMap = true;
                        console.log('forcing map');
                    }
                }else{
                    $scope.flow.visForceMap = false;
                }

                if (['home', 'home.intro', 'home.hello', 'home.profile', 'home.dateo', 'home.dateo.followTag'].indexOf(toState.name) !== -1) {
                    $scope.flow.showDatearBtn = true;
                }else{
                    $scope.flow.showDatearBtn = false;
                }
            });

            $scope.$on('datearBtn:hide', function () {
                $scope.flow.showDatearBtn = false;
            });

            $scope.$on('datearBtn:show', function () {
                $scope.flow.showDatearBtn = true;
            });

            $scope.$on('user:signedIn', function() {
                onSignIn();
            });

            $rootScope.$on('user:signedOut', function() {
                onSignOut();
            });

            $rootScope.$on('user:signedUp', function() {
                onSignUp();
            });

            $rootScope.$on('query:updated', function(ev, args) {
                Nav.reduceMap(false);
                var showLoading = (args && args.silent) ? false : true;
                $scope.homeSI.noResults = false;
                showLoading && $scope.loadingShow();
                !showLoading && $scope.flow.loadingUpdateShow(true);
                $scope.homeSI.leaflet.markers = {};
                $scope.flow.showRollNumResults = 20;
                var searchArgs = {
                    mode: Nav.vis.current,
                    callback: function () {
                        //console.log('query updated: finish search');
                        showLoading && $scope.loadingHide();
                        !showLoading && $scope.flow.loadingUpdateShow(false);
                        if (Nav.vis.current ===  'map') {
                            $scope.homeSI.leaflet.markers = Find.query.markers;
                            $scope.flow.dateosInRoll = [];
                        }else{
                            $scope.flow.dateosInRoll = Find.query.result;
                            $scope.$broadcast('scroll.refreshComplete');
                            $ionicScrollDelegate.$getByHandle('mainDateoRoll').resize();
                        }
                        $scope.homeSI.noResults = !Find.query.result.length;
                    },
                    onError: function () {
                        $scope.loadingHide();
                        Nav.alert.checkConnection();
                    }
                };
                if (Nav.vis.current === 'map') {
                  Find.query.geolocateAndStartSearch(searchArgs);
                } else {
                  Find.query.startSearch(searchArgs);
                }
            });

            $scope.$on('map:hideDateos', function () {
                $scope.homeSI.leaflet.markers = {};
            });

            $scope.$on('map:showDateos', function () {
                $scope.homeSI.leaflet.markers = Find.query.markers;
            });

            // open dateo on leaflet marker click
            $scope.$on( 'leafletDirectiveMarker.click', function ( e, args ) {
                if ( $state.current.name === 'home' ) {
                    $state.go('home.dateo', {dateoId: args.leafletEvent.target.options._id});
                }
            });

            // update search when map bounds changes
            $scope.$on('leafletDirectiveMap.moveend', function ( e, args) {
                if (Nav.state.current.name ===  'home') {
                    var args = {
                        callbefore: function () { $scope.flow.loadingUpdateShow(true);},
                        callback  : function () {
                            $scope.homeSI.leaflet.markers = Find.query.markers;
                            $scope.flow.loadingUpdateShow(false);
                        },
                        onError : function () {
                            $scope.flow.loadingUpdateShow(false);
                            $scope.flow.geoSearchMsg = 'Error de conexión';
                        }
                    };
                    Find.query.updateGeoSearch(args);
                    leafletData.getMap('leafletHomeSI').then(function (map) {
                        $scope.flow.mapUpdateActive = map.getZoom() >= config.query.minQueryZoom;
                        $scope.flow.geoSearchMsg = ''; //$scope.flow.mapUpdateActive ? '' : config.query.noSearchMsg;
                    });
                }
            });

            //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            // EXEC ON ENTER STATE
            $scope.flow.isSignedIn = User.isSignedIn();
            if ( $scope.flow.isSignedIn) {
                onSignIn();
                console.log('on sign in');
            }

            //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            // Keyboard events
            var kbShowEvent = function (ev) {
                $rootScope.$broadcast('keyboard:show', {keyboardHeight: ev.keyboardHeight});
            };
            var kbHideEvent = function (ev) {
                $rootScope.$broadcast('keyboard:hide');
            };

            try {
                window.removeEventListener('native.keyboardshow', kbShowEvent);
                window.removeEventListener('native.keyboardhide', kbHideEvent);
            } catch(err) {}

            window.addEventListener('native.keyboardshow', kbShowEvent);
            window.addEventListener('native.keyboardhide', kbHideEvent);
        }
    ]);
