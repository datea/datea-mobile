'use strict';

angular.module('dateaMobileApp')
    .controller('TwitterCallbackCtrl', ['$window', '$location', '$scope', 'wxBirdangularService', 'localStorageService',
        function(
            $window, $location, $scope, wxBirdangularService, localStorageService
        ) {
            var ls = localStorageService,
                ba = wxBirdangularService,
                url, query;

            url = $location.absUrl();
            console.log($location);

            if (url.match(/\?(.+)$/)) {
                query = url.match(/\?(.+)$/)[0].split('&');
            }

            ba.setToken({
                token: $window.opener.oauth_token,
                secret: $window.opener.oauth_token_secret
            });

            ba
                .accessToken(query[1].split('=')[1].split('#')[0])
                .then(function(data) {
                    ls.set('keys-twitter', data);
                    $window.opener.oauth_token = null;
                    $window.opener.oauth_token_secret = null;
                    $window.opener.$windowScope.flow.onCallback();
                    $window.close();
                });
        }
    ]);
