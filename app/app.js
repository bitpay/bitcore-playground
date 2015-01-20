'use strict';

angular.module('playApp', [
  'ngRoute',
  'playApp.units',
  'playApp.keys',
  'playApp.hdkeys',
  'playApp.transaction',
  'playApp.multisig'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/units'});
}]).
filter('btc', function() {
  return function(satoshis) {
    return bitcore.Unit.fromSatoshis(satoshis).toBTC() + ' BTC';
  };
}).
controller('SideBar', function($scope){
  $scope.setTestnet = function(value) {
    var networks = bitcore.Networks;
    networks.defaultNetwork = value ? networks.testnet : networks.livenet;
  }
});