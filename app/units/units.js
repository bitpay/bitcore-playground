'use strict';

angular.module('playApp.units', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/units', {
    templateUrl: 'units/units.html',
    controller: 'UnitsCtrl'
  });
}])

.controller('UnitsCtrl', function($scope, $http) {
  $scope.unit = {};
  $scope.currencies = [];
  $scope.currency = null;

  $scope.updateUnit = function(value, code) {
    var unit = new bitcore.Unit(value, code);

    console.log('Value', value)
    if (value === '' || isNaN(unit.satoshis)) {
      return; // TODO: mark as invalid
    }

    $scope.unit.BTC = unit.BTC;
    $scope.unit.mBTC = unit.mBTC;
    $scope.unit.bits = unit.bits;
    $scope.unit.satoshis = unit.satoshis;

    if (angular.isString(code)) {
      $scope.unit[code] = value;
      $scope.unit.fiat = $scope.currency ? unit.atRate($scope.currency.rate) : 0;
    }
  };

  $scope.updateFiat = function(value, rate) {
    $scope.updateUnit(value, rate.rate);
  };

  $scope.updateUnit(0, 'BTC');

  $http.get('https://bitpay.com/api/rates').
    success(function(rates) {
      $scope.currencies = rates;
      $scope.currency = rates[0];
    }).
    error(function() {
      console.log('Error while fetching exchange rates');
    });
});