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

//Connexion a à la base de données
//creer le schmea association
var db = 'mongodb://localhost:27017/Arduino';
var mongoose   =  require("mongoose");
var connection = mongoose.connect(db);
let Sensor = require("./modele/sensors");

wss.on('connection', function(client) {
	client.on('message', function(message) {
		message = privateKey.decrypt(message, 'UTF-8');
		var data = JSON.parse(message);
		switch(data.type){
		case "identifying":
			client.serialNumber = data.serial;
			var assoc = getAssociationForSerial(data.serial);
			if(assoc == null){
	            client.send(JSON.stringify({type:"unknown"}));
			} else {
	            client.send(JSON.stringify({type:"identified"}));
			}
			break;
		case "measure": //gérer broadcast clients (currentValue)
			data.measure.serial = client.serialNumber;
			saveMeasure(data.measure);
			break;
		case "associating":
			var assoc = getAssociation(data.user);
			if(assoc === null){
			    delete data.type;
				createAssociation(data);
				client.send(JSON.stringify({type:"associationConfirmed"}));
			} else {
				client.send(JSON.stringify({type:"associationRefused",reason:"Identifiant déjà utilisé"}));
			}
			break;
		case "history"://{date} -> oldValue
		    var measure = getMeasureAtTime(data.date);
		    client.send(JSON.stringify({type:"oldValue",measure:measure}));
		    break;
		case "login"://{user,password} -> {type:"loginConfirmed"}, "loginRefused"
		    var assoc = getAssociation(data.user);
		    if(assoc === null){
                client.send(JSON.stringify({type:"loginRefused"}));
            } else {
                if(assoc.password == data.password){
                    client.userSerial = assoc.serial;
                    client.send(JSON.stringify({type:"loginConfirmed"}));
                } else {
                    client.send(JSON.stringify({type:"loginRefused"}));
                }
            }
		    break;
		default:
			console.log("unmanaged action "+data.type);
		}
	});
});

function getAssociationForSerial(serial){
    return null;
}

//Database methods
function getAssociation(user){
  if(user === "test"){
      return {user:"test"};
  }
  return null;
}

//TODO besoin de prendre la prochaine mesure la plus proche de cette date
function getMeasureAtTime(timeDate){ // a verifier
  return mongoose.model('Sensors').find({"timestamp": timeDate}, (err, data) => {
                          if (err) { throw err; }
                              else {
                                          // comms est un tableau de hash
                                          console.log(data);
                                          return data[0];
                                      }
                      });
}

function createAssociation(data){
  //creation du lien entre le id et
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
    

*/
