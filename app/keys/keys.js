'use strict';

angular.module('playApp.keys', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/keys', {
    templateUrl: 'keys/keys.html',
    controller: 'KeysCtrl'
  });
}])

.controller('KeysCtrl', function($scope) {
  $scope.newKey = function() {
    $scope.privateKey = new bitcore.PrivateKey();
    $scope.publicKey = $scope.privateKey.publicKey;
  };

  $scope.privateUpdated = function(value) {
    if (bitcore.PrivateKey.isValid(value)) {
      $scope.privateKey = new bitcore.PrivateKey(value);
      $scope.publicKey = $scope.privateKey.publicKey;
    } else {
      // mark as invalid
    }
  };

  $scope.publicUpdated = function(value) {
    if (bitcore.PublicKey.isValid(value)) {
      $scope.privateKey = '';
      $scope.publicKey = new bitcore.PublicKey(value);
    } else {
      // mark as invalid
    }
  };
});