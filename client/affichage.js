function resizeCanvas(){
	var canvas = document.getElementById("canvas");

	var majWidth = window.innerWidth*0.8;
	var majHeight = window.innerHeight*0.8;

	if(majWidth > 600){
		majWidth = 600;
	}
	if(majHeight > 600){
		majHeight = 600;
	}
    canvas.width  = majWidth;
    canvas.height = majHeight;
}

document.addEventListener("DOMContentLoaded", function(event) {
	var canvas = document.getElementById('canvas');
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

var imgCartman = new Image();   // Crée un nouvel objet Image
	imgCartman.src = 'images/Cartman.png'; // Définit le chemin vers sa source

var imgCartmanSoleil = new Image();   // Crée un nouvel objet Image
	imgCartmanSoleil.src = 'images/Cartman_soleil.png'; // Définit le chemin vers sa source

var imgCartmanFroid = new Image();   // Crée un nouvel objet Image
	imgCartmanFroid.src = 'images/Cartman_froid.png'; // Définit le chemin vers sa source

var imgCartmanPluie = new Image();   // Crée un nouvel objet Image
	imgCartmanPluie.src = 'images/Cartman_pluie.png'; // Définit le chemin vers sa source

var imgPluie = new Image();   // Crée un nouvel objet Image
	imgPluie.src = 'images/Pluie.png';

var imgNeige = new Image();   // Crée un nouvel objet Image
	imgNeige.src = 'images/Neige.png';

var imgNuage = new Image();   // Crée un nouvel objet Image
	imgNuage.src = 'images/Nuage.png';

var imgNuageSombre = new Image();   // Crée un nouvel objet Image
	imgNuageSombre.src = 'images/Nuage_sombre.png';

var HAUTEUR_CIEL = 50;
var HAUTEUR_MIDDLE = 400;
var HAUTEUR_SOL = 150;
var WHITE = "rgb(255,255,255)";
var GREEN = "rgb(0,255,100)";

function afficherCanvas(L, H, T){

	//Jour/Nuit
	ctx.fillStyle = "rgb(0,"+Math.floor(L*3/4)+","+L+")";


	//Sol
	ctx.fillRect (0, 0, 600, 450);
	if(T>0){
		ctx.fillStyle = GREEN;
	}else{
		ctx.fillStyle = WHITE;
	}
	ctx.fillRect (0, 450, 600, 150);

	//Pluie/Neige
	if(H>50){
		if(T>0){
			ctx.drawImage(imgPluie, 0, HAUTEUR_CIEL, 600, 400);
		}else{
			ctx.drawImage(imgNeige, 0, HAUTEUR_CIEL+50, 600, 400-50);
		}
	}

	

	var img = imgCartman;
	if(T > 20 && L > 200 && H <50){
		img = imgCartmanSoleil
	}else if(H>50 && T>0){
		img = imgCartmanPluie
	}else if(T < 0){
		img = imgCartmanFroid
	}

	ctx.drawImage(img, 200, 600-HAUTEUR_SOL-183)

	var nuage = imgNuage;
	//Nuage
	if(L<125){
		nuage = imgNuageSombre;
	}
	ctx.drawImage(nuage, 0, -10)
	ctx.drawImage(nuage, 120, 15)
	ctx.drawImage(nuage, 330, 0)
}
