'use strict';

angular.module('dateaMobileApp')
.controller('LandingCtrl', ['$scope', '$ionicLoading', '$timeout', 'User', 'config', 'localStorageService', 'Nav',
function(
    $scope, $ionicLoading, $timeout, User, config, localStorageService, Nav
) {
	var ls = localStorageService;

  $scope.flow = {};

	if (User.isSignedIn()){
      if (User.data.status === 1) Nav.state.go('home.hello');
      else if (User.data.status === 0) Nav.state.go('accountInit');
  }

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // LOGIN LANDING
  $scope.flow.withFacebook = function() {

      OAuth.popup('facebook')
      .done(function (result) {
          $ionicLoading.show(config.loadingTpl);
          var partyGivens = {};
          partyGivens.access_token = result.access_token;
          partyGivens.party = 'facebook';

          User.signInBy3rdParty(partyGivens)
          .then(function(response) {
              //$timeout(function() {
                  /* Close Loading */
                  $ionicLoading.hide();
                  console.log(ls.get('is_new'));
                  /* the User is new  */
                  if (ls.get('is_new') === true) {
                      Nav.state.go('accountInit');
                  } else {
                      //console.log('go home!');
                      Nav.state.go('home');
                  }
              //}, 1000);

          }, function (reason) {
              console.log('$scope.flow.withFacebook', reason);
              $ionicLoading.hide();
          });

      })
      .fail(function (err) {
          console.log(err);
          $ionicLoading.hide();
      });
  };

  $scope.flow.withTwitter = function() {
      /*  Show Loading  */

      OAuth.popup('twitter')
      .done(function (result) {
          $ionicLoading.show(config.loadingTpl);
          var partyGivens = {};

          partyGivens.party = 'twitter';
          partyGivens.oauth_token = result.oauth_token;
          partyGivens.oauth_token_secret = result.oauth_token_secret;

          User.signInBy3rdParty(partyGivens)
          .then(function(response) {

              //$timeout(function() {
              $ionicLoading.hide();
              /* the User is new  */
              if (ls.get('is_new') === true) {
                  Nav.state.go('accountInit');
              } else {
                  Nav.state.go('home');
              }
              //});

          }, function(reason) {
              console.log('$scope.flow.withTwitter', reason);
              $ionicLoading.hide();
          });
      })
      .fail(function (err) {
          console.log(err);
          $ionicLoading.hide();
      });
  };

}]);
