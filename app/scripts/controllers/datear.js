'use strict';

angular.module('dateaMobileApp')
    .controller('DatearCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$ionicPopup', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', 'config', 'Api', 'Nav', 'leafletData', '$state', '$stateParams', 'User', 'Find', 'Follow', 'Marker', '$ionicLoading', '$ionicModal', 'localStorageService', '$cordovaFileTransfer',
        function( $scope, $rootScope, $http, $timeout, $ionicPopup, $ionicSlideBoxDelegate, $ionicScrollDelegate, config, Api, Nav, leafletData, $state, $stateParams, User, Find, Follow, Marker, $ionicLoading, $ionicModal, localStorageService, $cordovaFileTransfer

            ) {

            var imageAdded     = false;
            var imageUploading = false;
            var savingDateo    = false;

            $scope.datear = {};
            $scope.datear.object  = {};
            $scope.datear.suggestedTags = [];
            $scope.datear.showEditMap = false;
            $scope.datear.tagsNav = true;
            $scope.datear.tagsPage = 1;
            $scope.datear.maxSuggested = 7;
            $scope.datear.limitSuggested = 7;
            $scope.nav = Nav;

            var initDatearEnv = function (dateo) {
                $scope.datear.object = dateo || {};
                $scope.datear.mode = $scope.datear.object.id ? 'edit' : 'new';
                $scope.datear.submitLabel = $scope.datear.object.id ? 'Guardar' : 'Datear';
                $scope.datear.form    = {};
                $scope.datear.marker  = {};
                $scope.datear.hashtag = [];
                $scope.datear.itemsAutocomplete = [];
                if ($scope.datear.object.tags) {
                    $scope.datear.selectedTags = $scope.datear.object.tags.map(function (t) {return t.tag;});
                }else{
                    $scope.datear.selectedTags = [];
                }

                $rootScope.$broadcast('map:hideDateos');

                // preset tags if comming from somewhere else than home
                if (Nav.datear.withTag) {
                    $scope.datear.selectedTags.push(Nav.datear.withTag.tag);
                    if (Nav.datear.withTag.campaigns.length) {
                        var suggested = [];
                        angular.forEach(Nav.datear.withTag.campaigns, function (c) {
                            suggested = suggested.concat(c.secondary_tags);
                        });
                        $scope.datear.suggestedTags = suggested;
                    }
                    // set back withTag to null
                    Nav.datear.withTag = null;
                    $scope.datear.tagsNav = false;
                // else, use tags followed as suggested
                }else{
                    $scope.datear.suggestedTags = User.data.tags_followed.map(function (t) {return t.tag;});
                }

                $timeout(function () {
                    $ionicSlideBoxDelegate.$getByHandle('suggestedTags').enableSlide(false);
                });

                $scope.datear.showAutocomplete = false;
                $scope.alerts = [];

                /*  Only Cordova mode  */
                if ($scope.datear.object.images && $scope.datear.object.images.length) {
                    $scope.datear.form.ImgUrl = config.api.imgUrl + $scope.datear.object.images[0].image;
                }else{
                    $scope.datear.form.ImgUrl = '';
                    $scope.datear.form.ImgName = '';
                }

                // geolocate and position map
                if ($scope.datear.object.position) {
                    setPosition($scope.datear.object.position.coordinates[1], $scope.datear.object.position.coordinates[0]);
                }else{
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            setPosition(position.coords.latitude, position.coords.longitude);
                        }
                    ,   function (error) {
                            console.log('position error', error);
                        }
                    ,   { maximumAge: 30000, timeout: 10000, enableHighAccuracy: false} );
                }

                $timeout(function () {
                    $scope.datear.showDatearForm = true;
                    var sBox = $ionicSlideBoxDelegate.$getByHandle('suggestedTags');
                    sBox.update();
                    Nav.reduceMap(true);
                }, 0);

                var backFunc = function () {
                  if ($scope.datear.editingTags) {
                      $scope.datear.closeTagEdit();
                      $timeout(function () { Nav.header.setBackFunc(backFunc); }, 300);
                  }else if ($scope.datear.mode === 'edit') {
                      $state.go('home.dateo', {dateoId: $stateParams.dateoId});
                  }else{
                      $scope.datear.hideDatearForm = true;
                      Nav.reduceMap(false);
                      $rootScope.$broadcast('map:showDateos');
                      $timeout(function () {
                          $state.go('^');
                      }, 350);
                  }
                };
                Nav.header.setBackFunc(backFunc);
            };

            var setPosition = function (lat, lng) {
                leafletData.getMap('leafletHomeSI').then(function(map) {
                    map.setView([lat, lng], 17);
                    var newDraggy = {
                        lat : lat,
                        lng : lng,
                        draggable : true,
                        focus: true,
                        _id: 'draggy',
                        icon: Marker.defaultIcon
                    };
                    $scope.datear.marker = newDraggy;
                    $timeout(function () {
                        $scope.homeSI.leaflet.markers = {draggy: newDraggy};
                    });
                });
            };

            /* Get Image */
            var getPicture = function(source) {

                function onSuccess(fileURI) {
                    $scope.datear.form.ImgUrl = fileURI;

                    imageUploading = true;

                    var options = new FileUploadOptions();
                    options.fileKey  = "image";
                    options.fileName = _.last(fileURI.split('/')).replace(' ','_');
                    var extension = _.last(options.fileName.split('.')).toLowerCase();
                    if (extension == 'jpg' || extension == 'jpeg') {
                        options.mimeType = 'image/jpeg';
                    }else{
                        options.mimeType = 'image/'+extension;
                    }
                    var params = { order: $scope.datear.mode === 'edit' && $scope.datear.object.images && $scope.datear.object.images.length > 1 ? $scope.datear.object.images.length - 1 : 0 };
                    options.chunkedMode = false;
                    options.headers = localStorageService.get('token');

                    $cordovaFileTransfer.upload(config.api.imgUrl+"/image/save/", fileURI, options)
                    .then(function (success) {
                        var imgRsc = JSON.parse(success.response).resource;
                        if ($scope.datear.mode === 'edit' && $scope.datear.object.images && $scope.datear.object.images.length > 1) {
                            $scope.datear.object.images.push(imgRsc);
                        }else{
                            $scope.datear.object.images = [imgRsc];
                        }
                        console.log('datear object', $scope.datear.object);
                        imageUploading = false;
                        imageAdded = true;
                        if (savingDateo) {
                            savingDateo = false;
                            $scope.datear.doDatear();
                        }

                    }, function (error) {
                        console.log('upload error', error);
                    });
                }

                function onFail(message) {
                    alert('Failed because: ' + message);
                }

                navigator.camera.getPicture(onSuccess, onFail, {
                    quality: 85,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 1024,
                    targetHeight: 1024,
                    //allowEdit: true,
                    //saveToPhotoAlbum: true,
                    sourceType: Camera.PictureSourceType[source],
                    destinationType: Camera.DestinationType.FILE_URI, //Camera.DestinationType.DATA_URL,
                    correctOrientation: 1
                });
            };

            if (Nav.datear.editDateo) {
                initDatearEnv(angular.copy(Nav.datear.editDateo));
            }else{
                initDatearEnv();
            }

            /* Events Functions to leaflet Map */
            $scope.$on( 'leafletDirectiveMarker.dragend', function ( event, args ) {

                var markerDraggy = args.leafletEvent.target;

                if ( $scope.homeSI.leaflet.center.zoom <= 16 && $scope.flow.dateaNext === true ) {
                    leafletData.getMap('leafletHomeSI').then(function(map) {
                        map.setZoomAround(markerDraggy.getLatLng(), map.getZoom() + 1);
                    });
                }
            });

            $scope.$on( 'leafletDirectiveMap.click', function ( event, args ) {
                var leafEvent = args.leafletEvent;
                if (!$scope.homeSI.leaflet.markers.length) {
                    var newDraggy = {
                        lat : leafEvent.latlng.lat,
                        lng : leafEvent.latlng.lng,
                        draggable : true,
                        focus: true,
                        _id: 'draggy',
                        icon: Marker.defaultIcon
                    };
                    $scope.datear.marker = newDraggy;
                    $scope.homeSI.leaflet.markers = {draggy: newDraggy};
                }else{
                    $scope.datear.marker.lat = leafEvent.latlng.lat;
                    $scope.datear.marker.lng = leafEvent.latlng.lng;
                }

                $scope.flow.dateaAddress = true;
                if ( $scope.homeSI.leaflet.center.zoom <= 16 ) {
                   leafletData.getMap('leafletHomeSI').then(function(map) {
                        map.setZoomAround(leafEvent.latlng, map.getZoom() + 1);
                   });
                }
            });

            /* Date picker */
            $scope.flow.today = function() {

                $scope.flow.dt = new Date();
            };

            $scope.flow.today();

            $scope.flow.minDate = null;

            $scope.flow.dateOptions = {
                'year-format': '\'yy\'',
                'starting-day': 1
            };

            // Time picker
            $scope.flow.timeNow = new Date();

            $scope.flow.hstep = 1;
            $scope.flow.mstep = 1;

            // Datetime sum
            $scope.$watch( 'flow.dt + flow.timeNow', function () {

                var datetime = {};

                if ( $scope.flow.dt && $scope.flow.timeNow ) {
                    datetime.year     = $scope.flow.dt.getUTCFullYear();
                    datetime.month    = $scope.flow.dt.getUTCMonth();
                    datetime.day      = $scope.flow.dt.getDate();
                    datetime.hour     = $scope.flow.timeNow.getHours();
                    datetime.minutes  = $scope.flow.timeNow.getUTCMinutes();

                    $scope.datear.object.date = new Date(
                        datetime.year,
                        datetime.month,
                        datetime.day,
                        datetime.hour,
                        datetime.minutes,
                        '00'
                    );
                    //console.log( 'datetime', $scope.datear.object.date );
                }
            });

            $scope.datear.editPosition = function (val) {
                $scope.datear.showEditMap = val;
                if (val) {
                    Nav.datearMap(true);
                    $scope.datear.showEditMapForm = true;
                    $timeout(function () {
                        $scope.datear.letMapThrough = true;
                    }, 310);
                } else {
                    $scope.datear.letMapThrough = false;
                    leafletData.getMap('leafletHomeSI').then(function(map) {
                        map.setView([$scope.datear.marker.lat, $scope.datear.marker.lng], 17);
                    });
                    Nav.reduceMap(true);
                    $timeout(function () {
                        $scope.datear.showEditMapForm = false;
                    }, 300);
                }
            };

            $scope.datear.openImageModal = function() {

                $ionicModal.fromTemplateUrl('templates/image-modal.html', {
                    scope: $scope,
                    animation: false
                  }).then(function(modal) {
                    $scope.imageModal = modal;
                    modal.show();
                  });
            };

            $scope.datear.takeImage = function () {
                $scope.imageModal.remove();
                getPicture('CAMERA');
            };

            $scope.datear.browseImage = function () {
                $scope.imageModal.remove();
                getPicture('PHOTOLIBRARY');
            };

            $scope.datear.closeImgModal = function () {
                $scope.imageModal.remove();
            };

            $scope.datear.showAlert = function( message ) {

                var alertPopup = $ionicPopup.alert({
                    title: 'Espera, falta algo :)',
                    template: message
                });

                alertPopup.then(function(res) {
                    //console.warn('Error de Validación:' + message );
                });

                /*navigator.notification.alert(
                    message,                // message
                    doSomething,            // callback
                    'Error de Validación',  // title
                    'Ok'                    // buttonName
                );   // */
            };

            var hashtagify = function ( name ) {
                var hashtag = name.split(' ');
                hashtag = hashtag.map( function (w) {
                    w = w.replace(/[^a-z0-9]/gi,'');
                    return w.charAt(0).toUpperCase() + w.slice(1);
                });
                return hashtag.join('');
            };

            var CITagSelected = function (tag) {
                var selectedTags = $scope.datear.selectedTags.map(function (t) {return t.toLowerCase();});
                return selectedTags.indexOf(tag.toLowerCase()) !== -1;
            };

            $scope.datear.addTag = function ( tag ) {

                if (!tag) return;

                $scope.datear.form.nextTag = null;
                $scope.datear.itemsAutocomplete = [];
                $scope.datear.showAutocomplete = false;

                tag = hashtagify(tag);

                if ( !CITagSelected(tag) && $scope.datear.selectedTags.length < config.dateo.tagsMax ) {
                    tag = tag.replace('#','');
                    $scope.datear.selectedTags.push( tag );
                }
                if ($scope.datear.tagsNav && $scope.datear.tagsPage === 1) {
                    // tag added has campaigns
                    var ftags = User.data.tags_followed.filter(function (t) {
                        return t.tag === tag;
                    });

                    //console.log('ftags', ftags);

                    var suggested2 = [];

                    if (ftags.length) {
                        angular.forEach(ftags[0].campaigns, function (c) {
                            suggested2 = suggested2.concat(c.secondary_tags);
                        });
                        openSuggested2(suggested2);
                    }else{
                        Api.tag.getTags({tag: tag})
                        .then(function (response) {
                            if (response.objects.length) {
                                angular.forEach(response.objects[0].campaigns, function (c) {
                                    suggested2 = suggested2.concat(c.secondary_tags);
                                });
                                openSuggested2(suggested2);
                            }
                        },function (error) {
                            console.log('tag error', error);
                        });
                    }
                }
            };

            var openSuggested2 = function (tagList) {
                if (tagList.length)  {
                    $scope.datear.suggestedTags2 = tagList;
                    $scope.datear.tagsPage = 2;

                    var sBox = $ionicSlideBoxDelegate.$getByHandle('suggestedTags');

                    sBox.update();
                    $timeout(function () {
                        sBox.slide(1, 500);
                        sBox.enableSlide(true);
                    }, 100);
                }
            };

            $scope.datear.tagIsSelected = function (tag) {
                return $scope.datear.selectedTags.indexOf(tag) !==  -1;
            };

            $scope.datear.tagsPageChanged = function (idx) {
                var sBox = $ionicSlideBoxDelegate.$getByHandle('suggestedTags');
                $scope.datear.tagsPage = idx + 1;
                if (idx === 0) {
                    $scope.datear.suggestedTags2 = [];
                    sBox.enableSlide(false);
                }
            };

            $scope.datear.removeTag = function ( idx ) {

                $scope.datear.selectedTags.splice( idx, 1 );
            };

            $scope.datear.autocompleteTag = function ( val, callBack ) {

                Api.tag.getAutocompleteByKeyword( { q: val } ).then( function ( response ) {
                    var tags = [];
                    angular.forEach( response.suggestions, function ( item ) {
                        tags.push( item );
                    });
                    if ( callBack !== undefined ) {
                        callBack(tags);
                    }
                    //return tags;
                });
            };

            $scope.datear.doDatear = function () {

                var tags = [];

                if ($scope.datear.marker) {
                    $scope.datear.object.position = {
                        coordinates : [ $scope.datear.marker.lng, $scope.datear.marker.lat ],
                        type : 'Point'
                    };
                }else{
                    if ($scope.datear.object.position) delete $scope.datear.object.position;
                }

                angular.forEach( $scope.datear.selectedTags, function ( value, key ) {
                    tags.push( { 'tag' : value } );
                });
                $scope.datear.object.tags = tags;

                /*
                if ( $scope.datear.form.ImgUrl !== '' ) {

                    if ($scope.datear.mode === 'edit' && imageAdded) {
                        var img = {
                            image : {
                                name     : 'dateo_img',
                                data_uri : $scope.datear.form.ImgUrl
                            },
                            order : 0
                        };
                        if ($scope.datear.object.images.length) {
                            $scope.datear.object.images[0] = img;
                        }else{
                            $scope.datear.object.images = [img];
                        }
                    }else{
                        $scope.datear.object.images = [{
                            image : {
                                name     : 'dateo_img',
                                data_uri : $scope.datear.form.ImgUrl
                            },
                            order : 0
                        }];
                    }
                }*/

                if ( $scope.datear.object.tags.length === 0 ) {

                    $scope.datear.showAlert( 'Debes ingresar al menos una etiqueta.' );

                } else {
                    $ionicLoading.show(config.loadingTpl);
                   
                    if (imageUploading) {
                        savingDateo = true;
                        return;
                    };

                    /****************** POST NEW DATEO *******************/
                    if ($scope.datear.mode === 'new') {
                        Api.dateo.postDateo( $scope.datear.object ).then( function ( dateo ) {
                            $scope.datear.dateo = dateo;
                            // ADD DATEO AND TAGS TO LOADED ITEMS
                            Find.query.result.unshift(dateo);

                            var followedTags = User.data.tags_followed.map(function (t) {return t.tag;});
                            Follow.followDateo(dateo, {showLoading: false});
                            Nav.datear.newDateoId = dateo.id;

                            // check if there are tags not being followed (do not include secondary tags of campaigns)
                            var tagPool = followedTags;
                            angular.forEach(User.data.tags_followed, function (tag) {
                                if (tag.campaigns.length) {
                                    angular.forEach(tag.campaigns, function (c) {
                                        if (c.secondary_tags.length) tagPool = tagPool.concat(c.secondary_tags);
                                    });
                                }
                            });

                            var notFollowed = dateo.tags.filter(function (t) {
                                return tagPool.indexOf(t.tag) === -1;
                            });

                            if (!notFollowed.length) {
                                //$rootScope.$broadcast('map:showDateos');
                                Nav.state.go('home.dateo', {dateoId: dateo.id});
                                $ionicLoading.hide();
                            }else{
                                Nav.header.noButtons = true;
                                $scope.datear.followThisTags = notFollowed;
                                $scope.datear.followTagChecklist  = angular.copy(notFollowed);
                                $scope.datear.showDatearForm = false;
                                $scope.datear.showFollowTags = true;
                                $ionicLoading.hide();
                            }
                        }, function ( reason ) {
                            console.log( reason );
                            $ionicLoading.hide();
                            Nav.alert.checkConnection();
                        });   //*/

                    /*************** PATCH EXISTING DATEO ******************/
                    }else{
                        Api.dateo.patchDetail($scope.datear.object)
                        .then(function (dateo) {
                            $scope.datear.dateo = dateo;

                            // replace listed dateo with this one
                            for (var i=0; i<Find.query.result.length; i++ ){
                                if (Find.query.result[i].id === dateo.id) {
                                    Find.query.result[i] = dateo;
                                }
                            }

                            // check if there are tags not being followed (do not include secondary tags of campaigns)
                            var tagPool = User.data.tags_followed.map(function (t) {return t.tag;});
                            angular.forEach(User.data.tags_followed, function (tag) {
                                if (tag.campaigns.length) {
                                    angular.forEach(tag.campaigns, function (c) {
                                        if (c.secondary_tags.length) tagPool = tagPool.concat(c.secondary_tags);
                                    });
                                }
                            });

                            var notFollowed = dateo.tags.filter(function (t) {
                                return tagPool.indexOf(t.tag) === -1;
                            });

                            if (!notFollowed.length) {
                                //$rootScope.$broadcast('map:showDateos');
                                Nav.state.go('home.dateo', {dateoId: dateo.id});
                                $ionicLoading.hide();
                            }else{
                                Nav.header.noButtons = true;
                                $scope.datear.followThisTags = notFollowed;
                                $scope.datear.followTagChecklist  = angular.copy(notFollowed);
                                $scope.datear.showDatearForm = false;
                                $scope.datear.showFollowTags = true;
                                $ionicLoading.hide();
                            }
                        }, function (reason) {
                            console.log( reason );
                            $ionicLoading.hide();
                            Nav.alert.checkConnection();
                        });
                    }
                }
            };

            $scope.datear.followDateoTags = function () {
                var idx = 0;

                var callback = function (resp) {
                    console.log('follow response', resp);
                    if (idx < $scope.datear.followTagChecklist.length -1) {
                        idx++;
                        Follow.followTag( $scope.datear.followTagChecklist[idx], {
                            showLoading: false,
                            callback: callback
                        });
                    }else{
                        //$rootScope.$broadcast('map:showDateos');
                        Nav.state.go('home.dateo', {dateoId: $scope.datear.dateo.id});
                        $ionicLoading.hide();
                    }
                };

                if ($scope.datear.followTagChecklist.length) {
                    $ionicLoading.show(config.loadingTpl);
                    /*
                    User.data.tags_followed = User.data.tags_followed.concat($scope.datear.followTagChecklist);
                    // update marker with the right color
                    var followedTags = User.data.tags_followed.map(function (t) {return t.tag;});
                    Find.query.markers['m'+$scope.datear.dateo.id] = {
                        lat       : $scope.datear.dateo.position.coordinates[1],
                        lng       : $scope.datear.dateo.position.coordinates[0],
                        draggable : false,
                        icon      : Marker.createIcon($scope.datear.dateo.tags, followedTags),
                        focus     : false,
                        _id       : $scope.datear.dateo.id,
                    };*/
                    Follow.followTag($scope.datear.followTagChecklist[idx], {
                        showLoading: false,
                        callback: callback
                    });
                }else{
                    Nav.state.go('home.dateo', {dateoId: $scope.datear.dateo.id});
                }
            };

            $scope.datear.printAutocomplete = function ( val ) {

                var query = val.replace('#', '');

                var printTags = function ( tags ) {
                    if ( tags.length > 0 ) {
                       $scope.datear.showAutocomplete = true;
                       //$ionicScrollDelegate.$getByHandle('scrollAuto').scrollTo(0, 0);
                    }
                    $scope.datear.itemsAutocomplete = [];
                    angular.forEach( tags, function ( item ) {
                        $scope.datear.itemsAutocomplete.push( item );
                    });
                };

                if ( query.length >= 1 ) {
                    $scope.datear.autocompleteTag( query, printTags );
                } else {
                    $scope.datear.showAutocomplete = false;
                }
            };

            $scope.datear.selectAuto = function ( item ) {
                $scope.datear.form.nextTag = '';
                if ($scope.datear.selectedTags.indexOf(item) === -1) {
                    $scope.datear.addTag(item);
                }
                $scope.datear.showAutocomplete = false;
                try { cordova.plugins.Keyboard.close(); } catch(err) {}
                $scope.datear.editingContent = false;
            };

            $scope.datear.clearTagInput = function () {
                $scope.datear.itemsAutocomplete = [];
                $scope.datear.showAutocomplete = false;
                $scope.datear.form.nextTag = '';
                document.getElementById('datear-hashtags').focus();
            };

            /*
            $scope.expandText = function(){
                var element = document.getElementById("datear-contenido");
                if (element.scrollHeight > 198) {
                    element.style.height =  "198px";
                    element.scrollTop = element.scrollHeight;
                    if (element.classList.contains('growing')) element.classList.remove('growing');
                } else if (element.scrollHeight > 72) {
                    element.scrollTop = 0;
                    element.style.height =  element.scrollHeight + "px";
                    if (!element.classList.contains('growing')) element.classList.add('growing');
                }else{
                    element.style.height =  "72px";
                    if (!element.classList.contains('growing')) element.classList.add('growing');
                }
            };*/

            $scope.datear.editContent = function () {
                $scope.datear.editingContent = true;
                Nav.header.noButtons = true;
                $timeout(function () {
                    var contentElem = document.getElementById('datear-contenido');
                    console.log('textarea focus', contentElem);
                    contentElem.focus();
                    //try { cordova.plugins.Keyboard.show(); } catch(err) {};
                });
            };

            $scope.datear.openTagInput = function () {
                var contentElem = document.getElementById('datear-hashtags');
                $scope.datear.editingTags = true;
                $timeout(function () {
                    contentElem.focus();
                    try { cordova.plugins.Keyboard.show(); } catch(err) {}
                });
            };

            $scope.datear.toggleSuggestedExpand = function () {
              if ($scope.datear.limitSuggested === $scope.datear.maxSuggested) {
                $scope.datear.limitSuggested = $scope.datear.suggestedTags.length;
              }else{
                $scope.datear.limitSuggested = $scope.datear.maxSuggested;
              }
              $ionicScrollDelegate.$getByHandle('datear-form-modal').resize();
            };

            $scope.datear.closeKeyboard = function () {
                try { cordova.plugins.Keyboard.close(); } catch(err) {}
                $scope.datear.editingContent = false;
                Nav.header.noButtons = false;
            };

            $scope.datear.closeTagEdit = function () {
                try { cordova.plugins.Keyboard.close(); } catch(err) {}
                $scope.datear.editingTags = false;
            };

            $scope.$on('keyboard:show', function (e, args) {
                $scope.datear.keyboardOpen = true;
                $scope.datear.keyboardHeight = args.keyboardHeight;
                $scope.datear.containerStyle = {bottom: args.keyboardHeight+'px'};
                /*if (document.getElementById('datear-hashtags') === document.activeElement) {
                    $ionicScrollDelegate.$getByHandle('datear-form-modal').scrollBottom();
                }*/
                console.log('kb show', args.keyboardHeight);
            });

            $scope.$on('keyboard:hide', function () {
                $scope.datear.keyboardOpen = false;
                $scope.datear.keyboardHeight = 0;
                $scope.datear.editingContent = false;
                $scope.datear.editingTags = false;
                $scope.datear.containerStyle = null;
                $scope.datear.itemsAutocomplete = [];
                $scope.datear.showAutocomplete = false;
                Nav.header.noButtons = false;
                console.log('kb hide');
            });

        }
    ]);
