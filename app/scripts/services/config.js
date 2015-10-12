'use strict';

angular
    .module('dateaMobileApp')
    .constant('config', {
        app: {
            name: 'Datea.pe',
            url: 'http://localhost:9000/#/'
        },

        api: {
            url: 'https://api.datea.io/api/v2/',
            imgUrl: 'https://api.datea.io'
            //url: 'http://127.0.0.1:8000/api/v2/',
            //imgUrl : 'http://127.0.0.1:8000'
        },

        dateo : {
            sizeImgMax : 350000,
            sizeImgMaxMsg : 'Su archivo es muy grande',
            notFoundMsg: 'No se encontro dateos con esta(s) etiqueta(s)',
            tagsMax : 7
        },

        defaultMap: {
            bounds : [ [ -12.0735, -77.0336 ], [ -12.0829, -77.0467 ] ],
            center : {
                lat: -12.05,
                lng: -77.06,
                zoom: 16
            },
            defaults : {
                //scrollWheelZoom: false,
                //zoomControl: false,
                tap: true,

            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        type: 'xyz',
                        url : 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', //'http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png',
                        layerOptions: {
                            subdomains: ['otile1','otile2','otile3','otile4'],
                            attribution: 'Tiles by <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                            //attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            continuousWorld: true
                        }
                        /*url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "layerParams": {},
                        "layerOptions": {}*/
                    },
                },
                overlays : {
                    dateos: {
                        name: 'Dateos',
                        type: 'markercluster',
                        visible: true,
                        layerOptions: {
                            chunkedLoading : true,
                            showCoverageOnHover: false,
                            spiderfyDistanceMultiplier: 1.5,
                            iconCreateFunction: function (cluster) {
                                var childCount = cluster.getChildCount();

                                var c = ' marker-cluster-';
                                var size;
                                if (childCount < 10) {
                                    c += 'small';
                                    size = L.point(56,56);
                                } else if (childCount < 100) {
                                    c += 'medium';
                                    size = L.point(64,64);
                                } else {
                                    c += 'large';
                                    size = L.point(72,72);
                                }

                                return new L.DivIcon({ html: '<div><span class="count">' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: size });
                            }
                        }
                    }
                }
            },
            markers : {}
        },

        query: {
            initQueryZoom: 13,
            initViewZoom: 15,
            minQueryZoom: 11,
            noSearchMsg : 'no se actualiza a esta altura'
        },

        defaultBoundsRatio : +0.0075,

        defaultDateFormat : 'd \'de\' MMMM yyyy - H:mm',

        homeSI: {
            campaignsOffset: 6,
            paginationLimit: 6,
            mapZoomOverride: 16,
        },

        profile : {
            dateosOffset    : 10,
            campaignsOffset : 10,
            paginationLimit : 10,
            defaultImg      : 'images/user-default.png',
        },

        campaign: {
            mapZoomFocus: 16,
            defaultImage: 'images/iniciativa-default-sm.png'
        },

        activity : {
            titleTpl : {  onUser :  { 'dateo'     : '{{actor}} dateó {{tags}}'
                                    , 'commented' : '{{actor}} comentó tu dateo {{tags}}'
                                    , 'voted'     : '{{actor}} apoyó tu dateo {{tags}}'
                                    , 'redateo'   : '{{actor}} redateó tu dateo {{tags}}'
                                    }
                        , byUser :  { 'dateo'     : 'dateaste {{tags}}'
                                    , 'commented' : 'comentaste el dateo de {{receptor}} {{tags}}'
                                    , 'voted'     : 'apoyaste el dateo de {{receptor}} {{tags}}'
                                    , 'redateo'   : 'redateaste a {{receptor}} {{tags}}'
                                    , 'campaign'  : 'creaste una iniciativa {{tags}}'
                                    }
                        , anyUser : { 'dateo'     : '{{actor}} dateó {{tags}}'
                                    , 'commented' : '{{actor}} comentó dateo de {{receptor}} {{tags}}'
                                    , 'voted'     : '{{actor}} apoyó dateo de {{receptor}} {{tags}}'
                                    , 'redateo'   : '{{actor}} redateó a {{receptor}} {{tags}}'
                                    , 'campaign'  : '{{actor}} creó una iniciativa {{tags}}'
                                    }
                         }
        },

        accountMsgs : {
            userBannedMsg         : 'Tu usuario ha sido bloqueado. Si piensas que esto es injusto, por favor comunicate con nosotros a traves de nuestro <a href="http://ayuda.datea.pe/contacto">formulario de contacto</a>.',
            userWelcomeReadyMsg   : 'Tu cuenta ha sido activada y ya estás listo(a) para datear. Si quieres, antes puedes hacer ajustes a la configuración de tu usuario acá abajo.',
            userWelcomeConfirmMsg : 'Ya casi eres datero(a)! Falta que nos confirmes tu dirección de correo (Twitter no nos provee ese dato). Una vez confirmada tu cuenta estarás listo(a) para datear.',
            duplicateEmailMsg     : 'La dirección de correo ya existe. Por favor utiliza otra, o si no recuerdas tu usuario, puedes salir y recuperar tu clave. Si ingresaste con otro servico (Facebook), por favor vuelve a ingresar con ese servicio.',
            duplicateUsernameMsg  : 'El nombre de usuario ya existe. Por favor, elige otro.',
            checkEmailMsg         : '¡Gracias! Ahora revisa tu correo y sigue las instrucciones para activar tu cuenta. Si deseas, puedes cerrar esta ventana.',
            userConfirmEmailMsg   : 'Antes de poder datear, necesitamos verificar tu dirección de correo. Ingrésala aquí abajo. ¡Gracias!',
            userConfirmMissingMsg : 'Falta que nos confirmes tu correo para activar tu cuenta. Por favor, chequea tu correo y sigue las instrucciones que te enviamos. Si deseas recibir otro correo de activación, vuelve a cliquear en "Enviar". ¡Gracias!',
            userConfirmSuccessMsg : 'Tu cuenta ha sido plenamente activada y estas listo(a) para datear. Si deseas, puedes antes hacer ajustes a tu cuenta acá abajo.',
            registerActivationCompleteMsg : 'Tu cuenta ha sido activada. Ahora puedes ingresar con tu usuario y contraseña.',
            PasswdResetEmailMsg   : 'Por favor revisa tu correo y sigue las instrucciones para recuperar tu contraseña.',
            PasswdResetNotFoundMsg: 'No existen dateros con esa dirección ;)'
        },

        loadingTpl : {
            template     : '<div class="loading-icon"></div>',
            animation    : 'fade-in',
            showBackdrop : true,
            showDelay    : 0
        }

});
