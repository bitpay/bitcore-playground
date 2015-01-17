'use strict';

angular.module('playApp.units', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/units', {
    templateUrl: 'units/units.html',
    controller: 'UnitsCtrl'
  });
}])

.controller('UnitsCtrl', [function() {
    console.log('Units controller OK');
}]);