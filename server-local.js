var serialport = require('serialport');
var portName = '/dev/ttyACM0';7
var WebSocket = require('ws');

//*/
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
	var splitted = input.split(","),
		jsondata = {
		timestamp:new Date().getTime(),
		light:splitted[0],
		temperature:splitted[1],
		humidity:splitted[2]
	};
	console.log(jsondata);
    ws.send(JSON.stringify(jsondata));
}

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
	console.log('opened');
});

ws.on('message', function incoming(data, flags) {
});
