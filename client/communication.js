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

	if(ws.readyState==1){
    	ws.send(encrypt(JSON.stringify({type:"login", user:login, password:password})));
    }
}

function encrypt(message){
	var encryptRSA = new JSEncrypt();
  	encryptRSA.setPublicKey(publickey);
 	 var encrypted = encryptRSA.encrypt(message);
	return encrypted;
}

function decrypt(message){
    if(message.indexOf('<c>') == 0){
      key = key.substring(0,32);
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

var ws = new WebSocket("ws://localhost:3000");

ws.onopen = function(event) {
  console.log("connected");
};

ws.onmessage = function(event) {
    var data = JSON.parse(decrypt(event.data));

    switch(data.type){
    case "loginConfirmed":
        $.notify("Access granted", "success");
        document.getElementById("rangeHistory").value = 288;
        bool_history = false;
        break;
    case "loginRefused":
        $.notify("Access denied", "error");
        break;
    case "oldValue":
        afficherCanvas(data.measure.light,data.measure.humidity,data.measure.temperature)
        break;
    case "currentValue":
    	if(!bool_history){
    		afficherCanvas(data.measure.light,data.measure.humidity,data.measure.temperature)
    	}
        break;
    default:
        console.log("unknown event : "+data.type);
    }
};

function requestHistory(date_value){
	if(ws.readyState==1){
		ws.send(encrypt(JSON.stringify({type:"history", date:date_value})))
	}
}

function history(value){
	var d = new Date();
	var value = 288-value;

	if(value!=0){
		var interval_minute = 5;
		d = new Date(d.getTime()-value * interval_minute * 60 * 1000)

		document.getElementById("rangeText").innerHTML = d.toString();

		requestHistory(d)
	}
}

function setBoolHistory(value){
	if(value == 288){
		bool_history = false;
		document.getElementById("rangeText").innerHTML = "Current date"
	}else{
		bool_history = true;
	}
}
