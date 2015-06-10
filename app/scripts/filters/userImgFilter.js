'use strict';

angular.module('dateaMobileApp')
.filter('userImg',
[ 'config'
,function (
  config
) {
	return function (input) {
		return input ? config.api.imgUrl + input : config.profile.defaultImg;
	};
}]);
