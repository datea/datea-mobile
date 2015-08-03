'use strict';

angular.module('dateaMobileApp')
    .controller('SignUpFormCtrl', ['$scope', '$http', '$ionicLoading', 'localStorageService', 'Api', 'config', '$state',
        function(
            $scope, $http, $ionicLoading, localStorageService, Api, config, $state
        ) {

            var ls = localStorageService;

            $scope.datea = {};
            $scope.signup = {};
            $scope.datea.name = 'Datea.pe';

            $scope.loadingShow = function() {

                $ionicLoading.show(config.loadingTpl);
            };

            $scope.loadingHide = function() {
                $ionicLoading.hide();
            };

            $scope.signup.confirmPassKey = function ($event) {
              $scope.signup.passConfirm = $scope.signup.samePassword == $scope.signup.password;
              console.log($scope.signup.passConfirm, $scope.signup.samePassword, $scope.signup.password);
              $scope.signup.passConfirmMsg = $scope.signup.passConfirm ? 'Las contraseñas coinciden.' : 'Las contraseñas aún no coinciden.';
            };

            $scope.signup.save = function() {
              var data, isValid;

              /*  Show Loading  */
              $scope.loadingShow();

              //isValid = $scope.signup_form.$valid;
              isValid = true;

              data = {
                  username: $scope.signup.bio,
                  email:    $scope.signup.email,
                  password: $scope.signup.password,
                  success_redirect_url: config.app.url + 'updateUser',
                  error_redirect_url:   config.app.url
              };

              if (isValid) {
                  Api.account.register.createUser(data)
                      .then(function(response) {
                          console.log(response);

                          /* Close Loading */
                          $scope.loadingHide();

                          if (response.status === 201) {
                              ls.set('user', response.user);
                              $state.go('activateRegister');
                          }
                      }, function(reason) {
                          /* Close Loading */
                          $scope.loadingHide();
                          console.log(reason);
                      });
              } else {
                  $scope.signup.message = 'please check your inputs';
              }
            };

            $scope.$on('keyboard:show', function (e, args) {
                $scope.signup.containerStyle = {bottom: args.keyboardHeight+'px'};
            });
            $scope.$on('keyboard:hide', function (e) {
                $scope.signup.containerStyle = null;
            });
        }
    ]);
