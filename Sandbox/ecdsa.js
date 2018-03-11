var NodeRSA = require('node-rsa');
var key = new NodeRSA({b: 2048});

let priv = key.exportKey("pkcs1-private-pem");

let newRsa = new NodeRSA(priv);

var text = 'Hello RSA!';
var encrypted = key.encrypt(text, 'base64');
console.log('encrypted: ', encrypted);
var decrypted = key.decrypt(encrypted, 'utf8');
console.log('decrypted: ', decrypted);