'use strict';

angular.module('dateaMobileApp')
.controller('IntroCtrl', ['$scope', 'Nav', '$timeout',
function ($scope, Nav, $timeout) {

	$scope.intro = {};
	$scope.intro.step = 1;
	$scope.intro.showIntro = false;

	Nav.header.setBackFunc(function () {
		Nav.state.go('home.hello');
	});

	$scope.$on('home:loaded', function () {
		$timeout(function () {
			$scope.intro.showIntro = true;
		}, 1200);
	});

	if ($scope.flow.homeLoaded) {
		$timeout(function () {
			$scope.intro.showIntro = true;
		}, 1200);
	}

	$scope.intro.close = function () {
		$scope.intro.showIntro = false;
		$timeout(function () {
			Nav.state.go('home.hello');
		}, 320);
	};

} ] );
