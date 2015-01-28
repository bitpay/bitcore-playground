'use strict';

angular.module('playApp.transaction', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/transaction', {
    templateUrl: 'transaction/transaction.html',
    controller: 'TransactionCtrl'
  });
}])

.controller('TransactionCtrl', function($scope, $http) {

  $scope.utxoAddress = '1u6MtJed3Py2JPZKAfhuNwLVSQbP7oEHU';
  $scope.privateKey = '';

  $scope.fromAddresses = [];
  $scope.toAddresses = {};
  $scope.addData = [];
  $scope.privateKeys = [];
  $scope.change = '';
    
  $scope.utxos = [];

  window.T = $scope.transaction = new bitcore.Transaction();

  $scope.fetchUTXO = function(address) {
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
    var client = new bitcore.transport.explorers.Insight();
    client.getUnspentUtxos(address, onUTXOs);
    $scope.fromAddresses.push(address);

    function onUTXOs(err, utxos) {
      if (err) throw err;

      utxos = utxos.filter(function(u1) {
        var repeated = $scope.utxos.filter(function(u2) {
          return u2.txId === u1.txId && u1.outputIndex === u2.outputIndex;
        });
        return repeated.length === 0;
      });

      $scope.utxos = $scope.utxos.concat(utxos);
      $scope.$apply();
      console.log(utxos);
    }
  };

  $scope.addUTXO = function(utxo) {
    $scope.utxos = $scope.utxos.filter(function(u){
      return u !== utxo;
    });
    $scope.usingUTXOs.push(utxo);
    $scope.transaction.from(utxo);
    setExampleCode();
  };

  $scope.removeInput = function(input) {
    console.log(input);
    $scope.usingUTXOs.remove(input.output.txId + ':' + input.output.outputIndex);
    setExampleCode();
  };

  $scope.addAddressOutput = function(address, amount) {
    console.log(address, amount);
    $scope.toAddresses[address] = amount;
    $scope.transaction.to(address, -(-amount));
    setExampleCode();
  };

  $scope.addDataOutput = function(info) {
    $scope.addData.push(info);
    $scope.transaction.addData(info);
    setExampleCode();
  };

  $scope.addPrivateKey = function(privKey) {
    $scope.privateKeys.push(privKey);
    setExampleCode();
  };

  function setExampleCode() {
    var template = "";
    var i;

    template += "var transaction = new bitcore.Transaction()\n";
    for (i in $scope.usingUTXOs) {
      template += "    .from(" + $scope.usingUTXOs[i].toJSON() + ")\n";
    }
    for (i in $scope.toAddresses) {
      template += "    .to('" + i + "', " + $scope.toAddresses[i] + ")\n";
    }
    for (i in $scope.addData) {
      template += "    .addData('" + $scope.addData[i] + "')\n";
    }
    for (i in $scope.privateKeys) {
      template += "    .sign('" + $scope.privateKeys[i] + "')\n";
    }
    if ($scope.change) {
      template += "    .change('" + $scope.change + "')\n";
    }

    $scope.exampleCode = template;
  }

  function initialExample() {
    var template = "";

    template += "var transaction = new bitcore.Transaction()\n";
    template += "    .from(utxos)\n";
    template += "    .to('1bitcoinAddress...', 10000)\n";
    template += "    .to('2bitcoinAddress...', 10000)\n";
    template += "    .change('3bitcoinAddress...', 20000);";

    $scope.exampleCode = template;
  }

  initialExample();

});
