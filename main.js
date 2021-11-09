// 1.  Se traen elementos y contexto del DOM (CANVAS)
const $canvas = document.getElementById('videogameCanvas');
const ctx = $canvas.getContext('2d');



// 2. Definir las variables Globales

let frames = 0;
let intervalId;
let obstacles = [];
const bullets = [];
let isGameOver = false;


