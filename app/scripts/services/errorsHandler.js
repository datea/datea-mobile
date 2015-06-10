'use strict';

angular.module('dateaMobileApp')
	.service('Errors', ['$location', '$ionicPopup',
		function ( $location, $ionicPopup) {

    	//function ($scope, $element, $attrs) {

    	var errors = {};

			errors.messages = {
				400 : {
					0 : ['Duplicate email', 'Ya existe un usuario con ese correo'],
					1 : ['Duplicate username', 'Ya existe ese nombre de usuario'],
					2 : ['Password too weak', 'La contraseña es muy débil'],
					3 : ['No user with that email', 'No hay dateros con ese correo'],
					4 : ['oauth_token and oauth_token_secret not provided', 'oauth_token and oauth_token_secret not provided'], // (twitter)
					5 : ['access_token not provided', 'access_token not provided'], // (facebook and other oauth2 clients)
					6 : ['Username cannot be empty', 'El nombre de usuario no puede estar vacio'],
					7 : ['Not a valid email address', 'El email no es válido']
				},

				401 : {
					0 : ['Wrong username or password', 'Usuario o contraseña incorrectos'],
					1 : ['Account disabled', 'Cuenta desactivada'],
					2 : ['Invalid reset link', 'Enlace invalido para reestablecer'], //(reset password)
					3 : ['Social access could not be verified', 'La cuenta de red social no se pudo verificar']
				},

				404 : {
					0 : ['User not found', 'No hay dateros con ese usuario']
				}
			};

			errors.processData = function ( status, content ) {

				console.log(status, content);

				var message = '',
					current;

				for ( var i = 0, len = Object.keys( errors.messages[status] ).length; i < len; i++ ) {

					current = errors.messages[status][i];

					if ( content === current[0] ) {
						message = current[1];
						break;
					}
				}

				return message;
			};

  		errors.show = function ( error ) {

  			var data = error.data;

  			var msgPopup = errors.processData( data.status, data.error );

  			var alertPopup = $ionicPopup.alert({
			    title: 'Mensaje de Error',
			    template: msgPopup,
			    okText: 'OK',
			    okType: 'button-assertive'
			  });
  		};

			return errors;
		}
	]);
