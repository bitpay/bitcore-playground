'use strict';

angular.module('playApp.keys', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/keys', {
    templateUrl: 'keys/keys.html',
    controller: 'KeysCtrl'
  });
}])

.controller('KeysCtrl', [function() {
    console.log('Keys controller OK');
}]);