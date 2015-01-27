'use strict';

angular.module('playApp.hdkeys', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/hdkeys', {
    templateUrl: 'hdkeys/hdkeys.html',
    controller: 'HDKeysCtrl'
  });
}])

.controller('HDKeysCtrl', function($scope) {

  var normalizePath = function(value) {
    if (value.endsWith('/')) {
      value = value.substr(0, value.length - 1);
    }
    return value;
  };

  $scope.path = 'm/817/6023';
  $scope.keys = [];

  $scope.$on('networkUpdate', function() {
    $scope.newKey();
  });

  $scope.serialize = function() {
    return JSON.stringify({
      network: bitcore.Networks.defaultNetwork.name,
      xpriv: $scope.xpriv,
      xpub: $scope.xpub,
      path: $scope.path
    });
  };

  $scope.newKey = function() {
    $scope.updatePrivate(new bitcore.HDPrivateKey().toString());
  };

  $scope.updatePrivate = function(value) {
    value = normalizePath(value);
    if (!bitcore.HDPrivateKey.isValidSerialized(value)) return; // mark as invalid

    $scope.xpriv = new bitcore.HDPrivateKey(value);
    $scope.xpub = $scope.xpriv.hdPublicKey;
    $scope.keys = $scope.deriveKeys($scope.xpriv, $scope.path);
  };

  $scope.updatePublic = function(value) {
    value = normalizePath(value);
    if (!bitcore.HDPublicKey.isValid(value)) return; // mark as invalid

    $scope.xpriv = '';
    $scope.xpub = new bitcore.HDPublicKey(value);
    $scope.keys = $scope.deriveKeys($scope.xpub, $scope.path);
  };

  $scope.updatePath = function(value) {
    $scope.keys = $scope.deriveKeys($scope.xpriv || $scope.xpub, value);
  };

  $scope.deriveKeys = function(key, path) {
    path = normalizePath(path);
    var xpriv, xpub;
    if (key instanceof bitcore.HDPrivateKey) {
      xpriv = key;
      xpub = key.hdPublicKey;
    } else if (key instanceof bitcore.HDPublicKey) {
      xpriv = null;
      xpub = key;
    } else {
      return;
    }

    if (!bitcore.HDPrivateKey.isValidPath(path)) return;

    var indexes = bitcore.HDPrivateKey._getDerivationIndexes(path);
    var paths = indexes.map(function(m, i) {
      return 'm/' + indexes.slice(0, i+1).join('/');
    });
    paths = ['m'].concat(paths);

    var nodes = paths.map(function(p) {
      return {
        path: p,
        xpriv: xpriv && key.derive(p),
        xpub: key.derive(p).hdPublicKey
      }
    });

    nodes[nodes.length-1].visible = true;
    return nodes;
  }

  $scope.newKey();
});