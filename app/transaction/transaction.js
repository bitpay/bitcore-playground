'use strict';

angular.module('playApp.transaction', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/transaction', {
    templateUrl: 'transaction/transaction.html',
    controller: 'TransactionCtrl'
  });
}])

.controller('TransactionCtrl', function($scope, $http) {
    
  $scope.utxoAddress = '1ERvrJ4zWVPapeLxuZQjRbL811Bif3YF3X';
  $scope.utxos = [];

  window.T = $scope.transaction = new bitcore.Transaction();

  $scope.fetchUTXO = function(address) {
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
    var client = new bitcore.transport.explorers.Insight();
    client.getUnspentUtxos(address, onUTXOs);

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
    $scope.transaction.from(utxo);
  };

  $scope.removeInput = function(input) {
    
  };


  function setExampleCode() {
    var template = "";

    template += "var transaction = new bitcore.Transaction()\n";
    template += "    .from(utxos)\n";
    template += "    .to('1bitcoinAddress...', 10000)\n";
    template += "    .to('2bitcoinAddress...', 10000)\n";
    template += "    .change('3bitcoinAddress...', 20000);";

    $scope.exampleCode = template;
  };
  setExampleCode();

});