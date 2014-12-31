$(function () {

  // Install handlers
  $('#privateKey').on('change keyup paste', onPrivateKey);
  $('#wifKey').on('change keyup paste', onPrivateKey);
  $('#newKey').click(onNewKey);
  $('#testnet').on('change', switchNetwork);

  function getNetwork() {
    return $('#testnet').is(":checked") ? bitcore.Networks.testnet : bitcore.Networks.livenet;
  }

  function onNewKey() {
    var network = getNetwork();
    var privkey = new bitcore.PrivateKey(undefined, network);
    setInputs(privkey);
  }

  function onPrivateKey(event) {
    var val = $(event.currentTarget).val();
    var network = getNetwork();
    
    var privkey;
    try {
      privkey = new bitcore.PrivateKey(val, network);
    } catch (err) {
      return console.log('Invalid PrivateKey');
    }
    setInputs(privkey);    
  }

  function setInputs(privkey) {
    PRIKEY = privkey;

    $('#privateKey').val(privkey.toBuffer().toString('hex'));
    $('#wifKey').val(privkey.toWIF());
    $('#publicKey').val(privkey.publicKey.toString());
    $('#address').val(privkey.toAddress());
  }
  function switchNetwork() {
    var privhex = $('#privateKey').val();
    var network = getNetwork();
    setInputs(new bitcore.PrivateKey(privhex, network));
  }
});