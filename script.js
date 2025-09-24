const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x = 50;
let y = canvas.height / 2;
let speed = 5;
let direction = 1;

function drawLaser() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();

  x += speed * direction;

  if (x > canvas.width - 20 || x < 20) {
    direction *= -1;
  }

  requestAnimationFrame(drawLaser);
}

function changeSpeed(value) {
  speed += value;
  if (speed < 1) speed = 1;
  if (speed > 20) speed = 20;
}

// Ajustar tamaño al rotar la pantalla
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  y = canvas.height / 2;
});

// Inicia el juego
drawLaser();
