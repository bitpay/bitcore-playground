'use strict';

angular.module('playApp.transaction', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/transaction', {
    templateUrl: 'transaction/transaction.html',
    controller: 'TransactionCtrl'
  });
}])

.controller('TransactionCtrl', function($scope, $http, bitcore) {

  var explorers = require('bitcore-explorers');
  var defaultLivenetAddress = '1PPQ2anP7DVWmeScdo8fCSTeWCpfBDFAhy';
  var defaultTestnetAddress = 'mfnUxBP3JjS4pU1kddzUshF8bcU7wF99mx';

  $scope.$on('networkUpdate', function() {
    reset();
  });

  var reset = function() {
    if (bitcore.Networks.defaultNetwork.name === 'testnet') {
      $scope.utxoAddress = defaultTestnetAddress;
    } else {
      $scope.utxoAddress = defaultLivenetAddress;
    }
    $scope.utxos = [];
    $scope.loading = false;
    $scope.currentAddress = '';
    $scope.transaction = new bitcore.Transaction();
    $scope.privateKey = '';

    $scope.fromAddresses = [];
    $scope.toAddresses = {};
    $scope.addData = [];
    $scope.privateKeys = [];
    $scope.change = '';
    $scope.loading = false;
    setExampleCode();
  };
  reset();

  $scope.privateKey = '';

  $scope.fromAddresses = [];
  $scope.toAddresses = {};
  $scope.addData = [];
  $scope.privateKeys = [];
  $scope.change = '';
  $scope.nLockTime = undefined;
  $scope.loading = false;

  $scope.$watch('nLockTime', function(newValue) {
    if (!newValue) {
      $scope.currentAddress = undefined;
    } else {
      $scope.transaction.nLockTime = newValue;
    }
    setExampleCode();
  });

  $scope.utxos = [];

  $scope.fetchUTXO = function(address) {
    var client = new explorers.Insight();
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
    
    $scope.loading = true;
    client.getUnspentUtxos(address, onUTXOs);
    $scope.fromAddresses.push(address);

    function onUTXOs(err, utxos) {
      $scope.loading = false;
      if (err) throw err;

      if (!utxos.length) {
        $scope.utxos = [];
        $scope.notFound = address;
        $scope.currentAddress = '';
        $scope.$apply();
        return;
      }

      $scope.utxos = utxos;
      $scope.currentAddress = address;
      $scope.$apply();
      console.log(utxos);
    }
  };

  $scope.signWith = function(privKey) {
    try {
      $('#addSignatureModal').foundation('reveal', 'close');
      if (!privKey) {
        return;
      }
      var privateKey = new bitcore.PrivateKey(privKey);
      $scope.privateKeys.push(privateKey);
      var signatures = $scope.transaction.getSignatures(privateKey);
      if (!signatures.length) {
        $('#noSignatures').foundation('reveal', 'open');
      } else {
        $scope.transaction.sign(privateKey);
      }
      setExampleCode();
    } catch (e) {
      console.log('Error', e);
    }
  };

  $scope.addUTXO = function(utxo) {
    utxo.used = true;
    $scope.transaction.from(utxo);
    setExampleCode();
  };

  $scope.removeUtxo = function(utxo) {
    var txId = utxo.txId.toString('hex');
    $scope.transaction.removeInput(txId, utxo.outputIndex);
    for (var i in $scope.utxos) {
      if ($scope.utxos[i].txId.toString('hex') === txId && $scope.utxos[i].outputIndex === utxo.outputIndex) {
        $scope.utxos[i].used = false;
      }
    }
    setExampleCode();
  };
  $scope.removeInput = function(input) {
    $scope.removeUtxo({txId: input.prevTxId, outputIndex: input.outputIndex});
  };
  $scope.removeOutput = function(index) {
    $scope.transaction.removeOutput(index);
    setExampleCode();
    $scope.$apply();
  };

  $scope.addAddressOutput = function(address, amount) {
    console.log(address, amount);
    $('#addAddressModal').foundation('reveal', 'close');
    if (!amount && amount !== 0) {
      return;
    }
    amount = bitcore.Unit.fromBTC(amount).toSatoshis();
    $scope.toAddresses[address] = amount;
    $scope.transaction.to(address, amount);
    setExampleCode();
  };

  $scope.addDataOutput = function(info) {
    $('#addDataModal').foundation('reveal', 'close');
    $scope.addData.push(info);
    $scope.transaction.addData(info);
    setExampleCode();
  };

  $scope.addPrivateKey = function(privKey) {
    $scope.privateKeys.push(privKey);
    setExampleCode();
  };

  $scope.canSerialize = function() {
    try {
      $scope.transaction.serialize();
    } catch (err) {
      return false;
    }
    return $scope.transaction.inputs.length > 0;
  }

  $scope.broadcast = function() {
    var serialized = $scope.transaction.serialize();
    var client = new explorers.Insight();
    $scope.broadcasting = true;
    client.broadcast(serialized, function(err, id) {
      $scope.broadcasting = false;
      if (err) {
        $('#broadcastError').foundation('reveal', 'open');
      } else {
        $scope.transactionUrl = client.url + '/tx/' + $scope.transaction.id;
        $scope.$apply();
        $('#broadcastSuccess').foundation('reveal', 'open');
      }
    });
  };

  function setExampleCode() {
    var template = "";
    var i;

    template += "var transaction = new bitcore.Transaction()\n";
    for (i in $scope.utxos) {
      if ($scope.utxos[i].used) {
        template += "    .from(" + $scope.utxos[i].toJSON() + ")\n";
      }
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
    if (!_.isUndefined($scope.nLockTime)) {
      template += "transaction.nLockTime = " + $scope.nLockTime + ";\n";
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
});
