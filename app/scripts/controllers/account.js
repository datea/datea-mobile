'use strict';

angular.module('dateaMobileApp').controller('AccountCtrl', ['$scope', '$location', '$ionicLoading', '$ionicPopup', 'User', 'config', 'Api', 'Nav', '$timeout', '$rootScope',
    function($scope, $location, $ionicLoading, $ionicPopup, User, config, Api, Nav, $timeout, $rootScope) {

        $scope.account = User.data;
        $scope.flow = {};
        $scope.flow.isNewUser = User.isNew();
        $scope.flow.showEditPage = true;


        if (Nav.state.current.name !== 'accountInit') {
            Nav.header.setBackFunc(function () {
              $scope.flow.showEditPage = false;
              Nav.pages.show = false;
              Nav.reduceMap(false);
              $timeout(function () { Nav.state.go('home');}, 180);
            });
        }

        /*  Only Cordova mode  */
        var inputImgUrl = '';

        //Get Image
        var getPicture = function(source) {

            function onSuccess(imageData) {
                var image = document.getElementById('myImage');
                image.src = 'data:image/jpeg;base64,' + imageData;
                inputImgUrl = 'data:image/jpeg;base64,' + imageData;

                //console.log(inputImgUrl);
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }

            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 70,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1024,
                targetHeight: 1024,
                allowEdit: true,
                sourceType: Camera.PictureSourceType[source],
                destinationType: Camera.DestinationType.DATA_URL
            });
        };

        $scope.account.showConfirm = function() {

            // A confirm dialog
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cambiar imágen de perfil',
                //template: 'Datear con Imagen',
                cancelText: 'Elegir existente',
                cancelType: 'button-dark',
                okText: 'Tomar foto',
                okType: 'button-dark',
            });

            confirmPopup.then(function(res) {
                if (res) {
                   getPicture('CAMERA');
                } else {
                   getPicture('PHOTOLIBRARY');
                }
            });
        };

        $scope.loadingShow = function() {

            $ionicLoading.show(config.loadingTpl);
        };

        $scope.loadingHide = function() {

            $ionicLoading.hide();
        };

        $scope.account.save = function() {
            var data = {};
            /*  Show Loading  */
            $scope.loadingShow();

            data.username  = $scope.account.username;
            data.email     = $scope.account.email;
            data.full_name = $scope.account.full_name;

            // Image profile save
            if (inputImgUrl !== '') {
                data.image = {
                    image: {
                        data_uri: (inputImgUrl).toString(),
                        name: 'profile_image.jpeg'
                    }
                };
            }
            // end Image save
            data.id = User.data.id;
            data.success_redirect_url = config.app.url + 'updateUser';
            data.error_redirect_url = config.app.url;

            User.updateTokenOnTwitterSignup();

            User.updateUser(data)
            .then(function(response) {
                console.log(response);
                /* Close Loading */
                $scope.loadingHide();

                if (Nav.state.current.name === 'accountInit') {
                    Nav.state.go('home.intro');
                } else {
                    Nav.header.goBack();
                }

            }, function(reason) {
                /* Close Loading */
                $scope.loadingHide();
                Nav.alert.checkConnection();
                console.log(reason);
            });
        };

        $scope.$on('keyboard:show', function (e, args) {
            $scope.flow.containerStyle = {bottom: args.keyboardHeight+'px'};
        });

        $scope.$on('keyboard:hide', function (e) {
            $scope.flow.containerStyle = null;
        });

    }
]);
