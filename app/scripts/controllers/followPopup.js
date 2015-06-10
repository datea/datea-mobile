'use strict';

angular.module('dateaMobileApp')
.controller('FollowPopupCtrl', ['$scope', 'config', 'Api', 'Nav', '$stateParams', 'User', '$ionicLoading', '$timeout', 'Find', 'Follow', '$rootScope',
function( $scope, config, Api, Nav, $stateParams, User, $ionicLoading, $timeout, Find, Follow, $rootScope) {

	$scope.tag = Nav.follow.tag;
	$scope.follow = {};
	$scope.follow.showPopup = false;
	$scope.follow.isFollowing = Follow.isFollowingTag($scope.tag);

	var prevBackFunc = Nav.header.backFunc;
	Nav.header.setBackFunc(function () {
		$scope.follow.showPopup = false;
		$timeout(function () {
			Nav.state.go('^');
    	Nav.header.setBackFunc(prevBackFunc);
		}, 100);
	});

	$timeout(function () {
		$scope.follow.showPopup = true;
	}, 10);

	$scope.follow.follow = function () {
		Follow.followTag($scope.tag, {callback: function () {
			$scope.follow.isFollowing = true;
			Nav.header.backFunc();
		}});
	};

	$scope.follow.unfollow = function () {
		Follow.unfollowTag($scope.tag, {callback: function () {
			$scope.follow.isFollowing = false;
			Nav.header.backFunc();
		}});
	};

	$scope.follow.showDateos = function () {
		Find.query.inputSearch = '#'+$scope.tag.tag;
	  	if (Find.query.filter !==  'all'
	  		&& User.data.tags_followed.filter(function (t){ return t.id ===  $scope.tag.id; }).length ===  0) {
	  		Find.query.filter = 'all';
	  	}
	    $rootScope.$broadcast('query:updated');
	    prevBackFunc();
	};

	$scope.follow.close = function () {
		Nav.header.backFunc();
	};

} ] );
