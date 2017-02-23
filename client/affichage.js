document.addEventListener("DOMContentLoaded", function(event) {
	var canvas = document.getElementById('tutoriel');
	ctx = canvas.getContext('2d');

	//Simulation du serveur
	if (canvas.getContext){
		ctx = canvas.getContext('2d');

//	  	var interval = setInterval(function(){
//	  		var L = Math.floor(Math.random()*255);
//	  		var H = Math.floor(Math.random()*100);
//	  		var T = Math.floor(Math.random()*100 -50);
//
//	  		afficherCanvas(ctx,L,H,T);
//	  	} ,1000);
	} else {
		console.log("Change de navigateur !")
	}
});

var publickey = '-----BEGIN PUBLIC KEY-----\n'+
'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/2YTTXqez7yvxkJor83x7LhVY\n'+
'nKbgnESbuxKl+hI+vdRwMijxB8/t80+qpYyPjsnpHxdsZAwPRZchJB+/KA1Yppmh\n'+
'p8B72sElO8K/xhpsBm3QENiu1Nz7h+9fuWn2wI3TlrBgfjfG9IG+VvKpseD8AkZ1\n'+
'URbFw7bUGXs5ONsT6QIDAQAB\n'+
'-----END PUBLIC KEY-----';


var img = new Image();   // Crée un nouvel objet Image
	img.src = 'images/Cartman.png'; // Définit le chemin vers sa source

var imgPluie = new Image();   // Crée un nouvel objet Image
	imgPluie.src = 'images/Pluie.png';

var imgNeige = new Image();   // Crée un nouvel objet Image
	imgNeige.src = 'images/Neige.png';

var imgNuage = new Image();   // Crée un nouvel objet Image
	imgNuage.src = 'images/Nuage.png';

var HAUTEUR_CIEL = 50;
var HAUTEUR_MIDDLE = 400;
var HAUTEUR_SOL = 150;
var WHITE = "rgb(255,255,255)";
var GREEN = "rgb(0,255,100)";

var key = '';

function afficherCanvas(L, H, T){

	//Jour/Nuit
	ctx.fillStyle = "rgb(0,"+Math.floor(L*3/4)+","+L+")";


	//Sol
	ctx.fillRect (0, 0, 600, 450);
	if(T<0){
		ctx.fillStyle = GREEN;
	}else{
		ctx.fillStyle = WHITE;
	}
	ctx.fillRect (0, 450, 600, 150);

	//Pluie/Neige
	if(H>50){
		if(T<0){
			ctx.drawImage(imgPluie, 0, HAUTEUR_CIEL, 600, 400);
		}else{
			ctx.drawImage(imgNeige, 0, HAUTEUR_CIEL, 600, 400);
		}
	}

	//Personnage
	ctx.drawImage(img, 200, 600-HAUTEUR_SOL-183)

	//Nuage
	/*ctx.drawImage(imgNuage, 20, 0);
	ctx.drawImage(imgNuage, 190, 13);
	ctx.drawImage(imgNuage, 380, 10);*/
}


function tryLogin(){
    var login = document.querySelector("#login").value;
    var password = document.querySelector("#password").value;
  	password = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
		key = password;
    ws.send(encrypt(JSON.stringify({type:"login", user:login, password:password})));
}

function encrypt(message){
	var encrypt = new JSEncrypt();
	console.log(message);
	console.log(publickey);
  encrypt.setPublicKey(publickey);
  var encrypted = encrypt.encrypt(message);
	console.log(encrypted);
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

var ws = new WebSocket("ws://" + window.location.host+":3000");

ws.onopen = function(event) {
  console.log("connected");
};

ws.onmessage = function(event) {
    var data = decrypt(event.data);
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
