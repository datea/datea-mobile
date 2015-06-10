'use strict';

angular
    .module('wxGlobalErrors', [])
    .constant('wording', {
        'http200': 'Genial. ',
        'http400': 'Email duplicado',
        'http401': 'Nombre de Usuario o Password inválido. ',
        'http403': 'Usuario no autorizado. ',
        'http500': 'Error de servidor. ',
        'default': 'Hubo un error. '
    })
    .config(
        ['$provide', '$httpProvider', '$compileProvider',
            function(
                $provide, $httpProvider, $compileProvider
            ) {
                //var elementsList = $();

                var showMessage = function(content, cl, time) {

                    var timeAlert = setTimeout(function() {

                        console.log(content);
                    }, 100);
                };

                $httpProvider.responseInterceptors.push(['$timeout', '$q', '$rootScope', 'wording',
                    function($timeout, $q, $rootScope, wording) {
                        return function(promise) {
                            return promise.then(function(successResponse) {
                                if (successResponse.config.method.toUpperCase() !== 'GET') {
                                    showMessage(wording.http200, 'alert-success', 1000);
                                }
                                return successResponse;

                            }, function(errorResponse) {

                                console.log(errorResponse);
                                // tell your app
                                // $rootScope.$broadcast( 'error:someError' );
                                if (errorResponse.status === '400') {
                                    showMessage(wording.http400, 'alert-danger', 10000);
                                } else if (errorResponse.status === '401') {
                                    showMessage(wording.http401, 'alert-danger', 10000);
                                } else if (errorResponse.status === '403') {
                                    showMessage(wording.http403, 'alert-danger', 10000);
                                } else if (errorResponse.status === '500') {
                                    showMessage(wording.http500, 'alert-danger', 10000);
                                } else {
                                    showMessage(wording.
                                        default +errorResponse.status + ': ' + errorResponse.data.error, 'alert-danger', 10000);
                                }
                                return $q.reject(errorResponse);
                            });
                        };
                    }
                ]);

                $compileProvider.directive('appMessages', function() {
                    var directiveDefinitionObject = {
                        link: function(scope, element, attrs) {
                            //elementsList.push($(element));
                        }
                    };
                    return directiveDefinitionObject;
                });

            }
        ]);
