
angular.module('multisigApp', [])
  .controller('keysCtrl', ['$scope', function($scope) {
    $scope.Range = function(start, end) {
      var result = [];
      for (var i = 1; i <= $scope.keys.length; i++) {
        result.push(i);
      }
      return result;
    };

    // Initial Setup
    var network = bitcore.Networks.livenet;
    $scope.keys = [];
    for (var i = 0; i < 3; i++) {
      var priv = new bitcore.PrivateKey();
      $scope.keys.push({
        privKey: priv.toBuffer().toString('hex'),
        pubKey: priv.publicKey.toString()
      });
    }
    $scope.checkNetwork = false;
    $scope.threshold = 2;
 
    $scope.add = function() {
      priv = new bitcore.PrivateKey();
      $scope.keys.push({
        privKey: priv.toBuffer().toString('hex'),
        pubKey: priv.publicKey.toString()
      });
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

    $scope.updatePub = function(index) {
      $scope.keys[index].privKey = '';
      $scope.keys[index].pubKey = new bitcore.PublicKey($scope.keys[index].pubKey).toString();
      setAddress();
    };

    var buildAddress = function() {
      var pubkeys = [];
      for (var key in $scope.keys) {
        pubkeys.push($scope.keys[key].pubKey);
      }
      var address = new bitcore.Address(pubkeys, $scope.threshold, network);
      return address.toString();
    };
    var setAddress = function() {
      $scope.address = buildAddress();
    };
    setAddress();

    $scope.$watchCollection('keys', setAddress);
    $scope.$watch('threshold', setAddress);
    $scope.$watch('network', setAddress);
    $scope.$watch('checkNetwork', function() {
      if ($scope.checkNetwork) {
        network = bitcore.Networks.testnet;
      } else {
        network = bitcore.Networks.livenet;
      }
      setAddress();
    });
  }
]);
