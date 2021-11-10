// 1.  Se traen elementos y contexto del DOM (CANVAS)
const $canvas = document.querySelector("canvas");
const $button = document.querySelector("startGame");
const ctx = $canvas.getContext("2d");



// 2. Definir las variables Globales

let frames = 0;
let intervalId;
let enemies = [];
const bullets = [];
let isGameOver = false; 
let score = 0;
let lives = 1;
/* const GRAVITY;  */


// 3. Crear clases y sus propiedades y metodos

// Clase generica con lo minimo indispensable para que un elemento del juego sea representado y se logre pintar.
class GameAsset {
	constructor(x, y, width, height, img) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.image = new Image();
		this.image.src = img;
	}

	draw() {
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}



// Dentro de esta extension de la clase padre, se pintara el Background infinito horizontal (BACKGROUND)
class BackgroundBoard extends GameAsset {
	constructor(x, y, width, height, img) {
		super(x, y, width, height, img);
	}
    // En esta parte se realiza el poliformismo para contextualizar y modificar la clase padre //
    draw(){
        this.x-=1.5;
        // Se realiza efecto infinito de la imagen (Cuando primer imagen del canvas, reseteamos a 0)
        if(this.x < -this.width) this.x = 0;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(
            this.image, 
            this.x + this.width,
            this.y, 
            this.width, 
            this.height
        );
    }
}



 




// Dentro de esta se genera la clase del personaje (CHARACTER)
class Impostor extends GameAsset {
    constructor(x, y, width, height, img){ // IMG se removera para hacer los sprites del MONO
        super(x, y, width, height, img);
    }
    draw(){
        this.y+= 2
         // Esto genera que el personaje caiga al suelo 
        if(this.y > $canvas.height - this.height) // Esto genera que el personaje no pase de los bordes del canvas en su altura 
            this.y = $canvas.height - this.height;
        this.move = 24;
        this.jump = 80;
        this.fall = 35;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }


    // Aqui se agregan los metodos para mover al personaje 
    moveUp() {
        this.y-= this.jump;
    }

    moveDown() {
        this.y+= this.fall;
    }

    moveLeft(){
        this.x-= this.move;
    }

    moveRight(){
        this.x+= this.move;
    }


    // Metodo para saber si se estan tocando mis obstaculos y mi personaje

    isTouching(obj) {
		return (
			this.x < obj.x + obj.width &&
			this.x + this.width > obj.x &&
			this.y < obj.y + obj.height &&
			this.y + this.height > obj.y
		);
	}
}




class Obstacle {
    constructor(x, y, width, height, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = "/images/bullet.png";
    }
    
    draw() {
        this.x--;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } 
}







// 4. Instancias de las clases

const boardImage = "https://64.media.tumblr.com/37ae369d5ee8576431758ad00e4f2f93/tumblr_obik5y31uA1qe6rsgo1_1280.gifv";
const board = new BackgroundBoard(0, 0, $canvas.width, $canvas.height, boardImage);



// (SPRITES, esto se remueve para crear los sprites de mi mono)
const actorImage = "/images/character.jpg";
const actor = new Impostor(120, 450, 55, 55, actorImage);





// 5. Funciones principales 

function start() {
    if(intervalId) return; // Esto se hace para que no se encimen los intervalos y no modificar su velocidad
    intervalId = setInterval(() => {
        update();
    }, 1000/60)
}


function update() {
    // 1. Calcular y recalcular el estado de nuestro programa
    frames++; // Se actualiza el programa
    checkKeys();
    generateObstacles(); // Se generan los obstaculos
    checkCollitions();  // Se checa si hubo colisiones
    
 

    // 2. Limpiar el canvas
    clearCanvas();

    // 3. Dibujar los elementos
    board.draw() // Se dibuja el canvas
    actor.draw(); // Se dibuja al personaje principal
    drawEnemies(); // Se dibujan los Obstaculos
    drawScore();
    drawLives();
    gameOver(); 

}


function drawScore() { // Funcion que me permite dibujar el score (SCORE)
    score = Math.floor(frames / 5)
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText(`Score: ${score}`, 20, 30)
}



function drawLives(){ // Funcion que me permite dibujar (VIDAS)
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText('LIVES:  '+ lives, 20, 50)
}




function gameOver() { // Funcion que dice Game Over cuando hay una colision (GAMEOVER)
    if(isGameOver){
        ctx.font = "100px Impact";
        ctx.fillStyle = "red"
        ctx.fillText("GAME OVER", 200, 200, 400,);
    }
}







// 6. Funciones de apoyo


 
function checkCollitions() { // Funcion que checa si hubo colision de mi personaje y obstaculos (CHECKCOLITIONS)
    enemies.forEach(enemie => {
        if(actor.isTouching(enemie)){
           clearInterval(intervalId);
           isGameOver = true;
           
        }
    })
}



function generateObstacles() { // En esta funcion se generan los obstaculos de forma aletoria en el canvas y se empujan al array.
    if(frames % 150 === 0) {
        const y = Math.floor(Math.random() * 380)
        const enemie = new Obstacle($canvas.width, y, 45, 45, this.image); 
        enemies.push(enemie);
    }

    enemies.forEach((obs, index) => { // Eliminamos los enemies que estan fuera de pantalla, para no saturar memoria
        if (obs.x + obs.width < 0) enemies.splice(1, index)
    });
}


function drawEnemies() { // En esta funcion se itera cada elemento de enemies y lo imprime
    enemies.forEach((enemie) => enemie.draw())
}



function clearCanvas() { // En esta funcion se limpia el canvas
    ctx.clearRect(0, 0, $canvas.width, $canvas.height); 
}



function checkKeys() { // Funcion que permite ver que boton usa el usuario
    document.onkeydown = event => {
        switch (event.key) {
            case "ArrowUp":
                actor.moveUp();
    
                break;
            case "ArrowDown":
                actor.moveDown();
    
                break;
            case "ArrowRight":
                actor.moveRight();
    
                break;
            case "ArrowLeft":
                actor.moveLeft();
    
                break;
            case "Enter":
                start();
    
                break;
            

            default:
                break;
        }
    }
    
}

























// 7. Interaccion de usuario

document.onkeyup = event => {
    switch (event.key) {
        case " ":
            
            break;
        case "Enter":
            start();
            break;
        default:
            break;
    }
}




/* $button.start(); */