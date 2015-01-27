'use strict';

angular.module('playApp.multisig', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/multisig', {
    templateUrl: 'multisig/multisig.html',
    controller: 'MultisigCtrl'
  });
}])

.controller('MultisigCtrl', function($scope) {

  $scope.$on('networkUpdate', function() {
    setupKeys();
  });

  $scope.serialize = function() {
    return JSON.stringify({
      network: bitcore.Networks.defaultNetwork.name,
      keys: $scope.keys,
      threshold: $scope.threshold
    });
  };

  $scope.Range = function(start, end) {
    var result = [];
    for (var i = 1; i <= $scope.keys.length; i++) {
      result.push(i);
    }
    return result;
  };

  function setupKeys() {
    $scope.keys = [1,2,3].map(getRandomKey);
    $scope.threshold = 2;
  }

  // Initial Setup
  setupKeys();

  function getRandomKey() {
    var priv = new bitcore.PrivateKey();
    return {
      privKey: priv.toString(),
      pubKey: priv.publicKey.toString()
    };
  }

  $scope.add = function() {
    $scope.keys.push(getRandomKey());
  };

  $scope.remove = function(index) {
    var newKeys = [];
    for (var key in $scope.keys) {
      if (key != index) {
        newKeys.push($scope.keys[key]);
      }
    }
    $scope.keys = newKeys;
  };

  $scope.updatePriv = function(index) {
    var privKey = new bitcore.PrivateKey($scope.keys[index].privKey);
    $scope.keys[index].privKey = privKey.toBuffer().toString('hex');
    $scope.keys[index].pubKey = privKey.publicKey.toString();
    setAddress();
  };

  $scope.randPriv = function(index) {
    $scope.keys[index] = getRandomKey();
    $scope.updatePriv(index);
  };

  $scope.updatePub = function(index) {
    $scope.keys[index].privKey = '';
    $scope.keys[index].pubKey = new bitcore.PublicKey($scope.keys[index].pubKey).toString();
    setAddress();
  };

  var setAddress = function() {
    var pubkeys = [];
    for (var key in $scope.keys) {
      pubkeys.push($scope.keys[key].pubKey);
    }
    var address = new bitcore.Address(pubkeys, $scope.threshold);

    $scope.address = address.toString();
    setExampleCode(pubkeys, $scope.threshold);
  };

  function setExampleCode(pubkeys, threshold) {
    var template = "var publicKeys = [\n";

    pubkeys.forEach(function(key, index) {
      template += "  new bitcore.PublicKey('" + key.toString() + "')";
      template += (index < pubkeys.length - 1) ? ',\n' : '\n';
    });

    template += "];\n";
    template += "var address = new bitcore.Address(publicKeys, " + threshold + ");";

    $scope.exampleCode = template;
  };

  setAddress();
  $scope.$watchCollection('keys', setAddress);
  $scope.$watch('threshold', setAddress);
});
