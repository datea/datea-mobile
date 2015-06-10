'use strict';

angular.module('dateaMobileApp')
.controller('SignUpCtrl', ['$scope', 'User', '$http', 'localStorageService', '$window', 'Api', '$state',
    function(
        $scope, User, $http, localStorageService, $window, Api, $state
    ) {

        var ls = localStorageService;

        $scope.flow = {};

        $scope.flow.signIn = function() {
            $state.go('home');
        };

        $scope.flow.withEmail = function() {
            $state.go('SignUpForm');
        };

    }
]);
