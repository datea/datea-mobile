'use strict';

angular.module('dateaMobileApp')
.controller('TagsCtrl', ['$scope', '$rootScope', '$location', '$http', '$ionicLoading', 'config', 'User', 'Api', 'Find', 'Follow', 'Nav', '$timeout', 'Campaign',
  function( $scope, $rootScope, $location, $http, $ionicLoading, config, User, Api, Find, Follow, Nav, $timeout, Campaign) {

  	  $scope.tags = {};
      $scope.tags.trending = [];
      $scope.tags.followed  = User.data.tags_followed.map(function (t) {
          t.isFollowing = true;
          return t;
      });
      $scope.tags.noFollowed = false;
      $scope.user = User.data;

      $scope.flow = {};
      $scope.flow.buttonsShown = null;
      $scope.flow.vis = Nav.vis;
      //$scope.hideBtn = false;

      // start animation (ng-show) in parent controller when entering
      $timeout( function () {
        Nav.reduceMap(true);
        $scope.tags.showView = true;
      });

      Nav.header.setBackFunc(function () {
          $scope.tags.hideView = true;
          Nav.reduceMap(false);
          $timeout(function () {
              Nav.state.go('^');
          }, 320);
      });

      $scope.flow.showMap = function() {
        Nav.header.goBack();
      };

      var buildTrendingTags = function () {
          $scope.tags.trending = [];
          Api.tag
          .getTrendingTags( { limit: 7, days: 15 } )
          .then( function ( response ) {
              $scope.tags.trending = response.objects.map(function (t) {
                  t.isFollowing = Follow.isFollowingTag(t);
                  return t;
              });
              Campaign.trendingTags = response.objects;
              Campaign.loadCampaigns();
          } );
      };

      $scope.loadingHide = function(){
          $ionicLoading.hide();
      };

      $scope.flow.searchByTag = function (tagObj) {
      	Find.query.inputSearch = '#'+tagObj.tag;
        if (Find.query.filter !==  'all'
          && User.data.tags_followed.filter(function (t){ return t.id ===  tagObj.id; }).length ===  0) {
          Find.query.filter = 'all';
        }
        $rootScope.$broadcast('query:updated');
        Nav.pages.show = false;
      	$timeout(function () { Nav.state.go('home');}, 180);
      };


      $scope.flow.doFollow = function (objTag) {
        Follow.followTag(objTag, {callback: function () {
          objTag.isFollowing = true;
          if (!$scope.tags.followed.filter(function(t){ return t.id ===  objTag.id; }).length) {
            $scope.tags.followed.push(objTag);
          }
        }});
      };


      $scope.flow.unFollow = function (objTag) {
        Follow.unfollowTag(objTag, {callback: function () {
          objTag.isFollowing = false;
          User.data.tags_followed = User.data.tags_followed.filter(function(t){ return t.id !==  objTag.id;});
        }});
      };


      $scope.flow.toggleButtons = function (tagId, prefix) {
        if ($scope.flow.buttonsShown ===  tagId) {
          $scope.flow.buttonsShown = null;
          $timeout(function () {
            $scope.flow.isGray = null;
          }, 150);
        }else{
          $scope.flow.campaigns = Campaign.result.filter(function (c) { return parseInt(tagId.substr(1)) === c.main_tag.id; });
          $scope.flow.buttonsShown = tagId;
          $scope.flow.isGray = tagId;
          console.log("Campaigns to render", $scope.flow.campaigns);
        }
      };

      $scope.flow.datear = function (tagObj) {
          Nav.datear.withTag = tagObj;
          Nav.pages.show = false;
          $timeout(function () { Nav.state.go('home.datear');}, 180);
      };

      $scope.flow.accordionHeight = function (accId) {
        if ($scope.flow.buttonsShown == accId) {
          if ($scope.flow.campaigns.length) {
            return (60 + 24 + 88*$scope.flow.campaigns.length)+"px";
          }
          return '65px';
        }
        return '0px';
      };

      $scope.flow.openSearch = function () {
        $scope.flow.showMap();
        $timeout(function () {
          $rootScope.$broadcast('search:open');
        }, 180);
      };

      $scope.flow.showCampaign = function (id) {
        Nav.state.go('home.campaignDetail', {campaignId: id});
      };

      $scope.$on('campaigns:loaded', function () {
        if ($scope.flow.buttonsShown) {
          $scope.flow.campaigns = Campaign.result.filter(function (c) { return $scope.flow.buttonsShown === "f"+c.main_tag.id; });
        }
      });

      buildTrendingTags();
  }
] );
