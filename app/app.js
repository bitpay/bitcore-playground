'use strict';

var app = angular.module('playApp', [
  'ngRoute',
  'playApp.units',
  'playApp.keys',
  'playApp.hdkeys',
  'playApp.transaction',
  'playApp.multisig'
]);

// Config
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/units'});
}]);

// Filters
app.filter('btc', function() {
  return function(satoshis) {
    return bitcore.Unit.fromSatoshis(satoshis).toBTC();
  };
})
.filter('permalink', function() {
  return function(data, section) {
    var url = './#/' + section + '?data=' + encodeURI(data);
    if (url.length > 2083) throw new Error('URL too long')
    return url;
  };
});

// Directives
app.directive('exampleCode', function() {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.exampleCode, function(value) {
        element.text(value);
        hljs.highlightBlock(element[0]);
      });
    }
  };
});

// Filters
function registerValidator(app, name, validator) {
  app.directive(name, function() {
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
        function validate(value) {
          var valid = validator(value, scope, attr);
          ngModel.$setValidity(null, valid);
          return value;
        }
        ngModel.$parsers.unshift(validate);
      }
    };
  });
}

registerValidator(app, 'privateKey', function(value) {
  return bitcore.PrivateKey.isValid(value);
});
registerValidator(app, 'privateKey', function(value) {
  return bitcore.PublicKey.isValid(value);
});
registerValidator(app, 'xprivateKey', function(value) {
  return bitcore.HDPrivateKey.isValidSerialized(value);
});
registerValidator(app, 'xpublicKey', function(value) {
  return bitcore.HDPublicKey.isValidSerialized(value);
});
registerValidator(app, 'path', function(value, scope) {
  return bitcore.HDPrivateKey.isValidPath(value);
});
registerValidator(app, 'address', function(value) {
  return bitcore.Address.isValid(value);
});

// Sidebar
app.controller('SideBar', function($scope, $rootScope, $timeout){
  $timeout(function(){
    $rootScope.showFooter = true;
    $rootScope.$apply();
  }, 100);

  var networks = bitcore.Networks;
  networks.defaultNetwork = networks.testnet;

  $scope.setTestnet = function(value) {
    networks.defaultNetwork = value ? networks.livenet : networks.testnet;
    $rootScope.$broadcast('networkUpdate');
  };
});
