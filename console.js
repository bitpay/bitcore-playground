$(function () {

function REPL() {
  this.repl = new JSREPL({
    output: this.outputCallback.bind(this),
    result: this.resultCallback.bind(this),
    error: this.errorCallback.bind(this),
  });
  this.repl.loadLanguage('javascript');

  this.console = $('#console').jqconsole(null, '>>> ');
}

REPL.prototype.prompt = function() {
  this.console.Prompt(true, this.repl.eval.bind(this.repl));
}

REPL.prototype.outputCallback = function(output) {
  this.console.Write(output, 'jqconsole-output');
}

REPL.prototype.resultCallback = function(result) {
  if (result === '') result = 'undefined';
  this.console.Write('=> ' + result + '\n', 'jqconsole-output');
  this.prompt();
}

REPL.prototype.errorCallback = function(error) {
  this.console.Write(error + '\n', 'jqconsole-error');
  this.prompt();
}

window.REPL = new REPL();
window.REPL.prompt();

});