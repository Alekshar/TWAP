var fs = require('fs');
var express = require('express');
var nodeRSA = require('node-rsa');
var crypto = require('crypto');
var fileKey = fs.readFileSync('private.pem', 'UTF-8');
var privateKey = nodeRSA();
privateKey.importKey(fileKey);

//To decrypt the crypted message, we just have to do : privateKey.decrypt('An awesome crypted message', 'UTF-8');


var http = require('http'),
	WebSocket = require('ws'),
	WebSocketServer = WebSocket.Server;


var app = express();

app.use(express.static('client'));

var webserv = http.createServer();
webserv.on('request', app);
webserv.listen('80', '0.0.0.0', function() {
  console.log('Listening on ' + webserv.address().address + ':' + webserv.address().port);
});



var server = http.createServer();
server.listen('3000', '0.0.0.0', function() {
  console.log('Listening on ' + server.address().address + ':' + server.address().port);
});

var wss = new WebSocketServer({
	server: server
});


/*************** CONNECTION TO MONGODB ********************************************************/

var db = 'mongodb://localhost:27017/Arduino';
var mongoose   =  require("mongoose");
var connection = mongoose.connect(db);
let Sensor = require("./modele/sensors");
let Association = require("./modele/association");

wss.on('connection', function(client) {
	client.on('message', function(message) {
		message = privateKey.decrypt(message, 'UTF-8');
		var data = JSON.parse(message);
		switch(data.type){
		case "identifying":
			client.serialNumber = data.serial;
			getAssociationForSerial(data.serial, function(assoc){
	            if(assoc == null){
	                client.send(JSON.stringify({type:"unknown"}));
	            } else {
	                client.send(JSON.stringify({type:"identified"}));
	            }
			});
			break;
		case "measure": // gérer broadcast clients (currentValue)
			data.measure.serial = client.serialNumber;
			saveMeasure(data.measure);
			for(userClient of wss.clients) {
			    if(typeof userClient.userSerial != "undefined"
			        && userClient.userSerial == data.measure.serial){
			        userClient.send(encrypt(JSON.stringify({type:"currentValue", measure:data.measure}), userClient.key));
			    }
			}
			break;
		case "associating":
		    getAssociationForUser(data.user, function(assoc){
		        console.log(assoc);
		        if(assoc === undefined){
	                delete data.type;
	                createAssociation(data);
	                client.send(JSON.stringify({type:"associationConfirmed"}));
	            } else {
	                client.send(JSON.stringify({type:"associationRefused",reason:"Identifiant déjà utilisé"}));
	            }
		    });
			break;
		case "history":// {date} -> oldValue
		    getMeasureAtTime(data.date, function(measure){
	            client.send(encrypt(JSON.stringify({type:"oldValue",measure:measure}), client.key));
		    });
		    break;
		case "login":// {user,password} -> {type:"loginConfirmed"},
                        // "loginRefused"
		    getAssociationForUser(data.user, function(assoc){
	            if(data.user == "ok"){
	                client.userSerial = assoc.serial;
	                client.send(encrypt(JSON.stringify({type:"loginConfirmed"}), client.key));
	            } else if(data.user == "fail"){
	                client.send(JSON.stringify({type:"loginRefused"}));
	            }
	            if(assoc === null){
	                client.send(JSON.stringify({type:"loginRefused"}));
	            } else {
	                if(assoc.password == data.password){
	                    client.userSerial = assoc.serial;
	                    client.send(encrypt(JSON.stringify({type:"loginConfirmed"}), client.key));
	                } else {
	                    client.send(JSON.stringify({type:"loginRefused"}));
	                }
	            }
		    });
		    break;
		default:
			console.log("unmanaged action "+data.type);
		}
	});
});



/******************************************************************/
/********* DATA BASE METHODES *********************************/
/****************************************************************/

function getAssociationForSerial(serial, callback){
	mongoose.model('Association').find({"serial": serial}, (err, data) =>{
	    if (err) {
	        throw err;
	    }
		else {
    		console.log(data);
    		callback(data[0]);
		}
    });

}


function encrypt(message){

}


function getAssociationForUser(user,callback){
	mongoose.model('Association').find({"user": user}, (err, data) =>{
					if (err) { throw err; }
							else {
										console.log(data);
										callback(data[0]);
										}
	});
}

//TODO besoin de prendre la prochaine mesure la plus proche de cette date

function getMeasureAtTime(timeDate, callback){ // a verifier
  mongoose.model('Sensors').find({"timestamp": timeDate}, (err, data) => {
            if (err) { throw err; }
          	else {
                    // comms est un tableau de hash
                    console.log(data);
                    callback(data[0]) ;
                	}
	});
}

function createAssociation(data){
  //creation du lien entre le id e
	const association = new Association(data);
  association.save();
  console.log(data);
}

//measure structure : {serial, timestamp, light, temperature, humidity}
function saveMeasure(measure){
  const sensor = new Sensor(measure);
  sensor.save();
  console.log(measure);
}


/*

premier lancement
	saisie id/pass <- local
	check id utilisable et assocaition numsérie id <-central
usage
	envoie timestamp data et numsérie

	currentValue oldValue
gestion mémoire
x dernières périodes de 1 minute enregistrées
    => utilisation d'un marqueur temps perso


vider +24h
pb timestamp server local pas central


*/
