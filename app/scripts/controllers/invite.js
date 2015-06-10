'use strict';

angular.module('dateaMobileApp')
.controller('InviteCtrl', ['$scope', 'User', '$timeout', 'Nav',
function( $scope, User, $timeout, Nav ) {

  $scope.flow = {};

  var backFunc = function () {
    $scope.flow.hidePage = true;
    Nav.reduceMap(false);
    $timeout(function () {
      Nav.state.go('^');
    }, 180);
  };

  Nav.header.setBackFunc(backFunc);

  $scope.flow.openShare = function( dateo ) {

      var title, message, image, link;

      title   = '¡Todos somos dateros!';
      message = 'Hola, estoy usando Datea, dateando info útil para la comunidad. Mira mis dateos http://datea.pe/'+User.data.username+', bájate el app http://bit.ly/1FUBeIx';
      link    = 'http://datea.pe';

      /*if ( dateo.images.length > 0 ) {
          image   = 'https://api.datea.io' + dateo.images[0].image;

      } else {
          image = null;
      }  // */
      window.plugins.socialsharing.share( message, title, null, link );  // */
  };

  $timeout(function () { $scope.flow.showPage = true; });

} ] );
