'use strict';

angular.module('dateaMobileApp')
.service('User', ['$rootScope', '$q', '$timeout', 'Api', 'Errors', 'localStorageService', '$ionicPopup', '$state',
  function User($rootScope, $q, $timeout, Api, Errors, localStorageService, $ionicPopup, $state) {

    var user = {},
        ls   = localStorageService,
        data = {},
        header,
        buildAuthorizationHeader,
        getUserData;

    user.isSignedIn = function() {
      return !!ls.get('token');
    };

    user.isNew = function() {
      return ls.get('is_new');
    };

    user.data = {};

    user.updateUserDataFromStorage = function() {
      //console.log('user.updateUserDataFromStorage()', user.isSignedIn(), !Object.keys(user.data).length);
      // if ( user.isSignedIn() && !Object.keys( user.data ).length ) {
      if (user.isSignedIn()) {
          //user.data = ls.get('user');
          angular.extend(user.data, ls.get('user'));
      }
      //Api.user.getToken();
      Api.user.getToken({
          fromTwitter: true
      });
      $rootScope.$broadcast('user:updated');
    };

    user.updateTokenOnTwitterSignup = function() {
      Api.user.getToken({
          fromTwitter: true
      });
    };

    buildAuthorizationHeader = function(givens) {
      var token;
      header = givens && {
          'Authorization': 'Apikey ' + givens.username + ':' + givens.token
      };
      return header;
    };

    getUserData = function(givens) {
      var username = givens && givens.username,
          id = givens && givens.id,
          dfd = $q.defer();
      console.log('getUserData givens', givens);
      Api.user.getToken();
      if (user.isSignedIn() && username) {
          Api.user.getUserByUserIdOrUsername({
              username: username
          })
          .then(function(response) {
              dfd.resolve(response);
          });
      } else if (user.isSignedIn() && id) {
          Api.user.getUserByUserIdOrUsername({
              id: id
          })
          .then(function(response) {
              dfd.resolve(response);
          });
      } else if (!user.isSignedIn() && username) {
          Api.user.getUserByUserIdOrUsername({
              username: username
          })
          .then(function(response) {
              dfd.resolve(response);
          });
      } else {
          dfd.reject('not username or id');
      }

      return dfd.promise;
    };

    user.getData = getUserData;

    user.updateUserDataFromApi = function(callback) {
      var ls = localStorageService,
          updatedData,
          currentData = ls.get('user');
      getUserData({
        username: currentData.username
      })
      .then(function(response) {
        updatedData = response;
        console.log('!! updateUserDataFromApi !!', response);
        angular.extend(currentData, updatedData);
        ls.set('user', currentData);
        user.updateUserDataFromStorage();
        if (user.data.status === 0) {
            $state.go('accountInit');
            var alertPopup = $ionicPopup.alert({
              title: 'Uy, algo falta!',
              template: 'Necesitas ingresar y validar una dirección de correo.',
              okText: 'OK',
              okType: 'button-assertive'
            });
        }

        callback && callback();

      }, function(reason) {
        console.log(reason);
      });
    };

    user.updateUser = function(givens) {
      var dfd = $q.defer();
      Api.user.updateUserByUserId(givens)
      .then(function(response) {
        var updatedData = response,
            currentData = ls.get('user');
        angular.extend(currentData, updatedData);
        ls.set('user', currentData);
        user.updateUserDataFromStorage();
        dfd.resolve(response);
      }, function(error) {
        console.log('error', error);
        Errors.show(error);
        dfd.reject(error);
      });

      return dfd.promise;
    };

    user.signInBy3rdParty = function(givens) {
        var dfd = $q.defer();
        Api.account.social.signInBy3rdParty(givens)
            .then(function(response) {
                var headerGivens = {};
                headerGivens.username = response.user.username;
                headerGivens.token = response.token;
                console.log(response);

                header = buildAuthorizationHeader(headerGivens);

                ls.set('token', header);
                ls.set('is_new', response.is_new);

                user.isSignedIn();
                user.isNew();
                console.log('user.signInBy3rdParty', 'response.user', response.user);
                data = response.user;
                user.data = data;

                ls.set('user', data);
                //$rootScope.$broadcast('user:signedIn');
                dfd.resolve(user.data);
            }, function(error) {
                Errors.show(error);
                dfd.reject(error);
            });
        return dfd.promise;
    };

    user.signIn = function(givens) {
        var username = givens.username,
            dfd = $q.defer();

        Api.account.signIn.signIn(givens)
            .then(function(response) {
                var headerGivens = {};
                headerGivens.username = username;
                headerGivens.token = response.token;

                header = buildAuthorizationHeader(headerGivens);
                ls.set('token', header);
                user.isSignedIn();

                data = response.user;
                user.data = data;
                ls.set('user', data);
                $rootScope.$broadcast('user:signedIn');
                dfd.resolve(user.data);

            }, function(error) {
                Errors.show(error);
                dfd.reject(error);
            });

        return dfd.promise;
    };

    user.signOut = function() {
        user.data = {};
        ls.remove('token');
        ls.remove('user');
        user.isSignedIn();
        $rootScope.$broadcast('user:signedOut');
    };

    user.resetPassword = function(givens) {
        var dfd = $q.defer();
        Api.account.resetPassword(givens)
            .then(function(response) {
                dfd.resolve(response);
            }, function(error) {
                console.log(error);
                Errors.show(error);
                dfd.reject(error);
            });
        return dfd.promise;
    };

    user.getAuthorizationHeader = function() {
        return header || ls.get('token');
    };

    user.updateUserDataFromStorage();

    return user;
  }
]);
