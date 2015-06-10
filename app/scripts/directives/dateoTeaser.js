'use strict';

angular.module('dateaMobileApp')
.directive('dateoTeaser',
[ 'config', function (config) {
	return {
		  restrict    : 'E'
		, replace     : true
		, templateUrl : 'templates/dateo-teaser.html'
		, controller  : function ($scope, $element, $attrs) {
				$scope.dateFormat = config.defaultDateFormat;
		}
	};
} ] );
