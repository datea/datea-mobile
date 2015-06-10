'use strict';

angular.module('dateaMobileApp')
.factory('Notifications', [ 'Api', 'User', 'config', 'ActivityRender', function State(Api, User, config, ActivityRender) {

	var notify = {
		result   : [],
		total    : 0,
		unread   : [],
		unreadCount : 0,
		offset: 0,
		limit : 15
	};

	function renderAct(act) {
		act.title = ActivityRender.getTitle(act.data);
		act.url = ActivityRender.getUrl(act.data);
		return act;
	}

	notify.loadUnread = function(params, callback) {

		if (typeof(params) === 'undefined') {
			params = {};
		}
		params.recipient = User.data.id;
		params.unread = true;
		params.limit  = params.limit || 15;
		params.mode = 'not-actor';

		Api.notification.getList(params)
		.then(function (result) {
			notify.unreadCount = result.meta.total_count;
			notify.unread      = result.objects.map(renderAct);
			if (typeof(callback) !== 'undefined') callback();
		});
	};

	notify.load = function (params, callback) {
		this.offset = 0;
		if (typeof(params) === 'undefined') {
			params = {};
		}
		params.recipient = User.data.id;
		params.limit  = params.limit || this.limit;
		params.mode = 'not-actor';

		Api.notification.getList(params)
		.then(function (result) {
			notify.total  = result.meta.total_count;
			notify.result = result.objects.map(renderAct);
			if (typeof(callback) !== 'undefined') callback();
		});
	};

	notify.loadMore = function (params, callback) {
		this.offset++;
		if (typeof(params) === 'undefined') {
			params = {};
		}
		params.recipient = User.data.id;
		params.limit  = params.limit || this.limit;
		params.offset = this.offset * params.limit;
		params.mode = 'not-actor';

		Api.notification.getList(params)
		.then(function (result) {
			notify.result = notify.result.concat(result.objects.map(renderAct));
			if (typeof(callback) !== 'undefined') callback();
		});
	};

	notify.readAll = function() {
		var params = {recipient : User.data.id};
		Api.notification.readAll(params).
		then(function () {
			notify.unread = [];
			notify.unreadCount = 0;
		}, function (error) {
			console.log('notify read all error', error);
		});
	};

	return notify;
} ] );
