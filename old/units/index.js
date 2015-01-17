$(function () {

  // Install handlers
  $('.unit').on('change keyup paste', onAmountChange);
  $('#fiat').on('change keyup paste', onFiatChange);
  $('#currency').on('change', onCurrencyChange);

  $('#BTC').val(0);
  setUnit(0, 'BTC');

  function onAmountChange(event) {
    var input = $(event.currentTarget);
    var amount = input.val();
    var unit = input.attr('id');

    setUnit(amount, unit);
  }

  function onCurrencyChange(event) {
    updateRate();
    setUnit($('#BTC').val(), 'BTC');
  }

  function onFiatChange(event) {
    var amount = $(event.target).val();
    var rate = getRate();

    if (!rate || !$.isNumeric(amount)) return;
    setUnit(amount, rate.rate);
  }

  function setUnit(amount, unit) {
    if(!$.isNumeric(amount)) amount = 0;

    var units = ['BTC', 'mBTC', 'bits', 'satoshis'];
    var bUnit = new bitcore.Unit(amount, unit);

    units.forEach(function(u) {
      if (u === unit) return;
      $('#' + u).val(bUnit.to(u));
    });

    if (!$.isNumeric(unit)) {
      var rate = getRate();
      if (rate) $('#fiat').val(bUnit.toFiat(rate.rate));
    }
  }

  var RATES = null;
  $.get('https://bitpay.com/api/rates', function(rates) {
    RATES = rates;
    var currency = $('#currency');
    rates.forEach(function(r) {
      var option = $('<option></option>').attr('value', r.code).text(r.name);
      currency.append(option);
    });
    
    updateRate();
  });

  function getRate() {
    var code = $('#currency').val();
    if (!code || !RATES) return 0;

    var rates = RATES.filter(function(r) {
      return r.code === code;
    });
    return rates[0];
  }

  function updateRate() {
    var r = getRate();
    if (r) $('#rate').text('1 BTC == ' + r.rate + ' ' + r.code);
  }
});