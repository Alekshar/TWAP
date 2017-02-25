var key = '';

function tryLogin(){
    var login = document.querySelector("#login").value;
    var password = document.querySelector("#password").value;
  	password = CryptoJS.SHA256(password);
		key = password;
    ws.send(encrypt(JSON.stringify({type:"login", user:login, password:password})));
}

function encrypt(message){
	var encrypt = new JSEncrypt();
	//var pkey = fs.readFileSync('public.pem', 'UTF-8');
  encrypt.setPublicKey(pkey);
  var encrypted = encrypt.encrypt(message);

	return encrypted;
}

function decrypt(message){
    if(message.indexOf('<c>') == 0){
        var crypted = message.substring(3, message.length);
        console.log(crypted);
        return CryptoJS.AES.decrypt(crypted, key);
    }
    return message;
}

var ws = new WebSocket("ws://localhost:3000");

ws.onopen = function(event) {
  console.log("connected");
};

ws.onmessage = function(event) {
    var data = decrypt(event.data);
    console.log(data)
    switch(data.type){
    case "loginConfirmed":
        //TODO
        break;
    case "loginRefused":
        //TODO
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
