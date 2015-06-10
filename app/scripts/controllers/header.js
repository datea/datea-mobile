'use strict';

angular.module('dateaMobileApp')
.controller('HeaderCtrl', ['$scope', 'User', '$rootScope', '$location', 'localStorageService', 'Nav', '$state', 'Notifications', '$interval', '$ionicPopover', '$timeout', '$ionicSideMenuDelegate',
function(
    $scope, User, $rootScope, $location, localStorageService, Nav, $state, Notifications, $interval, $ionicPopover, $timeout, $ionicSideMenuDelegate
) {

    $scope.header = Nav.header;
    $scope.state = Nav.state;
    $scope.header.noButtons = false;
    Nav.header.visible = User.isSignedIn();
    $scope.header.notify = Notifications;

    var nval;
    var checkBackBtn = function (state) {
        if (state.data && state.data.hideBackButton) {
            $scope.header.showBackBtn = false;
        }else{
           $scope.header.showBackBtn = ['home', 'home.intro', 'home.hello'].indexOf(state.name) === -1;
        }
        $scope.header.noButtons = false;
    };

    var destroyPopover = function () {
        if ($scope.popover && $scope.popover.remove) {
            $scope.popover.remove();
            $scope.popover = undefined;
        }
    };

    $scope.header.poundLink = function () {
        if (Nav.state.current.name !==  'home.hello') {
            Nav.state.go('home.hello');
        }else{
            Nav.reduceMap(false);
            Nav.state.go('home');
            //$rootScope.$broadcast('search:open');
        }
    };

    checkBackBtn($state.current);

    $scope.$on('user:signedIn', function(event, error) {
        $scope.header.visible = true;
        Notifications.loadUnread();
        nval = $interval(function () {
            Notifications.loadUnread();
        },1000*60*2);
    });

    $scope.$on('user:signedOut', function(event, error) {
        $interval.cancel(nval);
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        checkBackBtn(toState);
        $scope.header.stateData = toState.data || {};
        destroyPopover();
    });


    $scope.$on('$destroy', function () {
        destroyPopover();
    });

    $scope.header.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.header.toggleSideMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };

} ] );
