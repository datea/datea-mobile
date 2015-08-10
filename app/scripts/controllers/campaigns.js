'use strict';

angular.module('dateaMobileApp')
    .controller('CampaignsCtrl', ['$scope', '$ionicLoading', 'config', 'Api', 'Nav', '$timeout', '$ionicScrollDelegate', '$rootScope',
        function( $scope, $ionicLoading, config, Api, Nav, $timeout, $ionicScrollDelegate, $rootScope ) {

            var getCampaigns,
                getCategories;

        	$scope.data           = {};
            $scope.data.campaigns = [];
            $scope.data.numHits   = 0;
            $scope.data.noResults = false;
            $scope.query          = {};
            $scope.query.limit    = 20;
            $scope.query.offset   = 0;
            $scope.query.category = 'select';
            $scope.flow           = {};
            $scope.flow.init      = true;
            $scope.flow.scrollPos = 0;

            // start animation (ng-show) in parent controller when entering
            $timeout( function () { Nav.pages.show = true;});

            Nav.header.setBackFunc(function () {
                Nav.pages.show = false;
                Nav.reduceMap(false);
                $timeout(function () { Nav.state.go('home');}, 180);
            });

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
                if (toState.name === 'home.campaigns' && fromState.name === 'home.campaigns.detail') {
                    $ionicScrollDelegate.$getByHandle('campaignScroll').scrollTo(0, $scope.flow.scrollPos, false);
                    Nav.header.setBackFunc(function () {
                        Nav.pages.show = false;
                        Nav.reduceMap(false);
                        $timeout(function () { Nav.state.go('home');}, 180);
                    });
                }
            });

            getCategories = function () {
                Api.category
                .getCategories( {} )
                .then( function ( response ) {
                    $scope.flow.categories = response.objects;
                    $scope.flow.categories.unshift({id: 'all', 'name': '-- todas --'});
                    $scope.flow.categories.unshift({id: 'select', 'name': '-- elegir categoría --'});
                } );
            };
            getCategories();

            getCampaigns = function () {

                $ionicLoading.show(config.loadingTpl);

                var params = {
                    limit     : $scope.query.limit,
                    order_by  : '-featured,-created',
                    published : true,
                };
                params.offset = $scope.query.limit * $scope.query.offset;
                if ($scope.query.search) params.q = $scope.query.search;
                if ($scope.query.category && $scope.query.category !== 'all' && $scope.query.category !== 'select') params.category_id = $scope.query.category;

                Api.campaign.getCampaigns(params)
                .then(function (result) {
                    $scope.data.noResults = !result.meta.total_count;
                    $scope.data.campaigns =  $scope.data.campaigns.concat(result.objects);
                    $scope.data.numHits   =  result.meta.total_count;
                    $ionicLoading.hide();
                    $scope.flow.init = false;
                }, function (error) {
                    console.log(error);
                    $ionicLoading.hide();
                    Nav.alert.checkConnection();
                });
            };

            $scope.flow.doQuery = function () {
                // reset all
                $scope.data.campaigns = [];
                $scope.data.numHits = 0;
                $scope.query.offset = 0;
                // do query
                getCampaigns();
            };

            $scope.flow.loadMore = function () {
                $scope.query.offset++;
                getCampaigns();
            };


            $scope.flow.showCampaignDetail = function (idx) {
                $scope.flow.scrollPos = $ionicScrollDelegate.$getByHandle('campaignScroll').getScrollPosition().top;
                //$ionicScrollDelegate.$getByHandle('campaignScroll').rememberScrollPosition('campaigns')
                var campaign = $scope.data.campaigns[idx];
                Nav.campaign.detail = campaign;
                Nav.state.go('home.campaigns.detail', {campaignId: campaign.id});
            };

            $scope.flow.doQuery();

} ] );
