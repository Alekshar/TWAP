const SERIAL_NUMBER = 01245678;

var serialport = require('serialport'),
	portName = '/dev/ttyUSB0', //TODO manage as a parameter
	WebSocket = require('ws'),
	fs = require('fs'),
	readline = require('readline'),
	rl = readline.createInterface(process.stdin, process.stdout),
	starting = true;

var crypto = require('crypto');
const hash = crypto.createHash('sha256');
var nodeRSA = require('node-rsa');
var fileKey = fs.readFileSync('public.pem', 'UTF-8');
var publicKey = nodeRSA();
publicKey.importKey(fileKey);

//To encrypt the message, we just have to do : publicKey.encrypt('An awesome message', 'Base64');

//*
setInterval(function(){
	parseAndSend(randomBetween(0,255)+","+randomBetween(0,255)+","+randomBetween(0,255));
}, 100);

function randomBetween(min, max) {
    return Math.floor(min + Math.random() * max);
}

/*/
var sp = new serialport.SerialPort(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

sp.on('data', function(input) {
	parseAndSend(input);
});
//*/

function parseAndSend(input){
	if(starting){
		return;
	}
	var splitted = input.split(","),
		jsondata = {
			type:"measure",
			measure:{
				timestamp:new Date().getTime(),
				light:splitted[0],
				temperature:splitted[1],
				humidity:splitted[2]
			}
		};
    let message = JSON.stringify(jsondata);
		ws.send(publicKey.encrypt(message, 'Base64'));
}

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
	console.log('connected to central');
	identify();
});

function identify(){
	let message = JSON.stringify({type:"identifying",serial:SERIAL_NUMBER});
	ws.send(publicKey.encrypt(message, 'Base64'));
}

function tryInstall(){
	var installData = {type:"associating", serial:SERIAL_NUMBER};
	rl.question('identifiant : ',function(answer){
		installData.user = answer;
		rl.question('mot de passe : ', function(answer){
			hash.update(answer);
			installData.password = hash.digest('hex');
			let message = JSON.stringify(installData);
			ws.send(publicKey.encrypt(message, 'Base64'));
		});
	});
}

ws.on('message', function incoming(message, flags) {
	var data = JSON.parse(message);
	switch(data.type){
    case "identified":
        starting = false;
        console.log("démarré");
        break;
    case "unknown":
        tryInstall();
        break;
	case "associationConfirmed":
		fs.writeFile("installed", "done", function(err) {
		    console.log("Association terminée");
			identify();
		});
		break;
	case "associationRefused":
		console.log("Association refusée : "+data.reason);
		tryInstall();
		break;
	default:
		console.log("action unmanaged "+data.type);
	}
});
