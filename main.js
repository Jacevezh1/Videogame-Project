//---------------------------- 1.  Se traen elementos y contexto del DOM (CANVAS)
const $canvas = document.querySelector("canvas");
const $button = document.querySelector("startGame");
const ctx = $canvas.getContext("2d");




//---------------------------------- 2. Definir las variables Globales------------------------//

let frames = 0;
let intervalId;
let enemies = [];
const bullets = [];
let isGameOver = false; 
let casinoChips = [];
let collectedChips = 0;
let score = 0;
let lives = 1;




//--------------------------------- 3. Crear clases y sus propiedades y metodos--------------------//




//------------------------------------------3.1. Clase GENERICA -----------------------------------//
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



// -------------------- 3.2  Clase BACKGROUND se pintara el Background infinito horizontal ---------//
class BackgroundBoard extends GameAsset {
	constructor(x, y, width, height, img) {
		super(x, y, width, height, img); 
	}
    // En esta parte se realiza el poliformismo para contextualizar y modificar la clase padre //
    draw(){

        this.x-=1.5; // Permite modificar la velocidad en la que se mueve el BACKGROUND
       
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





// ------------------------3.3 Clase CHARACTER Dentro de esta se genera la clase del personaje ------ //
class Impostor extends GameAsset {
    constructor(x, y, width, height, img){ // IMG se removera para hacer los sprites del MONO
        super(x, y, width, height, img);
    }
    draw(){
        this.y+=0.3  // PENDIENTE VERIFICAR PARA VER SI EL JUGADOR CAE O NO (CAIGA AL SUELO)
        this.x+= 0.1 // Esto para que el mono avance de dereche a izquierda
        if(this.x > $canvas.width - this.width) // Esto genera que el personaje no pase de los bordes del canvas en su ancho
            this.x = $canvas.width - this.width;
         
        if(this.y > $canvas.height - this.height) // Esto genera que el personaje no pase de los bordes del canvas en su altura 
            this.y = $canvas.height - this.height;
        this.moveBack = 20; // Para que mi personaje se mueva hacia atras
        this.moveFoward = 10; // Para que el personaje se mueve hacia adelante
        this.jump = 40; // Para que el personaje pueda brincar mas
        this.down = 40; // Para que el personaje se recorra hacia abajo


       
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }


    // METODOS para MOVER al CHARACTER 
    moveUp() {
        this.y-= this.jump;
    }

    moveDown() {
        this.y+= this.down;
    }

    moveLeft(){
        this.x-= this.moveBack;
    }

    moveRight(){
        this.x+= this.moveFoward;
    }


    // METODO para saber si se estan COLISIONANDO mis OBSTACULOS y mi CHARACTER
    isTouching(obj) { 
		return (  // Si se incrementa '+' aumenta el margen del choque
			this.x < obj.x + 37 && // Limita impacto en parte trasera (37 = obj.width)
			this.x + 50 > obj.x && // Limita impacto en parte frontal (50 = this.width)
			this.y < obj.y + 23 && // Limita impacto de abajo hacia arriba  (23 = obj.heigth)
			this.y + 32.5 > obj.y // Limita impacto de arriba hacia abjo (32.5 = this.heigth)
		);
	}



  
}



// ------------------------3.4 Clase OBSTACLE genera MISILES (ENEMIES )------ //
class Obstacle { 
    constructor(x, y, width, height, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = "/images/bullet.png";
        this.live =0; // PENDIENTE MODIFICAR
    }
    
    draw() {
        this.x-=2.5;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } 
}



// ------------------------3.3 Clase CHIPS genera PUNTOS (MONEDAS-CASINO) ------ //
class Chips { // Clase que genera las monedas para ganar (COINS)
    constructor(x, y, width, height, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = "/images/casino.png";
    }
    
    draw() {
        this.x--;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } 

    isTouchingChip(obj) { 
		return (  // Si se incrementa '+' aumenta el margen del choque
			this.x < obj.x + 37 && // Limita impacto en parte trasera (37 = obj.width)
			this.x + 50 > obj.x && // Limita impacto en parte frontal (50 = this.width)
			this.y < obj.y + 23 && // Limita impacto de abajo hacia arriba  (23 = obj.heigth)
			this.y + 32.5 > obj.y // Limita impacto de arriba hacia abjo (32.5 = this.heigth)
		);
	}
  
}



class Bullet { // Clase que me permite generar balas
    constructor(x, y){
        this.x = x;
        this. y = y;
        this.width = 10;
        this.height = 10;
        this.color = "red";
        /* this.image = new Image()
        this.image.src = " " */
    };

    draw(){
        this.x++;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

}



// 4. Instancias de las clases

const boardImage = "https://64.media.tumblr.com/37ae369d5ee8576431758ad00e4f2f93/tumblr_obik5y31uA1qe6rsgo1_1280.gifv";
const board = new BackgroundBoard(0, 0, $canvas.width, $canvas.height, boardImage);





// (SPRITES, esto se remueve para crear los sprites de mi mono)
const actorImage = "/images/spaceship.png";
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
    checkKeys(); // Que tecla se presiona
    generateObstacles(); // Se generan los obstaculos
    generateChips(); // Genera las chips
    checkCollitions();  // Se checa si hubo colisiones
    checkChipsCollitions(); // Se checa si hubo colisiones entre mi moneda y mi personaje (SI = SUMA COIN)
    generateBullets(); // NUEVO PENDIENTE
 

    // 2. Limpiar el canvas
    clearCanvas();

    // 3. Dibujar los elementos
    board.draw() // Se dibuja el canvas
    actor.draw(); // Se dibuja al personaje principal
    drawEnemies(); // Se dibujan los Obstaculos //
    drawChips(); 
    drawScore();
    drawLives();
    drawCollectedChips();
    drawBullets(); // PENDIENTE Y NUEVO
    gameOver(); 
}


function drawScore() { // Funcion que me permite dibujar el score (SCORE)
    score = Math.floor(frames / 5)
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText(`Score: ${score}`, 20, 30)
}



function drawLives(){ // Funcion que me permite dibujar (VIDAS)
    if(isGameOver) {lives-=1} // Aqui se le resta la vida si pierdo 
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText('Lives:  '+ lives, 20, 50)

}


function drawCollectedChips() { // Funcion que me permite dibujar cuantas monedas he tomado
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText(`Chips: ${collectedChips}`, 680, 30)
}



function gameOver() { // Funcion que dice Game Over cuando hay una colision (GAMEOVER)
    if(isGameOver){
        ctx.font = "100px Impact";
        ctx.fillStyle = "red"
        ctx.fillText("GAME OVER", 200, 200, 400,);
    }
}





// 6. Funciones de apoyo


 
function checkCollitions() { // Funcion que checa si hubo colision de mi personaje y los misiles (CHECKCOLITIONS)
    enemies.forEach(enemie => {
        if(actor.isTouching(enemie)){
           clearInterval(intervalId);
           isGameOver = true;
           
        }
    });
}

function generateObstacles() { // En esta funcion se generan los obstaculos de forma aletoria en el canvas y se empujan al array.
    if(frames % 100 === 0) {
        const y = Math.floor(Math.random() * 470)
        const enemie = new Obstacle($canvas.width, y, 45, 45, this.image); // MODIFICAR CANVAS WIDTH
        enemies.push(enemie);
    }

    enemies.forEach((obs, index) => { // Eliminamos los enemies que estan fuera de pantalla, para no saturar memoria
        if (obs.x + obs.width < 0) enemies.splice(1, index)
    });

}


function drawEnemies() { // En esta funcion se itera cada elemento de enemies y lo imprime
    enemies.forEach((enemie) => enemie.draw())
}




function generateChips() { // En esta clase se generan las monedas de forma aleatoria (COINS)
    if(frames % 200 === 0){
        const y = Math.floor(Math.random() * 380)
        const chip = new Chips($canvas.width, y, 35, 35, this.image)
        casinoChips.push(chip)
    }
}


function drawChips() {
    casinoChips.forEach((chip) => chip.draw());
}


function checkChipsCollitions() {
    casinoChips.forEach(chip => {
        if (chip.isTouchingChip(actor)) {
            collectedChips++;
            casinoChips.splice(chip, 1)
            console.log(collectedChips);
       } 
    })
}




function generateBullets() {
    
    if(frames % 60 === 0){
        const bullet = new Bullet(actor.x + 25, actor.y);
        bullets.push(bullet) 
    }
   
    bullets.forEach((obj, index) => {
        if(obj.x - obj.width > 0) bullets.splice(1, index)
    })
}


function drawBullets() {
    bullets.forEach((bullet) => bullet.draw());
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
            case "w":
                drawBullets();
                break;
            default:
                break;
        }
    }
    
}




// 7. Interaccion de usuario

document.onkeyup = event => {
    switch (event.key) {
        case "Enter": // Para iniciar el juego
            start();
            break;
        default:
        break;
    }
}




