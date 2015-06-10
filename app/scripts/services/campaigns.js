'use strict';

angular.module('dateaMobileApp')
.service('Campaign', ['Api', 'User', '$rootScope',
function (Api, User, $rootScope) {

  var camp = {};
  camp.result = [];
  camp.trendingTags = [];

  camp.loadCampaigns = function () {
    var tags = camp.trendingTags.map(function (t) { return t.tag; });
    tags = tags.concat(User.data.tags_followed.map(function (t) { return t.tag; }));

    Api.campaign.getCampaigns({ main_tag: tags.join(',') })
    .then(function (response) {
      camp.result = response.objects;
      $rootScope.$broadcast('campaigns:loaded');
    });
  };

  camp.init = function () {
    camp.loadCampaigns();
  };

  //camp.init();

  return camp;
} ] );
