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
}]);