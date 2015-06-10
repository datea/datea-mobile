'use strict';

angular.module('dateaMobileApp')
.controller('CampaignDetailCtrl', ['$scope', '$rootScope', '$ionicLoading', 'config', 'Api', 'Nav', '$timeout', '$stateParams', 'Follow', 'User', 'Find',
function( $scope, $rootScope, $ionicLoading, config, Api, Nav, $timeout, $stateParams, Follow, User, Find) {

  Nav.reduceMap(false);
	$scope.flow = {};
  if (Nav.campaign.detail) {
	   $scope.campaign = Nav.campaign.detail;
     $scope.flow.isFollowing = Follow.isFollowingTag($scope.campaign.main_tag);
  }else{
    $ionicLoading.show(config.loadingTpl);
    Api.campaign.getCampaigns({id: $stateParams.campaignId})
    .then(function (response) {
      $scope.campaign = response.objects[0];
      $scope.flow.isFollowing = Follow.isFollowingTag($scope.campaign.main_tag);
      $ionicLoading.hide();
    });
  }

	// start animation (ng-show) in parent controller when entering
  $timeout( function () { $scope.flow.showPage = true;});

  Nav.header.setBackFunc(function () {
    $scope.flow.hidePage = true;
    if (Nav.state.current.name === 'home.campaigns.detail') {
      $timeout(function () { Nav.state.go('^');}, 180);
    }else{
      $timeout(function () { Nav.state.go('home.hello');}, 180);
    }
  });

	$scope.flow.unFollow = function (objTag) {
    Follow.unfollowTag(objTag, {callback: function () {
      $scope.flow.isFollowing = false;
    }});
  };

  $scope.flow.doFollow = function (objTag) {
    Follow.followTag(objTag, {callback: function () {
      $scope.flow.isFollowing = true;
    }});
  };

  $scope.flow.datear = function () {
    Nav.datear.withTag = $scope.campaign.main_tag;
    Nav.pages.show = false;
    $timeout(function () { Nav.state.go('home.datear');}, 180);
	};

	$scope.flow.searchByTag = function (tagObj) {
  	Find.query.inputSearch = '#'+tagObj.tag;
  	if (Find.query.filter !== 'all'
  		&& User.data.tags_followed.filter(function (t){ return t.id === tagObj.id; }).length === 0) {
  		Find.query.filter = 'all';
  	}
    $rootScope.$broadcast('query:updated');
    Nav.pages.show = false;
  	$timeout(function () { Nav.state.go('home');}, 180);
  };


} ] );

