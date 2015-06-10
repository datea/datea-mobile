'use strict';

angular.module('dateaMobileApp')
.service('Follow', ['Api', 'User', '$location', 'Find', '$ionicLoading', 'config', '$rootScope', 'Nav',
function (Api, User, $location, Find, $ionicLoading, config, $rootScope, Nav) {

	var follow = {};
	follow.dateoFollowing = [];

	follow.init = function () {
		Api.follow
	   .getFollows({ user: User.data.id, content_type: 'dateo' }).then( function (response) {
			follow.dateoFollowing = response.objects;
		}, function (reason) {
			console.log(reason);
		});
	};

	follow.followTag = function (tag, opts) {

		var showLoading = opts && opts.showLoading ? opts.showLoading : true;
		showLoading && $ionicLoading.show(config.loadingTpl);

	  	Api.follow.doFollow({ follow_key: 'tag.'+tag.id }).then( function ( response ) {
	  		console.log('follow response', response);
  			var updateQuery = Find.query.filter === 'follow' || (Find.query.filter === 'all' && User.data.tags_followed.length === 0);
			User.data.tags_followed.push(tag);
			if (updateQuery) {
            	if (Find.query.filter === 'all') Find.query.filter = 'follow';
            	$rootScope.$broadcast('query:updated', {silent: true});
       	 	}
       	 	User.updateUserDataFromApi();
			showLoading && $ionicLoading.hide();
			if (opts && opts.callback) opts.callback(response);

		}, function ( reason ) {
			showLoading && $ionicLoading.hide();
			console.log( reason );
			User.updateUserDataFromApi();
		});
	};

	follow.unfollowTag = function (tag, opts) {
		var showLoading = opts && opts.showLoading ? opts.showLoading : true;
		showLoading && $ionicLoading.show(config.loadingTpl);

  	Api.follow.doUnfollow({ user: User.data.id, follow_key: 'tag.'+tag.id })
    .then( function ( response ) {
  		var updateQuery = Find.query.filter === 'follow';
  		User.data.tags_followed = User.data.tags_followed.filter(function(t){ return t.id !==tag.id;});
  		User.updateUserDataFromApi();
  		updateQuery && $rootScope.$broadcast('query:updated', {silent: true});

  		showLoading && $ionicLoading.hide();
  		if (opts && opts.callback) opts.callback(response);

		}, function ( reason ) {
			showLoading && $ionicLoading.hide();
			console.log( reason );
			User.updateUserDataFromApi();
		});
	};

	follow.followDateo = function (dateo, opts) {
		var showLoading = opts && opts.showLoading ? opts.showLoading : true;
		showLoading && $ionicLoading.show(config.loadingTpl);

  	Api.follow.doFollow({ follow_key: 'dateo.'+dateo.id })
    .then( function ( response ) {
		  follow.dateoFollowing.push(response);
      follow.init();
      showLoading && $ionicLoading.hide();
		  if (opts && opts.callback) opts.callback(response);
    }, function (reason) {
    	showLoading && $ionicLoading.hide();
		  console.log( reason );
    	follow.init();
    	Nav.alert.checkConnection();
    });
	};


	follow.unfollowDateo = function (dateo, opts) {
		var showLoading = opts && opts.showLoading ? opts.showLoading : true;
		showLoading && $ionicLoading.show(config.loadingTpl);

    Api.follow.doUnfollow({ user: User.data.id, follow_key: 'dateo.'+dateo.id })
    .then( function ( response ) {
    	follow.dateoFollowing = follow.dateoFollowing.filter(function (f) { return f.object_id !==dateo.id; });
    	follow.init();
			showLoading && $ionicLoading.hide();
			if (opts && opts.callback) opts.callback(response);
		}, function ( reason ) {
			showLoading && $ionicLoading.hide();
			console.log( reason );
			follow.init();
		});
	};


	follow.isFollowingTag = function (tag) {
		return !!User.data.tags_followed.filter(function (t) {return t.id === tag.id; }).length;
	};

	follow.isFollowingDateo = function (dateo) {
		return !!follow.dateoFollowing.filter(function (f) {return f.object_id === dateo.id; }).length;
	};

	follow.init();

	return follow;

} ] );

