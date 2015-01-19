'use strict';

angular.module('playApp.multisig', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/multisig', {
    templateUrl: 'multisig/multisig.html',
    controller: 'MultisigCtrl'
  });
}])

.controller('MultisigCtrl', [function() {
    console.log('Multisig controller OK');
}]);