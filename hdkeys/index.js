$(function () {

  // Install handlers
  $('#privateKey').on('change keyup paste', onPrivateKey);
  $('#publicKey').on('change keyup paste', onPublicKey);
  $('#path').on('change keyup paste', onPath);

  $('#newKey').click(onNewKey);
  $('#testnet').on('change', switchNetwork);

  function getNetwork() {
    return $('#testnet').is(":checked") ? bitcore.Networks.testnet : bitcore.Networks.livenet;
  }

  function onNewKey() {
    var network = getNetwork();
    var hdprivkey = new bitcore.HDPrivateKey(); // TODO: Use network
    setInputs(hdprivkey);
  }

  function onPath() {
    var path = $('#path').val();
    var val = $('#privateKey').val();

    var key = val 
      ? new bitcore.HDPrivateKey(val)
      : new bitcore.HDPublicKey($('#publicKey').val()); // TODO: Use network

    try {
      key.derive(path);
      setDerived(key, path);
    } catch (err) {}
  }

  function onPublicKey(event) {
    var val = $(event.currentTarget).val();
    var network = getNetwork();
    
    var pubkey;
    try {
      pubkey = new bitcore.HDPublicKey(val);
    } catch (err) {
      return console.log('Invalid PublicKey');
    }
    setInputs(pubkey);
  }

  function onPrivateKey(event) {
    var val = $(event.currentTarget).val();
    var network = getNetwork();
    
    var privkey;
    try {
      privkey = new bitcore.HDPrivateKey(val);
    } catch (err) {
      return console.log('Invalid PrivateKey');
    }
    setInputs(privkey);    
  }

  function setInputs(key) {
    if (key instanceof bitcore.HDPrivateKey) {
      $('#privateKey').val(key.toString());
      $('#publicKey').val(key.hdPublicKey.toString());
    } else {
      $('#privateKey').val('');
      $('#publicKey').val(key.toString());
    }
    setDerived(key, 'm/0');
  }

  function setDerived(key, path) {
    $('#path').val(path);
    $('.path').html(path);

    if (key instanceof bitcore.HDPrivateKey) {
      setDerivedPrivate(key, path);
      setDerivedPublic(key.hdPublicKey, path);
    } else {
      $('#derivedHDPriv').val('');
      $('#derivedPriv').val('');
      setDerivedPublic(key, path);
    }
  }

  function setDerivedPrivate(privkey, path) {
    var derived = privkey.derive(path);

    $('#derivedHDPriv').val(derived.toString());
    $('#derivedPriv').val(derived.privateKey.toString());
  }

  function setDerivedPublic(pubkey, path) {
    var derived = pubkey.derive(path);
    
    $('#derivedHDPub').val(derived.toString());
    $('#derivedPub').val(derived.publicKey.toString());
    $('#derivedAddress').val(derived.publicKey.toAddress());
  }
  

  function switchNetwork() {
    var privhex = $('#privateKey').val();
    var network = getNetwork();
    //setInputs(new bitcore.PrivateKey(privhex, network));
  }
});