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
    constructor(x, y, width, height, img){
        super(x, y, width, height, img);
    }
    draw(){
        this.y+= 2
         // Esto genera que el personaje caiga al suelo 
        if(this.y > $canvas.height - this.height) // Esto genera que el personaje no pase de los bordes del canvas en su altura 
            this.y = $canvas.height - this.height;
        this.move = 24;
        this.jump = 40;
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
}


// Dentro de esta se genera el obstaculo (OBSTACULO)
class Obstacle extends GameAsset {
    constructor(x, y, width, height, img){
        super($canvas.width, y, width, height, img)
    }
    draw(){
        this.x--;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
}









// 4. Instancias de las clases

const boardImage = "https://64.media.tumblr.com/37ae369d5ee8576431758ad00e4f2f93/tumblr_obik5y31uA1qe6rsgo1_1280.gifv";
const board = new BackgroundBoard(0, 0, $canvas.width, $canvas.height, boardImage);


//(MULTIPLES OPCIONES DE BACKGROUND)
// https://64.media.tumblr.com/007fea157194d0ef0ea3c99d92c9f439/tumblr_nfkfq2IK1J1tofcqeo1_1280.jpg
// https://64.media.tumblr.com/667aae89736c77b8d7420f874f04a9b8/tumblr_o5bmkjS7LN1tfav9mo1_500.gifv
// https://cdnb.artstation.com/p/assets/images/images/003/733/755/large/mark-kirkpatrick-mk-landscape-04.jpg
// https://64.media.tumblr.com/37ae369d5ee8576431758ad00e4f2f93/tumblr_obik5y31uA1qe6rsgo1_1280.gifv

const actorImage = "/images/character.jpg";
const actor = new Impostor(120, 450, 55, 55, actorImage);

const enemyImage = "";
const enemy = new Obstacle();



// 5. Funciones principales 



function start() {
    setInterval(() => {
        update();
    }, 1000/60)
}


function update() {
    // 1. Calcular y recalcular el estado de nuestro programa
    frames++; // Se actualiza el programa
    checkKeys();
    generateEnemies();

    // 2. Limpiar el canvas
    clearCanvas();

    // 3. Dibujar los elementos
    board.draw()
    actor.draw();
    enemy.draw();
}



// 6. Funciones de apoyo


function clearCanvas() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height); 
}



function checkKeys() {
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



// FALTA GENERAR ENEMIGOS DE FORMA ALEATORIA
function generateEnemies() {
    if(frames % 300 === 0){
        const enemy = new Obstacle(500, 380);
        enemies.push(enemy);
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