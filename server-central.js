var fs = require('fs');
var express = require('express');
var nodeRSA = require('node-rsa');

var aesjs = require('aes-js');

var fileKey = fs.readFileSync('private.pem', 'UTF-8');
var privateKey = nodeRSA({b:1024});
privateKey.setOptions({encryptionScheme: 'pkcs1'});
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
		var data = [];
		try {
			message = privateKey.decrypt(message, 'UTF-8');
			data = JSON.parse(message);
		} catch(e){
			console.error('Something wrong append, maybe the message was encrypted with a wrong key ?');
			data.type = 'unmanaged';
		}
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
		case "measure":
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
		    	if(client.key!==undefined) //Ajout car sinon encrypt peut appeler substring de undefined et faire cracher l'appli
	            	client.send(encrypt(JSON.stringify({type:"oldValue",measure:measure}), client.key));
		    });
		    break;
		case "login":// {user,password} -> {type:"loginConfirmed"},
                        // "loginRefused"
		    getAssociationForUser(data.user, function(assoc){
	            if(data.user == "ok"){
	                client.userSerial = assoc.serial;
									client.key = data.password;
	                client.send(encrypt(JSON.stringify({type:"loginConfirmed"}), client.key));
	            } else if(data.user == "fail"){
	                client.send(JSON.stringify({type:"loginRefused"}));
	            }
	            if(assoc === null){
	                client.send(JSON.stringify({type:"loginRefused"}));
	            } else {
	                if(assoc.password == data.password){
	                    client.userSerial = assoc.serial;
											client.key = data.password;
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



function encrypt(message, key){

  key = key.substring(0,32);
  var arr = [];
  key.split("").forEach((d)=>{
    arr.push(d.charCodeAt(0));
  });
  var aesCtr = new aesjs.ModeOfOperation.ctr(arr);
  var textBytes = aesjs.utils.utf8.toBytes(message);
  var encryptedBytes = aesCtr.encrypt(textBytes);
  var encrypted = aesjs.utils.hex.fromBytes(encryptedBytes);

	return "<c>"+encrypted;
}


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

function getMeasureAtTime(timeDate, callback){
  mongoose.model('Sensors').find({"timestamp":{ $gt: timeDate }}, (err, data) => {
            if (err) { throw err; }
          	else {
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

function removeMeasure(){
	var now = new Date();
	now.setDate(now.getDate()-1);
	mongoose.model('Sensors').remove({"timestamp": { $lt: now.getTime() }}, (err, data) => {
            if (err) { throw err; }
	});
}

//measure structure : {serial, timestamp, light, temperature, humidity}
function saveMeasure(measure){
	removeMeasure();
  const sensor = new Sensor(measure);
  sensor.save();
  //console.log(measure); //TODO REMOVE COMMENT
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
