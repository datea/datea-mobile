'use strict';

angular.module('dateaMobileApp')
	.service('Find', ['$rootScope', '$q', 'Api', 'User', '$location', 'leafletData', '$interval', 'config', 'Marker', '$http',
		function ($rootScope, $q, Api, User, $location, leafletData, $interval, config, Marker, $http) {

  		var query = {},
          user  = {},
          utils = {};

      query.invalidateInterval = null;

      query.init = function () {
        query.inputSearch = '';
        query.filter      = User.data.tags_followed.length ? 'follow' : 'all';
        query.params      = {};
        query.result      = [];
        query.dateos      = [];
        query.markers     = {};
        query.searchedBounds = null;
        query.searchStarting = true;
      };

      query.init();

      query.buildParams = function () {
          var params = {};

          switch (query.filter) {
              case 'follow':
                  params.followed_by_tags = User.data.id;
                  params.tag_operator = 'or';
                  break;
              case 'own':
                  params.user_id = User.data.id;
                  break;
          }

          if (query.inputSearch !== '') {
              params.q = query.inputSearch;
          }

          params.limit = 100;
          params.order_by = '-created';
          return params;
      };

      query.resultDuplicate = function (dateo) {
          for ( var i=0; i < this.result.length; i++ ) {
              if ( dateo.id === this.result[i].id ) { return true; }
          }
          return false;
      };

      utils.getBoundsAtZoom = function(map, refZoom) {

          var bounds = map.getBounds();
          var currentZoom = map.getZoom();
          var center = map.getCenter();
          var NE = bounds.getNorthEast();
          //var SW = bounds.getSouthWest();

          //var w = Math.abs(NE.lng - SW.lng);
          //var h = Math.abs(SW.lat - NE.lat);
          var delta = currentZoom - refZoom;

          // get unit vector and magnitude
          var vector = [NE.lng - center.lng, NE.lat - center.lat];
          var vMag   = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
          var vUnit  = [vector[0]/vMag, vector[1]/vMag];

          var newNE = L.latLng(center.lat + (vUnit[1] * vMag * Math.pow(2, delta)), center.lng + (vUnit[0] * vMag * Math.pow(2, delta)));
          var newSW = L.latLng(center.lat - (vUnit[1] * vMag * Math.pow(2, delta)), center.lng - (vUnit[0] * vMag * Math.pow(2, delta)));

          return L.latLngBounds(newSW, newNE);
      };

      utils.processDateoResults = function (response) {
        var followedTags = User.data.tags_followed.map(function (t) {return t.tag;});
        angular.forEach(response.objects, function(dateo) {
          /* check this stuff if clustering
          tags = value.tags && value.tags.map(function(t) {return t.tag}) || []
          */
          if (!query.resultDuplicate(dateo)) {
            if (dateo.position) {
              query.markers['m'+dateo.id] = Marker.createMarker(dateo, followedTags);
            }
            query.result.push(dateo);
          }
        });
      };

      utils.startInvalidateInterval = function () {
          $interval(function () {
              if (query.invalidateInterval) {
                $interval.cancel(query.invalidateInterval);
              }
              $interval(function () {
                  query.searchedBounds = null;
              }, 1000*60*15);
          });
      };

      query.startSearch = function (args) {

          if (typeof(args) === 'undefined') { args = {}; }

          query.searchStarting = true;

          if (!args.mode || args.mode === 'map') {

              utils.startInvalidateInterval();
              query.result  = [];
              query.markers = {};

              leafletData.getMap('leafletHomeSI')
              .then(function (map) {

                  if (args.center) {
                      var center = args.center;
                      map.setView(center, config.query.initViewZoom);
                  }else{
                      if (map.getZoom() < config.query.initQueryZoom) map.setZoom(config.query.initQueryZoom);
                      var center = map.getCenter();
                  }

                  // GET BOUNDS FOR QUERY ON THIS AREA AT CERTAIN ZOOM
                  var queryBounds = utils.getBoundsAtZoom(map, config.query.initQueryZoom);
                  //L.rectangle(queryBounds).addTo(map);
                  // init searched bounds (to see if we have to reload the search)
                  var params = query.buildParams();

                  // 1. First query uses bounds
                  params.bottom_left_latitude  = queryBounds.getSouthWest().lat;
                  params.bottom_left_longitude = queryBounds.getSouthWest().lng;
                  params.top_right_latitude    = queryBounds.getNorthEast().lat;
                  params.top_right_longitude   = queryBounds.getNorthEast().lng;

                  Api.dateo.getDateos(params)
                  .then(function(response) {

                      if ( response.objects.length > 0 ) {
                          //console.log('resultados en primera', response.objects.length);
                          map.setZoom(config.query.initQueryZoom);
                          utils.processDateoResults(response);
                          query.searchedBounds = queryBounds;
                          query.searchStarting = false;
                          if (args.callback) args.callback();
                      }else{
                          // If no results using the first option, do 2nd query with order by distance
                          var params = query.buildParams();
                          params.order_by = 'distance';
                          params.position = center.lat+','+center.lng;

                          Api.dateo.getDateos(params)
                          .then(function (response) {
                              if (response.objects.length > 0) {
                                  // -> fit bounds in this case
                                  //console.log('resultados en segunda', response.objects.length);
                                  query.searchedBounds = queryBounds;
                                  utils.processDateoResults(response);
                                  query.searchStarting = false;
                                  var bounds = [];
                                  for (var i in query.markers) {
                                      bounds.push([query.markers[i].lat, query.markers[i].lng]);
                                  }
                                  map.fitBounds(bounds);
                              }
                              if (args.callback) args.callback();
                          }, function (error) {
                              console.log('start query error 2', error);
                              if (args.onError) args.onError();
                          });
                      }
                  }, function (error) {
                      console.log('start query error 1', error);
                      if (args.onError) args.onError();
                  });
              });

          // LIST MODE !
          }else{
              var params = query.buildParams();
              Api.dateo.getDateos(params)
              .then(function(response) {
                  query.result = response.objects;
                  if (args.callback) args.callback();
                  query.searchStarting = false;
              }, function (error) {
                  console.log('list query error', error);
                  if (args.onError) args.onError();
              });
          }
      };

      // to update search when changing position
      query.updateGeoSearch = function (args) {

          if (typeof(args) === 'undefined') { args = {}; }

          if (!query.searchStarting) {
              leafletData.getMap('leafletHomeSI')
              .then(function (map) {
                  var zoom = map.getZoom();
                  var bounds = map.getBounds();
                  if (zoom >= config.query.minQueryZoom) {
                      if (!query.searchedBounds || !query.searchedBounds.contains(bounds)) {
                          //console.log("update search!");
                          var params = query.buildParams();
                          if (zoom > config.query.initQueryZoom) {
                              var queryBounds = utils.getBoundsAtZoom(map, config.query.initQueryZoom);
                          }else{
                              var queryBounds = bounds;
                          }
                          // query uses bounds
                          params.bottom_left_latitude  = queryBounds.getSouthWest().lat;
                          params.bottom_left_longitude = queryBounds.getSouthWest().lng;
                          params.top_right_latitude    = queryBounds.getNorthEast().lat;
                          params.top_right_longitude   = queryBounds.getNorthEast().lng;

                          if (args.callbefore) args.callbefore();

                          Api.dateo.getDateos(params)
                          .then(function (response) {
                              if (response.objects.length > 0) utils.processDateoResults(response);
                              if (query.searchedBounds) {
                                  query.searchedBounds.extend(queryBounds);
                              }else{
                                  query.searchedBounds = queryBounds;
                              }
                              if (args.callback) args.callback();
                          }, function (error) {
                              console.log(error);
                              if (args.onError) args.onError();
                          });
                      }
                  }
              });
          }
      };

      query.geolocateAndStartSearch = function (args) {

          if (typeof(args) === 'undefined') { args = {}; }

          // 1. GET POSITION
          navigator.geolocation.getCurrentPosition(function(pos) {
              args.center = L.latLng(pos.coords.latitude, pos.coords.longitude);
              query.startSearch(args);
          }
          // on error -> use ip location or default position
          ,  function () {
              // get ip location
              $http({
                    method : 'GET'
                  , url    : config.api.url + 'ip_location'
              }).success(function (data) {
                  args.center = L.latLng(data.ip_location.latitude, data.ip_location.longitude);
                  query.startSearch(args);
              }).error( function () {
                  // if no ip_location then start with default location
                  args.center = L.latLng(-12.035, -77.018611);
                  query.startSearch(args);
              });

          }, { maximumAge: 30000, timeout: 10000, enableHighAccuracy: false} );
      };

      return  {
          query  : query,
          user   : user,
      };
		}
	]);


/* COMO DEBERIA SER EL QUERY PARA MAPAS Y DATEOS

    1. En la primera vez que hace una busqueda:
        - colocar el mapa sobre la posicion actual a un zoom cercano.
        - agrandar y utilizar esos bounds para hacer un query sobre la zona
        - si hay resultados, pero no en el recuadro del mapa, hacer fitbounds.

        - si encuentra nada, hacer segundo query, ordenando segun distancia y tiempo hacia donde estoy y hacer fitbounds.

        - grabar los bounds expandidos de donde estoy.

    2. Cada vez que se mueve el mapa:
        - chequear, segun el zoom, si esta por encima de 10 o 12, entonces
        - hacer query con los bounds actuales del mapa, extendidos en un porcentaje segun el zoom (mas zoom, mas extension)

    3. cada cierto tiempo, pej 30m, invalidar todos los bounds y empezar de zero



*/
