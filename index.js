var NodeRSA = require('node-rsa');
var fs = require('fs');
const crypto = require('crypto');

const hash = crypto.createHash('sha512');

hash.update('some data to hash');
console.log(hash.digest('hex'));

contenu = fs.readFileSync("private.pem", "UTF-8");
var privateKey = NodeRSA();
privateKey.importKey(contenu);

var encrypted = 'BiwXQjVrNPH1fwCZYDtdlVezdxONjRwZN5KyJ2ku6/CFahZ4PIJCjKVOuj/EgEvOaxM3xGm/BRJIQ8bjP28t0JP167QUWgHZ/Wcq0RvM+QX2VpowrwYNB+aDQ+FTW4QC9e6UxTGocSwa3LKLSA5mT7IjuW3CUTB2Q2x0ShCocBuVEnwtsmEUAJ0DDbWg1ufF+eCd1+YGorHiIwYxwgzsuHKQTWibizMxZX66RhuqiGej7F/vXP23PU5V3BXrnW+FtWuQkuXUNbAX69lPZbkNePZ9+AYMfti1uT6k+JZIzEAqZuDVh/RY9Jkx1KBXvxQ3DoA5X7c/GCDfYObdFVyyIA==';
var decrypted = privateKey.decrypt(encrypted, 'utf8');
console.log('decrypted: ', decrypted);
