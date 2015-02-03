'use strict';

var app = angular.module('playApp', [
  'ngRoute',
  'playApp.units',
  'playApp.keys',
  'playApp.hdkeys',
  'playApp.transaction',
  'playApp.unspent',
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
})
.filter('ellipsify', function() {
  return function(data) {
    return data.substr(0, 4) + '...' + data.substr(data.length - 4, data.length);
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
})
.directive('autoSelect', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).focus(function(){
        $(this).select();
      });
    }
  };
})
.directive('requireEqualizer', function() {
  return {
    link: function(scope, element, attrs) {
     $(document).foundation();
     $(document).foundation('equalizer', 'reflow');
    }
  };
})
.directive('requireModal', function() {
  return {
    link: function(scope, element, attrs) {
     $(document).foundation();
     $(document).foundation('reveal', 'reflow');
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
registerValidator(app, 'publicKey', function(value) {
  return bitcore.PublicKey.isValid(value);
});
registerValidator(app, 'xprivateKey', function(value) {
  return bitcore.HDPrivateKey.isValidSerialized(value);
});
registerValidator(app, 'xpublicKey', function(value) {
  return bitcore.HDPublicKey.isValidSerialized(value);
});
registerValidator(app, 'privateHdpath', function(value, scope) {
  return !!(/^[mM][']?(\/[0-9]+[']?)*[/]?$/.exec(value));
});
registerValidator(app, 'publicHdpath', function(value, scope) {
  return !!(/^[mM](\/[0-9]+)*[/]?$/.exec(value));
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
