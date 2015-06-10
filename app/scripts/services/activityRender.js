'use strict';

angular.module('dateaMobileApp')
.service('ActivityRender', ['config', 'User', '$interpolate', function ActivityUrl(config, User, $interpolate) {
	var renderTitle
		, renderTags
		, getUrl
		;

	renderTags = function (data) {
		var result = 'en #'+data.tags.slice(0,2).join(', #');
		result = data.tags.length > 2 ? result + '...' : result;
		return result;
	};

	renderTitle = function (data) {
		var title, mode;

		if (User.isSignedIn()) {
			if (data.actor_id === User.data.id) {
				mode = 'byUser';
			} else if (data.receptor_id && data.receptor_id === User.data.id) {
				mode = 'onUser';
			}
		}
		if (!mode) mode = 'anyUser';

		data.tags = renderTags(data);
		title = $interpolate( config.activity.titleTpl[mode][ data.verb ] )(data);

		return title;
	};

	getUrl = function (data) {
    var url;
    switch (data.verb) {
        case 'dateo':
            url = 'home/dateo/' + data.action_id;
            break;

        case 'commented':
            url = 'home/dateo/' + data.target_id;
            break;

        case 'voted':
            url = '/home/dateo/' + data.target_id;
            break;

        case 'redateo':
            url = 'home/dateo/' + data.target_id;
            break;

        case 'campaign':
            url = 'home/tags/campaignsTab/' + data.action_id;
            break;

        default:
            url = '/';
    }
    return url;
	};

	return {
		getTitle : renderTitle,
		getUrl   : getUrl
	};
} ] );
