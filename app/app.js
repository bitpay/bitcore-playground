'use strict';

angular.module('playApp', [
  'ngRoute',
  'playApp.units',
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/units'});
}]);