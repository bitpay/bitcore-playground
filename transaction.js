
angular.module('transactionApp', [])
  .filter('btc', function() {
    return function(satoshis) {
      return bitcore.Unit.fromSatoshis(satoshis).toBTC();
    };
  })
  .controller('tranCtrl', ['$scope', function($scope) {

    var insight = new bitcore.explorers.Insight();
    $scope.transaction = new bitcore.Transaction();
    $scope.addToAddress = {};
    $scope.addData = {};
    $scope.fromAddressData = {};
    $scope.signWithData = {};

    $scope.addresses = [];
    $scope.privateKeys = [];

    $scope.addAddress = function() {
      $scope.transaction.to(
        $scope.addToAddress.address,
        $scope.addToAddress.amount
      );
      $scope.addToAddress = {};
      sign();
    };

    $scope.addData = function() {
      var data;
      if ($scope.addData.isHexa) {
        data = new bitcore.util.buffer.hexToBuffer($scope.addData.data);
      } else {
        data = $scope.addData.data;
      }
      $scope.transaction.addData(data);
      $scope.addData = {};
      sign();
    };

    $scope.fromAddress = function() {
      var address = new bitcore.Address($scope.fromAddressData.address);
      $scope.addresses.push(address.toString());
      insight.getUnspentUtxos(address, function(err, utxos) {
        $scope.transaction.from(utxos);
        $scope.$apply();
        sign();
      });

      $scope.fromAddressData = {};
    };

    $scope.signWith = function() {
      var privateKey = new bitcore.PrivateKey($scope.signWithData.privkey);
      var address = privateKey.toAddress();

      // TODO: this is ugly
      $scope.fromAddressData = { address: address };
      $scope.fromAddress();

      $scope.privateKeys.push(privateKey.toBuffer().toString('hex'));
      $scope.signWithData = {};
    };

    var sign = function() {
      $scope.transaction.sign($scope.privateKeys);
    };
  }
]);
