'use strict';

angular.module('dateaMobileApp')
    .service('Api', [ '$http', '$q', '$resource', 'config', 'localStorageService', 'Errors',
        function Api( $http, $q, $resource, config, localStorageService, Errors ) {
            var headers,
                ls = localStorageService,
                activityLog = {},
                account  = {},
                dateo    = {},
                campaign = {},
                category = {},
                comment  = {},
                flag   = {},
                follow = {},
                stats= {},
                tag  = {},
                user = {},
                userFollow = {},
                vote = {},
                notification = {},
                reconfigUserRsrc,
                configureRsrc;

            headers = ls.get('token');

            account.social = {};
            account.social.twitter = {};
            account.social.facebook = {};
            account.register = {};
            account.signIn = {};
            account.password = {};

            tag.autocomplete = {};
            tag.trending     = {};

            vote.remove = {};

            reconfigUserRsrc = function() {
                user.rsrc = $resource(config.api.url + 'user/:id', {}, {
                    'get': {
                        method: 'GET'
                    },
                    'getByUsername': {
                        url: config.api.url + 'user/:username',
                        method: 'GET',
                        params: {
                            username: '@username'
                        },
                        headers: headers || ls.get('token')
                    },
                    'patch': {
                        method: 'PATCH',
                        params: {
                            id: '@id'
                        },
                        headers: headers || ls.get('token')
                    }
                });
            };

            configureRsrc = function () {
                dateo.rsrc = $resource(config.api.url + 'dateo_full/', {}, {
                    'query': {
                        method: 'GET'
                    },
                    'getDetail' : {
                        url: config.api.url + 'dateo_full/:id',
                        method: 'GET',
                        params: {
                            id: '@id'
                        },
                        headers: headers || ls.get('token')
                    },
                    'post': {
                        method: 'POST',
                        headers: headers || ls.get('token')
                    },
                    'patch' : {
                        method  : 'PATCH',
                        headers : headers || ls.get('token'),
                        url     : config.api.url + 'dateo_full/:id',
                        params  : { id: '@id'}
                    },
                    'put' : {
                        method  : 'PUT',
                        headers : headers || ls.get('token')
                    }
                });

                comment.rsrc = $resource( config.api.url + 'comment/', {}, {
                    'query': {
                        method : 'GET'
                    },
                    'post' : {
                        method  : 'POST',
                        headers : headers || ls.get('token')
                    }
                });

                account.social.twitter.rsrc = $resource(config.api.url + 'account/socialauth/twitter/', {}, {
                    'post': {
                        method: 'POST'
                    }
                });

                account.social.facebook.rsrc = $resource(config.api.url + 'account/socialauth/facebook/', {}, {
                    'post': {
                        method: 'POST'
                    }
                });

                account.register.rsrc = $resource(config.api.url + 'account/register/', {}, {
                    'post': {
                        method: 'POST'
                    }
                });

                account.signIn.rsrc = $resource(config.api.url + 'account/signin/ ', {}, {
                    'post': {
                        method: 'POST'
                    }
                });

                account.password.rsrc = $resource(config.api.url + 'account/reset-password/', {}, {
                    'save': {
                        method: 'POST'
                    }
                });

                user.rsrc = $resource(config.api.url + 'user/:id', {}, {
                    'get': {
                        method: 'GET',
                        params: {
                            id: '@id'
                        },
                        headers: headers || ls.get('token')
                    },
                    'getByUsername': {
                        url: config.api.url + 'user/:username',
                        method: 'GET',
                        params: {
                            username: '@username'
                        },
                        headers: headers || ls.get('token')
                    },
                    'patch': {
                        method: 'PATCH',
                        params: {
                            id: '@id'
                        },
                        headers: headers || ls.get('token')
                    }
                });

                userFollow.rsrc = $resource( config.api.url + 'user/', {}, {
                    'query' : {
                        method : 'GET'
                    }
                });

                tag.rsrc = $resource( config.api.url + 'tag/', {}, {
                    'get' : {
                        method : 'GET'
                    }
                });

                tag.autocomplete.rsrc = $resource( config.api.url + 'tag/autocomplete/', {}, {
                    'get' : {
                        method : 'GET'
                    }
                });

                tag.trending.rsrc = $resource( config.api.url + 'tag/trending/', {}, {
                    'get' : {
                        method : 'GET'
                    }
                });

                campaign.rsrc = $resource( config.api.url + 'campaign/', {}, {
                    'query': {
                        method : 'GET'
                    },
                    'post' : {
                        method  : 'POST',
                        headers : headers || ls.get('token')
                    }
                });

                vote.rsrc = $resource( config.api.url + 'vote/', {}, {
                    'query' : {
                        method : 'GET'
                    },
                    'post'  : {
                        method : 'POST',
                        headers : headers || ls.get('token')
                    },
                });

                vote.remove.rsrc = $resource( config.api.url + 'vote/?user=:user_id' + '&vote_key=:vote_key',
                    {
                        user_id  : '@user_id',
                        vote_key : '@vote_key'
                    }, {
                    'delete': {
                        method : 'DELETE',
                        headers : headers || ls.get('token')
                    }
                });

                flag.rsrc = $resource( config.api.url + 'flag/', {}, {
                    'post' : {
                        method : 'POST',
                        headers : headers || ls.get('token')
                    }
                });

                follow.rsrc = $resource( config.api.url + 'follow/', {}, {
                    'query' : {
                        method : 'GET'
                    },
                    'post' : {
                        method : 'POST',
                        headers : headers || ls.get('token')
                    },
                    'delete' : {
                        method : 'DELETE',
                        headers : headers || ls.get('token')
                    }
                });

                category.rsrc = $resource( config.api.url + 'category/', {},
                    { 'query': { method : 'GET' } }
                );

                activityLog.rsrc = $resource(config.api.url + 'activity_log/', {}, {
                    'query': {
                        method: 'GET'
                    }
                });

                notification.rsrc = $resource(config.api.url + 'notification/', {}, {
                    'query' : {
                        method : 'GET'
                    },
                    'patch': {
                        method: 'PATCH',
                        params: {
                            id: '@id'
                        },
                        headers: headers || ls.get('token')
                    },
                    'readAll': {
                        method : 'GET',
                        url : config.api.url + 'notification/readall/',
                        headers : headers || ls.get('token')
                    }
                });
            };
            configureRsrc();

            /* User */
            user.getUserByUserIdOrUsername = function(params) {
                var token = ls.get('token'),
                    dfd = $q.defer();
                //params.id = params && params.username ? params.username : params.id;
                user.rsrc.getByUsername({}, params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            user.updateUserByUserId = function(params) {
                var token = ls.get('token'),
                    dfd = $q.defer();
                user.rsrc.patch({}, params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            user.getUsers = function ( params ) {
                var dfd = $q.defer();
                userFollow.rsrc.query( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            user.getToken = function(params) {
                var isFromTwitter = params && params.fromTwitter;
                headers = ls.get('token');
                if (isFromTwitter) {
                    reconfigUserRsrc();
                }
            };


            /* SignIn/Account */
            account.signIn.signIn = function(params) {
                var dfd = $q.defer();
                account.signIn.rsrc.post(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };


            /* Register */
            account.register.createUser = function(params) {
                var dfd = $q.defer();
                account.register.rsrc.post(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    Errors.show(error);
                    dfd.reject(error);
                });
                return dfd.promise;
            };


            /* Social */
            account.social.signInBy3rdParty = function(params) {
                var dfd = $q.defer(),
                    party = params.party;

                account.social[party].rsrc.post(params, function(response) {
                    //console.log('signInBy3rdParty', response);
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };


            /* Reset Password */
            account.resetPassword = function(params) {
                var dfd = $q.defer();
                account.password.rsrc.save(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            /* Category */
            category.getCategories = function ( params ) {
                var dfd = $q.defer();
                category.rsrc.query( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                } );
                return dfd.promise;
            };


            /* Dateo */
            dateo.getDateos = function(params) {
                var dfd = $q.defer();
                dateo.rsrc.query(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            dateo.getDetail = function (params) {
                var dfd = $q.defer();
                dateo.rsrc.getDetail(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            dateo.patchDetail = function (params) {
                var dfd = $q.defer();
                dateo.rsrc.patch(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            dateo.getDateosByUsername = function(username) {
                var dfd = $q.defer();
                dateo.rsrc.query({
                    user: username
                }, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            dateo.getDateoByUsernameAndDateoId = function(params) {
                var dfd = $q.defer();
                dateo.rsrc.query(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            dateo.postDateo = function(params) {
                var dfd = $q.defer();
                dateo.rsrc.post(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };


            /* Comment */
            comment.postCommentByDateoId = function ( params ) {

                var dfd   = $q.defer(),
                    token = ls.get('token');

                comment.rsrc.post( {}, params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };


            /* Tags */
            tag.getTags = function ( params ) {
                var dfd = $q.defer();
                tag.rsrc.get( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            tag.getAutocompleteByKeyword = function ( params ) {
                var dfd = $q.defer();
                tag.autocomplete.rsrc.get( params, {}, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            tag.getTrendingTags = function ( params ) {
                var dfd = $q.defer();
                tag.trending.rsrc.get( params, {}, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            /* Follow */
            follow.getFollows = function ( params ) {
                var dfd = $q.defer();
                follow.rsrc.query( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            follow.doFollow = function ( params ) {
                var dfd = $q.defer();
                follow.rsrc.post( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            follow.doUnfollow = function ( params ) {
                var dfd = $q.defer();
                follow.rsrc.delete( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };


            /* Votes */
            vote.getVotes = function ( params ) {
                var dfd = $q.defer();
                vote.rsrc.query( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            vote.doVote = function ( params ) {
                var dfd   = $q.defer(),
                    token = ls.get('token');

                vote.rsrc.post( {}, params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            vote.deleteVote = function ( params ) {
                var dfd   = $q.defer(),
                    token = ls.get('token');

                vote.remove.rsrc.delete( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };


            /* Flag */
            flag.doFlag = function ( params ) {
                var dfd = $q.defer();
                flag.rsrc.post( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };


            /* Campaigns */
            campaign.getCampaigns = function ( params ) {
                var dfd = $q.defer();
                campaign.rsrc.query( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            campaign.postCampaign = function ( params ) {
                var dfd = $q.defer();
                campaign.rsrc.post( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };


            /* ActivityLog */
            activityLog.getActivityOfUserByUserId = function(params) {
                var dfd = $q.defer();
                activityLog.rsrc.query(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            notification.getList = function (params) {
                var dfd = $q.defer();
                notification.rsrc.query(params, function(response) {
                    dfd.resolve(response);
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            notification.patchList = function (params) {
                var dfd = $q.defer();
                notification.rsrc.patch( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };

            notification.readAll = function (params) {
                var dfd = $q.defer();
                notification.rsrc.readAll( params, function ( response ) {
                    dfd.resolve( response );
                }, function ( error ) {
                    dfd.reject( error );
                });
                return dfd.promise;
            };


            return {
                account: account,
                activityLog: activityLog,
                campaign : campaign,
                category : category,
                comment : comment,
                dateo: dateo,
                flag : flag,
                follow : follow,
                stats : stats,
                tag: tag,
                user: user,
                vote : vote,
                notification : notification,
                resetRsrc: configureRsrc
            };

        }
    ]);
