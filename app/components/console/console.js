$(function () {

function REPL() {
  this.element = document.getElementById("console");
  this.console = $('#console').jqconsole(null, '>> ');

  var self = this;
  $(this.element).click(function(){
    self.console.$input_source.focus();
  });

  // Autocomplete hack
  this.console._Indent = function() {
    var tokens = this.GetPromptText().split(' ');
    var token = tokens[tokens.length-1];

    if (!isSafeToken(token)) return;

    // get context
    var context = getContext(token);
    var prefix = token.split(".").slice(-1)[0];

    // get completition alternatives
    var alternatives = filterPrefix(prefix, context);
    alternatives = alternatives.sort(function(a, b) {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });

    // get extended prefix
    var newPrefix = extendPrefix(prefix, alternatives);
    var contextName = token.split('.').slice(0,-1).join('.');

    // set new token
    var extendedToken = (contextName.length > 0 ? contextName + '.' : '') + newPrefix;
    tokens[tokens.length-1] = extendedToken;

    // print new token
    this.SetPromptText(tokens.join(" "));

    if (alternatives.length > 1) {
      this._PrintAlternatives(alternatives);
    }
  };

  this.console._PrintAlternatives = function(alternatives) {
    this.Write(this.GetPromptText(true) + '\n', 'jqconsole-old-prompt');
    var all = alternatives.join("    ");
    this.Write(all + '\n\n', 'jqconsole-output');
  };

  this.console._Unindent = function() {};
}

function getContext(token) {
  if (token.indexOf('.') === -1) {
    return Object.keys(window);
  }

  var context = token.split('.').slice(0, -1).join('.');

  var dic;
  try {
    dic = window.eval(context);
  } catch (err) {
    return [];
  }
  var options = $.map(dic, function(value, key) {
    return key;
  }).filter(function(key) {
    return key.indexOf('_') !== 0;
  }).sort(function(a, b) {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  });

  return options;
}

function isSafeToken(token) {
  var unsafe = "()[];=".split('');
  return !!token && unsafe.reduce(function(prev, c) {
    return prev && !$.contains(token, c);
  });
}

function filterPrefix(prefix, alternatives) {
  return alternatives.filter(function(opt) {
    return opt.indexOf(prefix) === 0;
  });
}

function extendPrefix(prefix, alternatives) {
  if (!prefix) return '';
  if (alternatives.length === 0) return prefix;
  if (alternatives.length === 1) return alternatives;

  var newPrefix = prefix + alternatives[0][prefix.length];
  var filtered = filterPrefix(newPrefix, alternatives);

  if (filtered.length != alternatives.length) return prefix;
  return extendPrefix(newPrefix, alternatives);
}

REPL.prototype.prompt = function() {
  var self = this;
  this.console.Prompt(true, function(line) {
    try {
      var result = window.eval(line);
    } catch (err) {
      return self.errorCallback(err);
    }
    self.resultCallback(result);
  });
  this.scrollToBottom();
}

REPL.prototype.outputCallback = function(output) {
  this.console.Write(output, 'jqconsole-output');
}

REPL.prototype.scrollToBottom = function() {
  this.element.scrollTop = this.element.scrollHeight;
}

REPL.prototype.resultCallback = function(result) {
  if (typeof result === 'undefined') {
    this.console.Write('undefined\n', 'jqconsole-undefined');
    return this.prompt();
  }
 
  if (result instanceof Object && result.inspect) {
    result = result.inspect();
  }

  this.console.Write('' + result + '\n', 'jqconsole-output');
  this.prompt();
}

REPL.prototype.errorCallback = function(error) {
  this.console.Write('' + error + '\n', 'jqconsole-error');
  this.prompt();
}

window.REPL = new REPL();
window.REPL.prompt();

});