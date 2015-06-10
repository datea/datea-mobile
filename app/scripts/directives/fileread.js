'use strict';

angular.module('dateaMobileApp')
    .directive('fileread', [
        '$rootScope', 'config',
        function(
            $rootScope, config
        ) {
            return {
                scope: {
                    fileread: '=',
                    filedata: '='
                },
                link: function(scope, element, attributes) {
                    element.bind("change", function(changeEvent) {
                        var reader = new FileReader();
                        reader.onload = function(loadEvent) {
                            scope.$apply(function() {
                                scope.fileread = loadEvent.target.result;
                                scope.filedata = changeEvent.target.files[0];
                                $rootScope.$broadcast('dateo:imgLoaded', {
                                    data: changeEvent.target.files[0]
                                });
                            });
                        };
                        reader.readAsDataURL(changeEvent.target.files[0]);
                    });
                }
            };
        }
    ]);
