'use strict';

angular.module('dateaMobileApp')
    .factory('Marker', [function () {
    	var marker = {};

			marker.colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

			marker.defaultIcon = {
            	iconUrl: 'images/markers/marker-color-01.png',
            	iconSize: [45, 62],
            	iconAnchor: [22, 60],
        	};

    	marker.createIcon = function (tags, tagReference) {

	    	if (typeof(tags) === 'undefined' || !tags.length || typeof(tagReference) === 'undefined' || !tagReference.length) return this.defaultIcon;
				var html      = ''
					, visTags = []
					, sectionWidth
				;

				// filter relevant tags and keep color index
				for (var i=0; i<tags.length; i++) {
					var tag = typeof(tags[i]) === 'object' ? tags[i].tag : tags[i];
					var idx = tagReference.indexOf(tag);
					idx = idx > 19 ? idx % 19 : idx; // we only have 19 colors at the moment (should be enough!)
					if (idx !== -1) visTags.push(idx);
				}
				if (!visTags.length) return this.defaultIcon;

				sectionWidth = this.defaultIcon.iconSize[0] / visTags.length;

				for (var k=0; k<visTags.length; k++) {
					html += '<div class="marker-'+(visTags[k]+1)+' marker-inner" style="width: '+sectionWidth+'px; left: '+(sectionWidth*k)+'px; background-position: -'+(sectionWidth*k)+'px 0"></div>';
				}

				return {
					  type        : 'div'
					, iconSize    : [45, 62]
					, iconAnchor  : [22, 59]
					, html        : html
					, className   : 'datea-pin-icon'
				};
    	};

    	marker.createMarker = function(dateo, tagReference) {

			return {
				  lat         : dateo.position.coordinates[1]
				, lng         : dateo.position.coordinates[0]
				, draggable   : false
				, focus       : false
				, _id         : dateo.id
				, icon 		  : this.createIcon(dateo.tags, tagReference)
				, layer       : 'dateos'
			};
		};

		return marker;

    } ] );
