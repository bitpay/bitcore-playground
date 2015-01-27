'use strict';

angular.module('playApp.keys', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/keys', {
    templateUrl: 'keys/keys.html',
    controller: 'KeysCtrl'
  });
}])

.controller('KeysCtrl', function($scope, $routeParams) {

  $scope.$on('networkUpdate', function() {
    $scope.newKey();
  });

  $scope.newKey = function() {
    $scope.privateKey = new bitcore.PrivateKey();
    $scope.publicKey = $scope.privateKey.publicKey;
    setExampleCode();
  };

  $scope.privateUpdated = function(value) {
    if (bitcore.PrivateKey.isValid(value)) {
      $scope.privateKey = new bitcore.PrivateKey(value);
      $scope.publicKey = $scope.privateKey.publicKey;
      setExampleCode($scope.privateKey);
    } else {
      // mark as invalid
    }
  };

  $scope.publicUpdated = function(value) {
    if (bitcore.PublicKey.isValid(value)) {
      $scope.privateKey = '';
      $scope.publicKey = new bitcore.PublicKey(value);
      setExampleCode(null, $scope.publicKey);
    } else {
      // mark as invalid
    }
  };

  $scope.serialize = function() {
    return JSON.stringify({
      network: bitcore.Networks.defaultNetwork.name,
      privateKey: $scope.privateKey.toString(),
      publicKey: $scope.publicKey.toString()
    });
  };

  function setExampleCode(privkey, pubkey) {
    var template = "";

    if (!privkey && !pubkey) {
      template += "var privateKey = new bitcore.PrivateKey();\n";
      template += "var publicKey = privateKey.publicKey;\n";
    } else if (privkey) {
      template += "var privateKey = new bitcore.PrivateKey('"+ privkey.toString() + "');\n";
      template += "var publicKey = privateKey.publicKey;\n";
    } else {
      template += "var publicKey = new bitcore.PublicKey('"+ pubkey.toString()+ "');\n";
    }
    template += "var address = publicKey.toAddress();";

    $scope.exampleCode = template;
  };

  // Initialize
  if ($routeParams.data) {
    var data = JSON.parse($routeParams.data);
    bitcore.Networks.defaultNetwork = bitcore.Networks.get(data.network);
    $scope.privateKey = data.privateKey && new bitcore.PrivateKey(data.privateKey);
    $scope.publicKey = data.publicKey && new bitcore.PublicKey(data.publicKey);
    setExampleCode($scope.privateKey, $scope.publicKey);
  } else {
    $scope.newKey();
  }

});