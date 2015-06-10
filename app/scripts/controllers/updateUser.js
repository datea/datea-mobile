'use strict';

angular.module('dateaMobileApp')
    .controller('UpdateuserCtrl', ['$scope', 'User', '$location', 'localStorageService', '$rootScope',
        function(
            $scope, User, $location, localStorageService, $rootScope
        ) {
            var ls = localStorageService,
                updatedData, currentData = ls.get('user');

            User.getData({
                username: currentData.username,
                fullname: currentData.fullname
            })
            .then(function(response) {
                updatedData = response;
                angular.extend(currentData, updatedData);
                ls.set('user', currentData);
                $rootScope.$broadcast('user:signedUp');
                User.updateUserDataFromStorage();
                $location.path('/signin');
            }, function(reason) {
                console.log(reason);
            });
        }
    ]);
