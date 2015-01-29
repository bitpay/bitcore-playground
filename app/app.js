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
    return bitcore.Unit.fromSatoshis(satoshis).toBTC();
  };
}).
filter('permalink', function() {
  return function(data, section) {
    var url = './#/' + section + '?data=' + encodeURI(data);
    if (url.length > 2083) throw new Error('URL too long')
    return url;
  };
}).
directive('exampleCode', function() {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.exampleCode, function(value) {
        element.text(value);
        hljs.highlightBlock(element[0]);
      });
    }
  };
}).
controller('SideBar', function($scope, $rootScope){
  $scope.setTestnet = function(value) {
    var networks = bitcore.Networks;
    networks.defaultNetwork = value ? networks.testnet : networks.livenet;
    $rootScope.$broadcast('networkUpdate');
  };
});