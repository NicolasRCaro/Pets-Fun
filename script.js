const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let entities = [];
let isPaused = false;
let mode = "fish"; // "fish" o "laser"
let speedFactor = 1;
const MAX_ENTITIES = 15;
const SPAWN_INTERVAL_MS = 1500;

// Clase de entidad
class Entity {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = type === "fish" ? 40 : 20;
    this.vx = (Math.random() - 0.5) * 4 * speedFactor;
    this.vy = (Math.random() - 0.5) * 4 * speedFactor;
    this.color = type === "fish" ? "orange" : "red";
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.fillStyle = this.color;
    if (this.type === "fish") {
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function spawnEntity() {
  if (entities.length < MAX_ENTITIES) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    entities.push(new Entity(x, y, mode));
  }
}

function gameLoop() {
  if (!isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    entities.forEach((entity) => {
      entity.update();
      entity.draw();
    });
  }
  requestAnimationFrame(gameLoop);
}

// Controles
function togglePause() {
  isPaused = !isPaused;
}

function clearEntities() {
  entities = [];
}

function toggleMode() {
  mode = mode === "fish" ? "laser" : "fish";
}

function adjustSpeed(dir) {
  speedFactor += dir * 0.5;
  if (speedFactor < 0.5) speedFactor = 0.5;
  if (speedFactor > 3) speedFactor = 3;
  entities.forEach((e) => {
    e.vx *= speedFactor;
    e.vy *= speedFactor;
  });
}

canvas.addEventListener("click", (e) => {
  entities.push(new Entity(e.clientX, e.clientY, mode));
});

// Spawner automático
setInterval(spawnEntity, SPAWN_INTERVAL_MS);

// Iniciar juego
gameLoop();
