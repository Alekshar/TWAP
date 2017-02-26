var key = '';
var publickey = '-----BEGIN PUBLIC KEY-----\n'+
'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/2YTTXqez7yvxkJor83x7LhVY\n'+
'nKbgnESbuxKl+hI+vdRwMijxB8/t80+qpYyPjsnpHxdsZAwPRZchJB+/KA1Yppmh\n'+
'p8B72sElO8K/xhpsBm3QENiu1Nz7h+9fuWn2wI3TlrBgfjfG9IG+VvKpseD8AkZ1\n'+
'URbFw7bUGXs5ONsT6QIDAQAB\n'+
'-----END PUBLIC KEY-----';

function tryLogin(){
    var login = document.querySelector("#login").value;
    var password = document.querySelector("#password").value;
  	password = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
		key = password;
    ws.send(encrypt(JSON.stringify({type:"login", user:login, password:password})));
}

function encrypt(message){
	var encryptRSA = new JSEncrypt();
  encryptRSA.setPublicKey(publickey);
  var encrypted = encryptRSA.encrypt(message);
	return encrypted;
}

function decrypt(message){
    if(message.indexOf('<c>') == 0){
      key = key.substring(0,16);
      var arr = [];
      key.split("").forEach((d)=>{
        arr.push(d.charCodeAt(0));
      });
      var crypted = message.substring(3, message.length);
      var aesCtr = new aesjs.ModeOfOperation.ctr(arr);
      var encryptedBytes = aesjs.utils.hex.toBytes(crypted);
			var decryptedBytes = aesCtr.decrypt(encryptedBytes);
      var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
      return decryptedText;
    }
    return message;
}

var ws = new WebSocket("ws://" + window.location.host+":3000");

ws.onopen = function(event) {
  console.log("connected");
};

ws.onmessage = function(event) {
    var data = JSON.parse(decrypt(event.data));
    switch(data.type){
    case "loginConfirmed":
        //TODO
        break;
    case "loginRefused":
        //TODO
				console.log('Login Refused');
        break;
    case "oldValue":
        //TODO
        break;
    case "currentValue":
        //TODO
        break;
    default:
        console.log("unknown event : "+data.type);
    }
};
