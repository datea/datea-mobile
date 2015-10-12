'use strict';

angular.module('dateaMobileApp')
.controller('NotificationsCtrl', ['$scope', 'config', 'Nav', '$timeout', '$ionicLoading', 'Notifications',
function( $scope, config, Nav, $timeout, $ionicLoading, Notifications) {

	$scope.flow = {};
	$scope.notifications = Notifications;

	$scope.flow.loading = true;
	$ionicLoading.show(config.loadingTpl);
	Notifications.load({}, function () {
		Notifications.readAll();
		$ionicLoading.hide();
		$scope.flow.loading = false;
	});

	$scope.flow.moreNotifications = function () {
		$ionicLoading.show(config.loadingTpl);
		Notifications.loadMore({}, function () {
			$ionicLoading.hide();
		});
	};

	$timeout(function () { $scope.flow.showPage = true; });

	var backFunc = function () {
		$scope.flow.hidePage = true;
		Nav.reduceMap(false);
		$timeout(function () {
			Nav.state.go('^');
		}, 180);
	};

  Nav.header.setBackFunc(backFunc);

} ] );
