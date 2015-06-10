'use strict';

angular.module('dateaMobileApp')
	.factory('Nav', [ '$state', '$timeout', '$ionicPlatform', '$ionicPopup', function State($state, $timeout, $ionicPlatform, $ionicPopup) {

		var nav = {
			  header: {
				  visible      : false
				, showBackBtn  : false
				, backFunc     : null
				, backBtnLabel : ''
				, showSearch   : true
				, setBackBtn   : function (visible) {
						this.showBackBtn = visible;
					}
				, setBackFunc : function (func) {
						this.backFunc = func;
				}
				, goBack       : function () {
						if (this.backFunc) {
							this.backFunc();
							this.backFunc = null;
						} else if ($state.current.name !== '' && $state.current.name !== 'home') {
							$state.go('^');
						}
						var that = this;
						$timeout(function () {
								that.backBtnLabel = '';
						}, 500);

						// ionic.Platform.exitApp();
					}
				}
			, search : {
				visible: true
			}
			, map : {
				  translate : false
				, datearTranslate: false
			}
			, vis : {
				current : 'map'
			}
			, pages : {
				show : false
			}
			, campaign : {
				detail: null
			}
			, reduceMap: function (val) {
					this.search.visible      = !val;
					this.map.translate       = val;
					this.map.datearTranslate = false;
			}
			, datearMap: function(val) {
				this.search.visible      = !val;
				this.map.translate       = false;
				this.map.datearTranslate = val;
			}
			, state  : $state
			, datear : {
				withTag    : null,
				newDateoId : null,
				editDateo  : null
			}
			, follow : {
				tag : null
			}
			, alert : {
				checkConnection : function () {
					$ionicPopup.alert({
						title: 'Algo salió mal :/',
						template: '<i class="icon ion-radio-waves"></i> Porfa, revisa tu conexión e intenta de nuevo.',
						okType: 'button-dark',
					});
				}
			}
		};

		$ionicPlatform.ready(function () {
			$ionicPlatform.registerBackButtonAction(function () {
				console.log('on onHardwareBackButton');
				nav.header.goBack();
			}, 100);
		});

		return nav;
	} ] );
