document.addEventListener("DOMContentLoaded", function(event) { 
	var canvas = document.getElementById('tutoriel');
	var ctx = canvas.getContext('2d');

	//Simulation du serveur
	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
	  	
	  	var interval = setInterval(function(){
	  		var L = Math.floor(Math.random()*255);
	  		var H = Math.floor(Math.random()*100);
	  		var T = Math.floor(Math.random()*100 -50);

	  		afficherCanvas(ctx,L,H,T);
	  	} ,1000);
	} else {
		console.log("Change de navigateur !")
	}
});



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

function afficherCanvas(ctx, L, H, T){
	
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
