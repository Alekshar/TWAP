const SERIAL_NUMBER = 01245698;

var serialport = require('serialport'),
	portName = '/dev/ttyACM0',
	WebSocket = require('ws'),
	fs = require('fs'),
	readline = require('readline'),
	rl = readline.createInterface(process.stdin, process.stdout);

var nodeRSA = require('node-rsa');
var fileKey = fs.readFileSync('public.pem', 'UTF-8');
var publicKey = nodeRSA();
publicKey.importKey(fileKey);

//To encrypt the message, we just have to do : publicKey.encrypt('An awesome message', 'Base64');

/*/
setInterval(function(){
	parseAndSend(randomBetween(0,255)+","+randomBetween(0,255)+","+randomBetween(0,255));
}, 100);

function randomBetween(min, max) {
    return Math.floor(min + Math.random() * max);
}

//
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
	var splitted = input.split(","),
		jsondata = {
			timestamp:new Date().getTime(),
			light:splitted[0],
			temperature:splitted[1],
			humidity:splitted[2]
		};
    ws.send(JSON.stringify(jsondata));
}

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
	console.log('connected to central');
	if (!fs.existsSync("installed") || true) {
		tryInstall();
	}
});

function tryInstall(){
	var installData = {type:"associating", serial:SERIAL_NUMBER};
	rl.question('identifiant : ',function(answer){
		installData.id = answer;
		rl.question('mot de passe : ', function(answer){
			installData.password = answer;
			ws.send(JSON.stringify(installData));
		});
	});
}

ws.on('message', function incoming(data, flags) {
	var message = JSON.parse(data);
	switch(message.type){
	case "associationConfirmed":
		fs.writeFile("installed", "done", function(err) {
		    console.log("Association terminée");
		});
		break;
	case "associationRefused":
		console.log("Association refusée : "+message.reason);
		tryInstall();
		break;
	default:
		console.log("action unmanaged "+message.type);
	}
});
