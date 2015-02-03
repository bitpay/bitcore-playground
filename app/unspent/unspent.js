'use strict';

angular.module('playApp.unspent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/unspent', {
    templateUrl: 'unspent/unspent.html',
    controller: 'UnspentCtrl'
  });
}])

.controller('UnspentCtrl', function($scope, $http) {

  $scope.utxoAddress = 'muemjaFAtbMWssA5hHgQoNP2utb1HtNbkd';
  $scope.utxos = [];

  $scope.addressUpdated = function(address) {
    setExampleCode();
  };

  $scope.fetchUTXO = function(address) {
    var client = new bitcore.transport.explorers.Insight();
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
    client.getUnspentUtxos(address, onUTXOs);

    function onUTXOs(err, utxos) {
      if (err) throw err;

      $scope.utxos = utxos;
      for (var utxo in utxos) {
        utxos[utxo].url = client.url + '/tx/' + utxos[utxo].txId;
        utxos[utxo].txUrl = 'transaction/';
      }
      $scope.$apply();
      console.log(utxos);
    }
  };

  $scope.serialize = function() {
    return JSON.stringify({
      address: $scope.utxoAddress,
      utxos: $scope.utxos.map(function(utxo) { return utxo.toObject(); })
    });
  };

  function setExampleCode() {
    var template = "";
    var address = $scope.utxoAddress || '1BitcoinEaterAddressDontSendf59kuE';

    template += "var explorers = require('bitcore-explorers');\n";
    template += "var insight = new explorers.Insight();\n";
    template += "insight.getUnspentOutputs('" + address + "', function(err, utxos) {\n";
    template += "    // Check for errors or use the UTXOs...\n";
    template += "});";

    $scope.exampleCode = template;
  }

  setExampleCode();

});
