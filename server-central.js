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
	console.log('connected');
	client.on('message', function(message) {
		console.log(message);
	});
});


/*

premier lancement
	saisie id/pass <- local
	check id utilisable et assocaition numsérie id <-central
usage
	envoie timestamp data et numsérie

*/
