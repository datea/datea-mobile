'use strict';

angular.module('dateaMobileApp')
    .controller('DateoCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicPopup', 'config', 'User', 'Api', 'Find', 'leafletData', 'Nav', '$stateParams', '$ionicLoading', '$ionicBackdrop', 'Marker', 'Follow', '$window',
        function( $scope, $rootScope, $http, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicPopup, config, User, Api, Find, leafletData, Nav, $stateParams, $ionicLoading, $ionicBackdrop, Marker, Follow, $window) {

            var initDateoView,
                initSlideItem,
                hasUserVoted,
                updateComments,
                updateSlideBox,
                findDateoObj,
                found,
                activeDateo,
                setMapView,
                firstSlide = true;

            $scope.flow = {};
            $scope.formComment = {};
            $scope.dateFormat = config.defaultDateFormat;
            $scope.listSliders = [];

            Nav.header.setBackFunc(function () {
                Nav.reduceMap(false);
                $scope.flow.hideDateo = true;
                Nav.datear.editDateo = false;
                $timeout(function () {
                    $rootScope.$broadcast('map:showDateos');
                    Nav.state.go('^');
                }, 320);
            });

            updateComments = function ( commentPost ) {

                function insertComment() {
                    activeDateo.comments.push( commentPost );
                    activeDateo.comment_count +=1;
                    activeDateo.commentInput = '';
                    Find.query.result[found.idx] = activeDateo;
                    $scope.flow.comments          = true;
                }
                // replace dateo in the list?
                $timeout(insertComment, 500);
            };

            hasUserVoted = function (dateo) {
                $scope.flow.voteLoading = true;
                Api.vote.getVotes({
                    user     : User.data.id,
                    vote_key : 'dateo.'+dateo.id
                }).then( function ( response ) {
                    //console.log( 'hasUserVoted', response );
                    dateo.hasVoted = response.meta.total_count ? true : false;
                    dateo.vote_id  = response.objects.length ? response.objects[0].id : null;
                    $scope.flow.voteLoading = false;
                }, function ( reason ) {
                    console.log( reason );
                    $scope.flow.voteLoading = false;
                });
            };

            findDateoObj = function (id) {
                id = parseInt(id);
                for (var i=0; i<Find.query.result.length; i++) {
                    if (Find.query.result[i].id === id) return {idx: i, dateo: Find.query.result[i]};
                }
                return null;
            };

            updateSlideBox = function () {
                $ionicSlideBoxDelegate.$getByHandle('dateosSlider').update();
            };

            setMapView = function (dateo) {
                if (dateo.position) {
                    $timeout(function () {
                      var followedTags = User.data.tags_followed.map(function (t) {return t.tag;});
                      $rootScope.$broadcast('map:hideDateos');
                      $scope.homeSI.leaflet.markers['m'+dateo.id] = Marker.createMarker(dateo, followedTags);
                      leafletData.getMap('leafletHomeSI').then( function ( map ) {
                          var pos = [dateo.position.coordinates[1], dateo.position.coordinates[0]];
                          if (map.getZoom() < 16) {
                              map.setView(pos, 17, {zoom: {animate: false}});
                          }else{
                              map.panTo(pos);
                          }
                      });
                    }, 310);
                }
            };

            initDateoView = function (dateo) {

                if (typeof(dateo) !== 'undefined') {
                    found = {
                        idx : 0,
                        dateo : dateo
                    };
                }else{
                    found = findDateoObj($stateParams.dateoId);
                }

                if (!found) {
                    $ionicLoading.show(config.loadingTpl);
                    Api.dateo.getDetail({id: $stateParams.dateoId})
                    .then(function (response) {
                        $ionicLoading.hide();
                        initDateoView(response);
                    }, function (error) {
                        $ionicLoading.hide();
                        Nav.alert.checkConnection();
                        Nav.header.goBack();
                    });
                    return;
                }

                $scope.listSliders.push( found.dateo );
                firstSlide = true;
                initSlideItem(found.dateo);
                $timeout(updateSlideBox);
                Nav.header.showBackBtn = true;

                // if dateo is new don't slide up animate
                if (Nav.datear.newDateoId && dateo.id === Nav.datear.newDateoId) {
                    $scope.flow.showDateo = true;
                    $ionicLoading.hide();
                    Nav.reduceMap(true);
                } else {
                    $timeout(function () {
                        $scope.flow.showDateo = true;
                        Nav.reduceMap(true);
                    });
                }

                // Add rest of sliders 2..10
                $timeout(function () {
                    var max = 15;
                    var idx = found.idx +1;
                    var results = [];
                    for (var i=1; i<max; i++) {
                      if (idx === found.idx) break;
                      if (idx < Find.query.result.length) {
                        results.push(Find.query.result[idx]);
                        idx++;
                      }else{
                        idx = 0;
                      }
                    }
                    $scope.listSliders = $scope.listSliders.concat(results);
                    $scope.flow.showDateo = true;
                    updateSlideBox();
                }, 800);
            };

            initSlideItem = function (dateo) {
                $ionicScrollDelegate.scrollTop(false);
                activeDateo = dateo;

                if (Nav.datear.newDateoId && dateo.id === Nav.datear.newDateoId) {
                    dateo.isNew = true;
                    $scope.flow.daterito = parseInt(Math.round(Math.random()));
                    Nav.datear.newDateoId = null;
                }

                $scope.flow.isFollowing = Follow.isFollowingDateo(dateo);
                Nav.datear.editDateo = User.data.id === activeDateo.user.id ? activeDateo : null;

                hasUserVoted(dateo);
                if (firstSlide) {
                    $timeout(function () {
                        setMapView(dateo);
                    }, 10);
                    firstSlide = false;
                }else{
                    setMapView(dateo);
                }
            };

            $scope.flow.followThread = function (dateo) {
                Follow.followDateo(dateo, {callback: function () {
                    $scope.flow.isFollowing = true;
                }});
            };

            $scope.flow.unfollowThread = function (dateo) {
                Follow.unfollowDateo(dateo, {callback: function () {
                    $scope.flow.isFollowing = false;
                }});
            };

            $scope.flow.openLink = function (url) {
                $window.open(url, '_system');
            };


            $scope.flow.postComment = function () {

                var comment = {};
                    //comment.comment      = $scope.formComment.textarea;
                    comment.comment      = $scope.flow.commentInput;
                    comment.object_id    = activeDateo.id;
                    comment.content_type = 'dateo';

                $ionicLoading.show(config.loadingTpl);
                try { cordova.plugins.Keyboard.close();} catch(err) {}
                $scope.flow.editingComment = false;
                document.getElementById('comment-input').blur();

                Api.comment.postCommentByDateoId( comment ).then( function ( response ) {
                    Nav.header.noButtons = false;
                    $rootScope.$broadcast('datearBtn:show');
                    updateComments( response );
                    $ionicLoading.hide();
                    $ionicScrollDelegate.scrollBottom();
                    if (!Follow.isFollowingDateo(activeDateo)) {
                        Follow.followDateo(activeDateo, {
                            showLoading: false,
                            callback: function () { $scope.flow.isFollowing = true; }
                        });
                    }
                }, function (reason) {
                    $ionicLoading.hide();
                    Nav.alert.checkConnection();
                    Nav.header.noButtons = false;
                    $rootScope.$broadcast('datearBtn:show');
                });
            };


            $scope.flow.doVote = function () {

                if (activeDateo.user.id === User.data.id) {
                    $ionicPopup.alert({title: 'Algo salió mal', template: 'No puedes apoyar tu propio dateo :)', okType: 'button-dark'});
                    return;
                }
                $scope.flow.voteLoading = true;

                if ( activeDateo.hasVoted ) {

                    Api.vote.deleteVote( { user_id: User.data.id, vote_key: 'dateo.'+activeDateo.id } ).then( function ( response ) {

                        activeDateo.vote_count -= 1;
                        activeDateo.hasVoted = false;
                        $scope.flow.voteLoading = false;
                    }, function ( reason ) {
                        Nav.alert.checkConnection();
                        $scope.flow.voteLoading = false;
                        console.log( reason );
                    });

                } else {
                    // No vote exists
                    Api.vote.doVote( { content_type: 'dateo', object_id: activeDateo.id } ).then( function ( response ) {

                        activeDateo.vote_count += 1;
                        activeDateo.hasVoted = true;
                        $scope.flow.voteLoading = false;

                    }, function ( reason ) {
                        Nav.alert.checkConnection();
                        $scope.flow.voteLoading = false;
                        console.log( reason );
                    });
                }
            };

            $scope.flow.openFollowTag = function (tagObj) {
                Nav.follow.tag = tagObj;
                Nav.state.go('home.dateo.followTag', {dateoId: activeDateo.id});
            };

            $scope.flow.slideHasChanged = function ( index ) {
                var dateo = $scope.listSliders[index];
                initSlideItem(dateo);
            };

            $scope.flow.closeDateo = function () {
                Nav.header.goBack();
            };

            $scope.flow.openEditComment = function () {
                Nav.header.noButtons = true;
                $scope.flow.commentInput = '';
                $scope.flow.editingComment = true;
                console.log('stateData before', Nav.header.stateData);
                Nav.header.stateData.title = "Comentar";
                $timeout(function () {
                    document.getElementById('comment-input').focus();
                    try { cordova.plugins.Keyboard.show(); } catch(err) {}
                });
                $rootScope.$broadcast('datearBtn:hide');
            };

            $scope.flow.closeEditComment = function () {
                try { cordova.plugins.Keyboard.close(); } catch(err) {}
                $scope.flow.editingComment = false;
                Nav.header.noButtons = false;
                $rootScope.$broadcast('datearBtn:show');
                 Nav.header.stateData.title = null;
            };

            $scope.flow.openShare = function( dateo ) {

                var title, message, image, link, tags = '';

                message = dateo.extract || null;
                link    = 'http://datea.pe/' + dateo.user.username + '/dateos/' + dateo.id;

                if ( dateo.tags.length > 0 ) {

                    for ( var i = 0, len = dateo.tags.length; i < len; i++ ) {
                        tags += ' #' + dateo.tags[i].tag;
                    }

                    title = dateo.user.username + ' dateo en' + tags;

                } else {
                    title = dateo.user.username + ' compartió su dateo';
                }

                /*if ( dateo.images.length > 0 ) {
                    image   = 'https://api.datea.io' + dateo.images[0].image;

                } else {
                    image = null;
                }  // */

                //console.info( title );

                window.plugins.socialsharing.share( message, title, null, link );  // */
            };

            $scope.$on('keyboard:show', function (e, args) {
                $scope.flow.containerStyle = {bottom: args.keyboardHeight+'px'};
            });

            $scope.$on('keyboard:hide', function () {
                $scope.flow.editingComment = false;
                Nav.header.noButtons = false;
            });

            initDateoView();
        }
    ]);
