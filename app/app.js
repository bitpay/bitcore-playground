'use strict';

angular.module('playApp', [
  'ngRoute',
  'playApp.units',
  'playApp.keys'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/units'});
}]);