
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

    var lines = ['var transaction = new Transaction();'];

    $scope.addAddress = function() {
      $scope.transaction.to(
        $scope.addToAddress.address,
        $scope.addToAddress.amount
      );

      drawLines("transaction.to('" +
                $scope.addToAddress.address +
                "', " +
                $scope.addToAddress.amount +
                "));");

      $scope.addToAddress = {};
      sign();
    };

    $scope.addData = function() {
      var data;
      if ($scope.addData.isHexa) {
        data = new bitcore.util.buffer.hexToBuffer($scope.addData.data);
      } else {
        data = new bitcore.deps.Buffer($scope.addData.data);
      }

      drawLines("transaction.addData(" + (
                  $scope.addData.isHexa
                  ? "bitcore.util.buffer.hexToBuffer('" + data.toString('hex') +')'
                  : "'" + data + "')"
      ) + ");");

      $scope.transaction.addData(data);
      $scope.addData = {};
      sign();
    };

    var addedUTXOs = [];

    $scope.fromAddress = function() {
      var address = new bitcore.Address($scope.fromAddressData.address);
      $scope.addresses.push(address.toString());
      lines.push("insight.getUnspentUtxos('" + address.toString() + "', callback);");
      drawLines("// later in the callback...");
      insight.getUnspentUtxos(address, function(err, utxos) {

        var line = '[';
        utxos.map(function(utxo) {
          if (!addedUTXOs(utxo.toString())) {
            line += '    ' + utxo.toJSON() + ',\n';
            addedUTXOs.push(utxo.toString());
          }
        });
        line += ']';
        if (line !== '[]') {
          drawLines("transaction.from(" + line + ");");
        }

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

      drawLines("transaction.sign('" + privateKey.toBuffer().toString('hex') + "');");
    };

    var sign = function() {
      $scope.transaction.sign($scope.privateKeys);
      drawLines();
    };

    var drawLines = function(line) {
      lines.push(line);
      $scope.lines = lines.join('\n');
    };
    drawLines();
  }
]);
