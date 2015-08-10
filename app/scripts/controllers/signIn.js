'use strict';

angular.module('dateaMobileApp')
    .controller('SignInCtrl', ['$scope', '$http', '$ionicLoading', 'Api', 'localStorageService', 'User', 'config', '$state',
        function($scope, $http, $ionicLoading, Api, localStorageService, User, config, $state) {

            var ls = localStorageService;

            $scope.auth = {};
            $scope.flow = {};
            $scope.reset = {};

            User.isSignedIn() && $state.go('home.hello');

            $scope.loadingShow = function() {

                $ionicLoading.show(config.loadingTpl);
            };

            $scope.loadingHide = function() {

                $ionicLoading.hide();
            };


            $scope.auth.signIn = function() {

                var isValid,
                    data;

                /*  Show Loading  */
                $scope.loadingShow();

                isValid = true;
                //isValid = $scope.form.$valid;

                data = {
                    username: $scope.auth.username,
                    password: $scope.auth.password
                };

                if (isValid) {
                    User.signIn(data)
                        .then(function(response) {
                            /* Close Loading */
                            $scope.loadingHide();

                            User.updateUserDataFromStorage();
                            $state.go('home.hello');

                        }, function(error) {

                            /* Close Loading */
                            $scope.loadingHide();
                        });
                }
            };

            $scope.auth.resetPassword = function() {
                var resetGivens = {};
                resetGivens.email = $scope.reset.email;

                /*  Show Loading  */
                $scope.loadingShow();

                User.resetPassword(resetGivens)
                    .then(function(response) {
                            /* Close Loading */
                            $scope.loadingHide();
                            $state.go('confirmPass');

                        }, function(error) {

                            /* Close Loading */
                            $scope.loadingHide();
                        });
            };

            $scope.$on('keyboard:show', function (e, args) {
                $scope.flow.containerStyle = {bottom: args.keyboardHeight+'px'};
            });
            $scope.$on('keyboard:hide', function (e) {
                $scope.flow.containerStyle = null;
            });
        }
    ]);
