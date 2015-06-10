'use strict';

angular.module('dateaMobileApp')
.filter('campaignImg',
[ 'config'
,function (
  config
) {
	return function (input) {
		return input ? config.api.imgUrl + input : config.campaign.defaultImage;
	};
}]);
