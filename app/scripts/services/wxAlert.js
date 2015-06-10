'use strict';

angular.module('dateaMobileApp')
    .service('wxAlert', ['$scope', function wxAlert($scope) {

            var wxalert = {},
                alerts = [],
                lescope;

            wxalert.init = function(alerts, scope) {
                lescope = scope;
                alerts = alerts;
            };

            wxalert.closeAlert = function(index) {
                alerts.splice(index, 1);
                console.log(alerts);
            };

            wxalert.addAlert = function(givens) {
                return $scope.alerts.push(givens) - 1;
            };

            return wxalert;
        }
    ]);
