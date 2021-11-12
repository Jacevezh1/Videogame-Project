//-----------------------> 1.  Se traen elementos y contexto del DOM (CANVAS) <-------
const $canvas = document.querySelector("canvas");
const $button = document.querySelector("startGame");
const ctx = $canvas.getContext("2d");




//-----------------------------> 2. Definir las variables Globales <------------------------

let frames = 0;
let intervalId;

let enemies = [];
let deadEnemies = [];



let skyBombs = [];

const bullets = [];

let isGameOver = false; 

let casinoChips = [];
let collectedChips = 0;

let score = 0;
let lives = 1;




//---------------------------> 3. Crear CLASES y sus PROPIEDADES y METODOS <--------------------


//---------------------------------------3.1. Clase GENERICA <-----------------------------------
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



// -----------------------------------> 3.2  Clase BACKGROUND  <------------------
class BackgroundBoard extends GameAsset {
	constructor(x, y, width, height, img) {
		super(x, y, width, height, img); 

       /*  this.audio = new Audio();
        this.audio.src = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/transportation_aircraft_military_spitfire_flying_overhead.mp3" */
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





// ---------------------------------------> 3.3 Clase CHARACTER  <-----------------------------------
class Impostor extends GameAsset {
    constructor(x, y, width, height, img){ // IMG se removera para hacer los sprites del MONO
        super(x, y, width, height, img);
    }
    draw(){
        this.y+=0.3 // Character CAIGA al SUELO
        this.x+= 0.1 // Esto para que el mono avance de dereche a izquierda
        if(this.x > $canvas.width - this.width) // Esto genera que el personaje no pase de los bordes del canvas en su ancho
            this.x = $canvas.width - this.width;
         
        if(this.y > $canvas.height - this.height) // Esto genera que el personaje no pase de los bordes del canvas en su altura 
            this.y = $canvas.height - this.height;
        this.moveBack = 20; // Para que mi personaje se mueva hacia atras
        this.moveFoward = 10; // Para que el personaje se mueve hacia adelante
        this.jump = 20; // Para que el personaje pueda brincar mas
        this.down = 20; // Para que el personaje se recorra hacia abajo


       
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



// ------------------------> 3.4 Clase OBSTACLE genera MISILES (ENEMIES) <----------------------------
class Obstacle { 
    constructor(x, y, width, height, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = "/images/bullet.png";
        this.live = 1; 
    }
    
    draw() {
        this.x-=3;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    };


    isTouchingObstacle(obj) { 
		return (  // Si se incrementa '+' aumenta el margen del choque
			this.x < obj.x + 37 && // Limita impacto en parte trasera (37 = obj.width)
			this.x + 50 > obj.x && // Limita impacto en parte frontal (50 = this.width)
			this.y < obj.y + 23 && // Limita impacto de abajo hacia arriba  (23 = obj.heigth)
			this.y + 32.5 > obj.y // Limita impacto de arriba hacia abjo (32.5 = this.heigth)
		);
	}

        
}



// ----------------------> 3.5 Clase SKYFALL OBSTACULOS CAEN DEL CIELO (MINIBOMBAS) <---------------

class SkyFallObstacle extends Obstacle {
    constructor(x, y, width, height, img) {
        super(x, y, width, height, img)
        this.image = new Image();
        this.image.src = "/images/fallingBomb1.png";
    }

    draw() {
        this.y+=1.8;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    isTouchingBomb(obj) { 
		return (  // Si se incrementa '+' aumenta el margen del choque
			this.x < obj.x + obj.width && // Limita impacto en parte trasera (37 = obj.width)
			this.x + this.width > obj.x && // Limita impacto en parte frontal (50 = this.width)
			this.y < obj.y + obj.height && // Limita impacto de abajo hacia arriba  (23 = obj.heigth)
			this.y + this.height > obj.y // Limita impacto de arriba hacia abjo (32.5 = this.heigth)
		);
	}

}




// ------------------------> 3.6 Clase CHIPS genera PUNTOS (MONEDAS-CASINO) <------------------
class Chips { 
    constructor(x, y, width, height, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = "/images/chip3.png";
        this.audio = new Audio(); 
        this.audio.src = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-41945/zapsplat_multimedia_game_tone_positive_reward_synth_delayed_46038.mp3"
    }
    
    draw() {
        this.x-=3;
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

    rewardChipSound(){ 
        this.audio.volume = 0.15
        this.audio.play();
    }
  
}





// ------------------------> 3.7 Clase BULLET genera BALAS (BALAS-PERSONAJE) <--------------------
class Bullet { 
    constructor(x, y, width, height, img){
        this.x = x;
        this. y = y;
        this.width = 20;
        this.height = 15;
        this.image = new Image()
        this.image.src = "/images/laserShoot.png"
        /* this.color = "orange"; */
        this.audio = new Audio();
        this.audio.src = " https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-31172/zapsplat_science_fiction_weapon_gun_shoot_003_32196.mp3"
        this.velocity = 1;
        // Optional sound :https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-69838/zapsplat_warfare_gun_rifles_single_shot_designed_71743.mp3
        
    };

    draw(){
        this.x+=6;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        /* ctx.fillStyle = this.color; */
        /* ctx.fillRect(this.x, this.y, this.width, this.height) */
    }

    shotSound(){
        this.audio.volume = 0.25;
        this.audio.play();
    }

    isTouchingBullet(obj) { 
		return (  // Si se incrementa '+' aumenta el margen del choque
			this.x < obj.x + obj.width && // Limita impacto en parte trasera (37 = obj.width)
			this.x + this.width > obj.x && // Limita impacto en parte frontal (50 = this.width)
			this.y < obj.y + obj.height && // Limita impacto de abajo hacia arriba  (23 = obj.heigth)
			this.y + this.height > obj.y // Limita impacto de arriba hacia abjo (32.5 = this.heigth)
		);
	}
}



// --------------------------------> 4. Instancias de las clases <-------------------------------

const boardImage = "https://64.media.tumblr.com/37ae369d5ee8576431758ad00e4f2f93/tumblr_obik5y31uA1qe6rsgo1_1280.gifv";
const board = new BackgroundBoard(0, 0, $canvas.width, $canvas.height, boardImage);


// (SPRITES, esto se remueve para crear los sprites de mi mono)
const actorImage = "/images/spaceship.png";
const actor = new Impostor(120, 450, 55, 55, actorImage);







// --------------------------------> 5. Funciones PRINCIPALES <------------------------------------




// ------------------------------------> 5.1 Funcion START <---------------------------
function start() {
    if(intervalId) return; // Esto se hace para que no se encimen los intervalos y no modificar su velocidad
    intervalId = setInterval(() => {
        update();
        /* board.backgroundAudio(); */
    }, 1000/60)
}


// ------------------------------------> 5.2 Funcion UPDATE <---------------------------------
function update() {
    // 1. Calcular y recalcular el estado de nuestro programa
    frames++; // Se actualiza el programa
    checkKeys(); // Que tecla se presiona
    generateObstacles(); // Se generan los obstaculos
    generateSkyFallBombs() // Se generan los skyfalls
    generateChips(); // Genera las chips
    checkCollitions(); // Se checa si hubo colisiones 
    skyCheckCollitions(); // Checa si hubo colisiones
    checkChipsCollitions();
    checkBulletCollision();
    
   
 

    // 2. Limpiar el canvas
    clearCanvas();

    // 3. Dibujar los elementos
    board.draw(); // Se dibuja el canvas
    actor.draw();
    
    
    drawEnemies();
    drawSkyBoms(); 
    drawChips(); 
    drawScore();
    drawLives();
    drawCollectedChips();
    drawBullets(); 
    gameOver(); 
    winGame();
}




// ------------------------------> 5.3 Funcion DRAWSCORE <-----------------------------
function drawScore() { 
    score = Math.floor(frames / 5)
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText(`Score: ${score}`, 20, 30)
}




// ------------------------------> 5.4 Funcion DRAWLIVES <-----------------------------
function drawLives(){ 
    if(isGameOver) {lives-=1} // Aqui se le resta la vida si pierdo 
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText('Lives:  '+ lives, 20, 50)

}



// ------------------------------> 5.5 Funcion DRAWCOLLECTEDCHIPS <-----------------------------
function drawCollectedChips() { 
    ctx.font = "20px Impact"
    ctx.fillStyle = "orange";
    ctx.fillText(`Chips: ${collectedChips}`, 680, 30)
}



// ------------------------------> 5.3 Funcion GAMEOVER <---------------------------------------
function gameOver() { 
    if(isGameOver){
        ctx.font = "100px Impact";
        ctx.fillStyle = "red"
        ctx.fillText("GAME OVER", 200, 200, 400,);
    }
}


// -----------------------------> 5.4 Funcion WinGame <-------------------------------------------


function winGame() {
    if(score >= 450){
        ctx.font = "100px Impact";
        ctx.fillStyle = "red"
        ctx.fillText("YOU WON!", 200, 200, 400,);
        clearInterval(intervalId);
    }
}




// -------------------------------> 6. Funciones de APOYO <----------------------------------



// --------------------------> 6.1 Funcion CHECKCOLLITIONS (MISILES) <-------------------
function checkCollitions() { 
    enemies.forEach(enemie => {
        if(actor.isTouching(enemie)){
           clearInterval(intervalId);
           isGameOver = true;
        }
    });
}




// --------------------------> 6.2 Funcion GENERATEOBSTACLES (MISILES) <-------------------
function generateObstacles() { 
    if(frames % 80 === 0) {
        const y = Math.floor(Math.random() * 470)
        const enemie = new Obstacle($canvas.width, y, 45, 45, this.image); 
        enemies.push(enemie);
    }

    enemies.forEach((obs, index) => { // Eliminamos los enemies que estan fuera de pantalla, para no saturar memoria
        if (obs.x + obs.width < 0) enemies.splice(1, index)
    });

}

// --------------------------> 6.3 Funcion DRAWENEMIES (MISILES) <-----------------------------
function drawEnemies() { 
    enemies.forEach((enemie) => enemie.draw())
}






//-----------------------------> 6.4 Funcion GENERATE (SKY FALL BOMBS) <------------------
function generateSkyFallBombs() { 
    if (frames % 100 === 0) {
        const x = Math.floor(Math.random() * $canvas.height)
        const skyBomb = new SkyFallObstacle(x, 0, 60, 50, this.image)
        skyBombs.push(skyBomb);
    }

    skyBombs.forEach((obs, index) => {
        if(obs.y + obs.height < 0) skyBombs.splice(1, index)
    })
}


//-----------------------------------> 6.5 Funcion DRAWSKYBOMBS <-----------------------------
function drawSkyBoms(){
    skyBombs.forEach((skyBomb) => skyBomb.draw())
}



//---------------------------------> 6.6 Funcion SKYCHECKCOLLITIONS <-------------------------


function skyCheckCollitions() {
    skyBombs.forEach(skyBomb => {
        if(actor.isTouching(skyBomb)){
            clearInterval(intervalId);
           isGameOver = true;
        }
    });
}








// ------------------------> 6.7  Funcion GENERATE CHIPS (PUNTOS) <-------------------
function generateChips() { 
    if(frames % 200 === 0){
        const y = Math.floor(Math.random() * 380)
        const chip = new Chips($canvas.width, y, 35, 35, this.image)
        casinoChips.push(chip)
    }
}




// --------------------------> 6.8 Funcion DRAWCHIPS (PUNTOS) <-------------------
function drawChips() { 
    casinoChips.forEach((chip) => chip.draw());
}





// -----------------------> 6.9 Funcion CHECK CHIPS COLLITTIONS (PUNTOS) <---------------
function checkChipsCollitions() { 
    casinoChips.forEach(chip => {
        if (chip.isTouchingChip(actor)) {
            collectedChips++; 
            casinoChips.splice(chip, 1) // Se borran del CANVAS cuando hay contacto
            chip.rewardChipSound(); // Suena con colision con moneda
            
       } 
    })
}





// --------------------------> 6.11 Funcion DRAWBULLETS (BULLETS) <-------------------
function drawBullets() { 
    bullets.forEach((bullet) => bullet.draw());
}



// --------------------------> 6.11 Funcion CHECKBULLET COLISION (BALAS) <-------------------



function checkBulletCollision() {
   skyBombs.forEach((skyBomb, index) => {
    bullets.forEach((bullet, i) => {
        if(skyBomb.isTouchingBomb(bullet)){
            skyBombs.splice(index, 1);
        }
        if(bullet.isTouchingBullet(skyBomb)){
            bullets.splice(i, 1)
        }
    })
        
    })  
}  





// --------------------------> 6.12 Funcion CLEARCANVAS (CANVAS) <-------------------
function clearCanvas() { // FUNCION se limpia el CANVAS
    ctx.clearRect(0, 0, $canvas.width, $canvas.height); 
}






// -----------------------> 6.13 Funcion CHECKKEYS (TECLADO Y EVENTOS) <-------------------
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
            case "w":
                if(frames % 6 === 0){
                    const bullet = new Bullet(actor.x, actor.y + 22.5)
                    bullets.push(bullet); 
                    bullet.shotSound();
                }
                break;
            default:
            break;
        }
    }
}



// -------------------------> 7. Interaccion de usuario para inicar el juego <-------




document.onkeyup = event => {
    switch (event.key) {
        case "Enter": // Para iniciar el juego
            start();
            break;
        default:
        break;
    }
}


