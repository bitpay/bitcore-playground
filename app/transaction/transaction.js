'use strict';

angular.module('playApp.transaction', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/transaction', {
    templateUrl: 'transaction/transaction.html',
    controller: 'TransactionCtrl'
  });
}])

.controller('TransactionCtrl', function($scope, $http, bitcore) {
  // Monkey patching until next bitcore version is released
  bitcore.Transaction.prototype.removeInput = function(txId, outputIndex) {
    var index;
    if (!outputIndex && _.isNumber(txId)) {
      index = txId;
    } else {
      index = _.findIndex(this.inputs, function(input) {
        return input.prevTxId.toString('hex') === txId && input.outputIndex === outputIndex;
      });
    }
    if (index < 0 || index >= this.inputs.length) {
      throw new errors.Transaction.InvalidIndex(index, this.inputs.length);
    }
    var input = this.inputs[index];
    this._inputAmount -= input.output.satoshis;
    this.inputs = _.without(this.inputs, input);
    this._updateChangeOutput();
  };

  var explorers = require('bitcore-explorers');
  $scope.utxoAddress = 'muemjaFAtbMWssA5hHgQoNP2utb1HtNbkd';
  $scope.privateKey = '';

  $scope.fromAddresses = [];
  $scope.toAddresses = {};
  $scope.addData = [];
  $scope.privateKeys = [];
  $scope.change = '';
    
  $scope.utxos = [];

  window.T = $scope.transaction = new bitcore.Transaction();

  $scope.fetchUTXO = function(address) {
    var client = new explorers.Insight();
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
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

  $scope.signWith = function(privKey) {
    try {
      var privateKey = new bitcore.PrivateKey(privKey);
      $scope.privateKeys.push(privateKey);
      $scope.transaction.sign(privateKey);
      setExampleCode();
    } catch (e) {
      console.log('Error', e);
    }
  };

  $scope.addUTXO = function(utxo) {
    $scope.utxos = $scope.utxos.filter(function(u){
      return u !== utxo;
    });
    $scope.utxos.push(utxo);
    $scope.transaction.from(utxo);
    setExampleCode();
  };

  $scope.removeUTXO = function(utxo) {
    console.log(utxo);
    $scope.transaction.removeInput(utxo);
    setExampleCode();
  };
  $scope.removeOutput = function(output) {
    console.log(output);
    $scope.usingUTXOs.remove(input.output.txId + ':' + input.output.outputIndex);
    setExampleCode();
  };
  $scope.removeOutput = function(output) {
    console.log(output);
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

  $scope.broadcast = function() {
    var serialized = $scope.transaction.serialize();
    var client = new explorers.Insight();
    client.broadcast(serialized, function(err, id) {
      if (err) {
        alert(err);
      } else {
        alert('Broadcasted');
      }
    });
  };

  function setExampleCode() {
    var template = "";
    var i;

    template += "var transaction = new bitcore.Transaction()\n";
    for (i in $scope.utxos) {
      template += "    .from(" + $scope.utxos[i].toJSON() + ")\n";
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

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

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
