'use strict';

angular.module('dateaMobileApp')
.controller('FilterCtrl', ['$scope', '$rootScope', '$http', '$filter', '$ionicScrollDelegate', 'config', 'User', 'Api', 'Find', 'leafletData', '$timeout', '$ionicPopup',
  function( $scope, $rootScope, $http, $filter, $ionicScrollDelegate, config, User, Api, Find, leafletData, $timeout, $ionicPopup ) {

    var setPlaceholder
      , placeholderOptions
      , openedState;

    $scope.query = Find.query;

    $scope.filter = {};
    $scope.filter.showFullSearch = false;
    $scope.filter.showAutocomplete = false;
    $scope.filter.itemsAutocomplete = [];

    //$scope.$on("leafletDirectiveMap.click", function(event, args) {
    //    if ( $scope.filter.hideHeader ) {
    //       $scope.filter.hideHeader = false;
    //    }
    //});

    placeholderOptions  = {
      'all': { ph: 'viendo todos los dateos', icon: ''},
      'own': { ph: 'viendo mis dateos', icon: 'ion-android-person'},
      'follow': {ph: 'viendo lo que sigo', icon: 'ion-pound'}
    };

    setPlaceholder = function (mode) {
      $scope.filter.placeholder = placeholderOptions[mode].ph;
      $scope.filter.iconCurrent = placeholderOptions[mode].icon;
    };

    var clearAutocomplete = function () {
      $scope.filter.showAutocomplete = false;
      $scope.filter.itemsAutocomplete = [];
    };

    if (User.data.tags_followed.length) {
      setPlaceholder('follow');
    }else{
      setPlaceholder('all');
    }

    $scope.filter.clearInput = function() {
        $scope.query.inputSearch =  '';
        clearAutocomplete();
        $timeout(function () {
          document.getElementById('inputSearch').focus();
        });
    };

    $scope.filter.setFilter = function(mode) {
      $scope.query.filter = mode;
      setPlaceholder(mode);
      if (mode ===  'follow' && User.data.tags_followed.length ===  0 ) {
          $ionicPopup.alert({
            title: 'Aún no sigues etiquetas <i class="fa fa-meh-o"></i>',
            //template: '<i class="icon ion-radio-waves"></i> Porfa, revisa tu conexión e intenta de nuevo.',
            okType: 'button-dark',
          });
      }else{
        $scope.filter.showFullSearch = false;
        $rootScope.$broadcast('query:updated');
      }
    };

    $scope.filter.showForm = function(val) {
      console.log("hey wtf");
      $scope.filter.showFullSearch = val;
      if (val) {
        $timeout(function(){document.getElementById('inputSearch').focus();}, 100);
        openedState = {filter: $scope.query.filter, search: $scope.query.inputSearch};
      }else{
        if ($scope.query.inputSearch !==  openedState.search || $scope.query.filter !==  openedState.filter) {
          $rootScope.$broadcast('query:updated');
        }
      }
    };

    $scope.filter.doSearch = function() {
      if (Find.query.inputSearch) {
        if (Find.query.inputSearch.charAt(0) === "#") {
          var isTagFollowed = false;
          var checkTag =  Find.query.inputSearch.substr(1);
          var insideTags = !!User.data.tags_followed.filter( function (tag) {
              if (tag.tag === checkTag) {
                return true;
              }
              for (var c in tag.campaigns) {
                for (var st in tag.campaigns[c].secondary_tags) {
                  if ( tag.campaigns[c].secondary_tags[st].indexOf(checkTag) !== -1) {
                    return true;
                  };
                }
              }
              return false;
          }).length;

          if (!insideTags) {
            $scope.filter.setFilter('all');
          }
        }else{
          $scope.filter.setFilter('all');
        }
      }

      $rootScope.$broadcast('query:updated');
      clearAutocomplete();
      $scope.filter.showFullSearch = false;
    };

    $scope.filter.autocompleteTag = function ( val, callBack ) {

      Api.tag.getAutocompleteByKeyword( { q: val } ).then( function ( response ) {

        var tags = [];

        angular.forEach( response.suggestions, function ( item ) {
          tags.push( item );
        });

        if ( callBack !== undefined ) {
          callBack(tags);
        }
      });
    };

    $scope.filter.printAutocomplete = function ( val ) {

      var query = val.replace('#', '');

      var printTags = function ( tags ) {

        if ( tags.length > 0 ) {
          $scope.filter.showAutocomplete = true;
          //$ionicScrollDelegate.$getByHandle('scrollComplete').scrollTo(0, 0);
        }

        $scope.filter.itemsAutocomplete = [];

        angular.forEach( tags, function ( item ) {
          $scope.filter.itemsAutocomplete.push( '#'+item );
        });

        //console.log('suggest', tags);
      };

      if ( query.length >= 2 ) {
        $scope.filter.autocompleteTag( query, printTags );
      } else {
        $scope.filter.showAutocomplete = false;
      }
    };

    $scope.filter.refreshInput = function ( val ) {
        $scope.query.inputSearch = val;
        clearAutocomplete();
    };

    /*
    $scope.$on('keyboard:show', function (e, args) {
        console.log('kb show');
    });*/

    $scope.filter.onSearchBlur = function () {
        clearAutocomplete();
    };

    $scope.$on('keyboard:hide', function () {
        clearAutocomplete();
    });

    $scope.$on('search:open', function () {
      $scope.filter.showForm(true);
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      console.log('hey search open');
    });

    $scope.$on('$stateChangeSuccess', function (fromState, toState) {
      if (toState.name === 'home') {
        setPlaceholder(Find.query.filter);
      }
    });
  }
]);
