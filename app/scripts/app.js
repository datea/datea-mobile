'use strict';
/* Ionic dateaMobileApp App */

angular.module('dateaMobileApp', ['ionic', 'ngResource', 'ngSanitize', 'ui.router', 'LocalStorageModule', 'leaflet-directive', 'checklist-model'])


.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$ionicConfigProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.patch = {
            'Content-Type': 'application/json;charset=utf-8'
        };

        ionic.Platform.ready(function() {
            // FacebookProvider.init( fbAppId );
            OAuth.initialize('du8nXdQmkjgR3nrfsjHxO07INhk');
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        });

        if(ionic.Platform.isAndroid()) $ionicConfigProvider.scrolling.jsScrolling(false);

        $stateProvider

        .state('landing', {
            url: '/landing',
            templateUrl: 'templates/landing.html',
            controller: 'LandingCtrl'
        })

        .state('home', {
            url: '/home',
            templateUrl: 'templates/main.html',
            controller: 'MainCtrl',
            cache: false,
            onEnter: ['User', 'localStorageService', 'Nav', '$timeout', function (User, ls, Nav, $timeout) {

              if (User.data.status ===  0) Nav.state.go('accountInit');
              if (User.data.status ===  2) Nav.state.go('landing');

              if (Nav.state.current.name === 'landing') {
                  $timeout(function () {
                    var usersEntered = ls.get('usersEntered');
                    if (!usersEntered) {
                        ls.set('usersEntered', [User.data.id]);
                        Nav.state.go('home.intro');
                    } else if (usersEntered.indexOf(User.data.id) === -1) {
                        Nav.state.go('home.intro');
                        usersEntered.push(User.data.id);
                        ls.set('usersEntered', usersEntered);
                    } else {
                        Nav.state.go('home.hello');
                    }
                  });
                return false;
              }
            } ]
        })

        .state('signIn', {
            url: '/signin',
            templateUrl: 'templates/signIn.html',
            controller: 'SignInCtrl'
        })

        .state('signUp', {
            url: '/signup',
            templateUrl: 'templates/landing.html',
            controller: 'SignUpCtrl'
        })

        .state('home.notifications', {
            url: '/notifications',
            data: {
                title: 'Notificaciones',
                hasMenuRight: true
            },
            views : {
                pages : {
                    templateUrl: 'templates/notifications.html',
                    controller: 'NotificationsCtrl'
                }
            }
        })

        .state('home.account', {
            url: '/account',
            data: {
                title : 'Mi cuenta',
                hasMenuRight: false,
                hasActionButton: true,
            },
            views : {
                pages : {
                    templateUrl: 'templates/account.html',
                    controller: 'AccountCtrl'
                }
            }
        })

        .state('accountInit', {
            url: '/account-init',
            templateUrl: 'templates/account-init.html',
            controller: 'AccountCtrl',
            data: {
                title : 'Mi cuenta'
            }
        })

        .state('home.intro', {
            url: '/intro',
            data: {
                hideBackButton : true
            },
            views : {
                intro : {
                    templateUrl: 'templates/intro.html',
                    controller: 'IntroCtrl',
                }
            }
        })

        .state('signUpForm', {
            url: '/signup-form',
            templateUrl: 'templates/signUpForm.html',
            controller: 'SignUpFormCtrl'
        })

        .state('activateRegister', {
            url: '/activate-register',
            templateUrl: 'templates/activate.html'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'templates/main.html'
            //controller: 'SignUpCtrl'
        })

        .state('forgetPass', {
            url: '/forget-pass',
            templateUrl: 'templates/forgetPass.html',
            controller: 'SignInCtrl'
        })

        .state('confirmPass', {
            url: '/confirm-pass',
            templateUrl: 'templates/confirmPass.html'
        })

        .state('home.campaigns', {
            url: '/campaigns',
            data : {title: 'Iniciativas'},
            views : {
                pages : {
                    templateUrl : 'templates/campaigns.html',
                    controller  : 'CampaignsCtrl',
                    reloadOnSearch: false
                }
            }
        })

        .state('home.campaigns.detail', {
            url: '/:campaignId',
            data : {title: 'Iniciativas'},
            views : {
                campaignDetail : {
                    templateUrl : 'templates/campaign-detail.html',
                    controller  : 'CampaignDetailCtrl'
                }
            }
        })

        .state('home.campaignDetail', {
            url: '/campaign-solo/:campaignId',
            data : {title: 'Iniciativas'},
            views : {
                pages : {
                    templateUrl : 'templates/campaign-detail.html',
                    controller  : 'CampaignDetailCtrl'
                }
            }
        })

        .state('home.datear', {
            url : '/datear',
            data: {title: 'DATEAR', backBtnLabel: 'cancelar'},
            views : {
                'dateo': {
                    templateUrl: 'templates/datear-form.html',
                    controller : 'DatearCtrl'
                }
            },
        })

        .state('home.dateo', {
            url : '/dateo/:dateoId',
            views : {
                'dateo' : {
                    templateUrl : 'templates/dateo.html',
                    controller  : 'DateoCtrl'
                }
            }
        } )

        .state('home.dateoEdit', {
            url : 'dateo/:dateoId/edit',
            data: {title: 'EDITAR', backBtnLabel: 'cancelar'},
            views : {
                'dateo' : {
                    templateUrl : 'templates/datear-form.html',
                    controller  : 'DatearCtrl'
                }
            }
        } )

        .state('home.dateo.followTag', {
            url : '/followTag',
            views : {
                'tagFollowPopup' : {
                    templateUrl : 'templates/tag-follow-popup.html',
                    controller  : 'FollowPopupCtrl'
                }
            }
        } )

        .state('home.invite', {
          url : '/invite',
          data: {title: 'INVITAR'},
          views : {
            pages : {
              templateUrl : 'templates/invite.html',
              controller  : 'InviteCtrl'
            }
          }
        } )

        .state('home.hello', {
            url : '/hello',
            cache: false,
            views : {
                'dateo' : {
                    templateUrl : 'templates/tags.html',
                    controller  : 'TagsCtrl'
                }
            }
        } );

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/landing');
    }
]);
