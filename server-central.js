var fs = require('fs');
var nodeRSA = require('node-rsa');
var fileKey = fs.readFileSync('private.pem', 'UTF-8');
var privateKey = nodeRSA();
privateKey.importKey(fileKey);

//To decrypt the crypted message, we just have to do : privateKey.decrypt('An awesome crypted message', 'UTF-8');

var http = require('http'),
	WebSocket = require('ws'),
	WebSocketServer = WebSocket.Server;


var server = http.createServer();
server.listen('3000', '0.0.0.0', function() {
  console.log('Listening on ' + server.address().address + ':' + server.address().port);
});

var wss = new WebSocketServer({
	server: server
});


wss.on('connection', function(client) {
	client.on('message', function(message) {
		var data = JSON.parse(message);
		switch(data.type){
		case "identifying":
			client.serialNumber = data.serial;
			client.send(JSON.stringify({type:"identified"}));
			break;
		case "measure":
			data.measure.serial = client.serialNumber;
			saveMeasure(data.measure);
			break;
		case "associating":
			var assoc = getAssociation(data.id);
			if(assoc === null){
				createAssociation(data.id, data.password, data.serial);
				client.send(JSON.stringify({type:"associationConfirmed"}));
			} else {
				client.send(JSON.stringify({type:"associationRefused",reason:"Identifiant déjà utilisé"}));
			}
			break;
		default:
			console.log("unmanaged action");
		}
	});
});


//Database methods
function getAssociation(id){
	if(id === "test"){
		return {id:"test"};
	}
	return null;
}

function createAssociation(id, password, serialNumber){
}

//measure structure : {serial, timestamp, light, temperature, humidity}
function saveMeasure(measure){
	console.log(measure);
}


/*

premier lancement
	saisie id/pass <- local
	check id utilisable et assocaition numsérie id <-central
usage
	envoie timestamp data et numsérie

*/
