'use strict';

angular.module('dateaMobileApp')
.filter('apiImg',
[ 'config'
,function (
  config
) {
	return function (input) {
		return config.api.imgUrl + input;
	};
}]);