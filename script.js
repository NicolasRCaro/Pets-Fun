// Config
const MAX_ENTITIES = 18;
const SPAWN_INTERVAL_MS = 1400;
const DEFAULT_SPEED = 1.0;

// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = canvas.width = canvas.parentElement.clientWidth;
let H = canvas.height = canvas.parentElement.clientHeight;

// State
let entities = [];
let lastSpawn = 0;
let paused = false;
let pointer = { x: W / 2, y: H / 2, active: false };
let lastTime = performance.now();
let speedMultiplier = DEFAULT_SPEED;

// Controls
const pauseBtn = document.getElementById('pauseBtn');
const clearBtn = document.getElementById('clearBtn');
const typeSelect = document.getElementById('typeSelect');
const speedRange = document.getElementById('speedRange');

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Continuar' : 'Pausar';
});
clearBtn.addEventListener('click', () => { entities = []; });
speedRange.addEventListener('input', e => { speedMultiplier = parseFloat(e.target.value); });

// Helpers
function rand(min, max) { return Math.random() * (max - min) + min; }

// Entity factory
function createEntity(kind, x, y) {
  const e = {
    kind: kind || typeSelect.value,
    x: x || rand(50, W - 50),
    y: y || rand(50, H - 50),
    vx: rand(-60, 60),
    vy: rand(-60, 60),
    size: rand(22, 48),
    age: 0,
    turn: 0
  };
  const s = Math.sqrt(e.vx * e.vx + e.vy * e.vy) || 40;
  e.vx = e.vx / s * rand(20, 80);
  e.vy = e.vy / s * rand(20, 80);
  return e;
}

// Spawning
function trySpawn(now) {
  if (now - lastSpawn > SPAWN_INTERVAL_MS && entities.length < MAX_ENTITIES) {
    entities.push(createEntity(typeSelect.value));
    lastSpawn = now;
  }
}

// Input handlers
function getCanvasCoords(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

function onPointerDown(x, y) {
  pointer.x = x; pointer.y = y;
  pointer.active = true;
  entities.push(createEntity(typeSelect.value, x, y));
}
function onPointerMove(x, y) { pointer.x = x; pointer.y = y; }
function onPointerUp() { pointer.active = false; }

// Mouse
canvas.addEventListener('mousedown', e => {
  const coords = getCanvasCoords(e);
  onPointerDown(coords.x, coords.y);
});
canvas.addEventListener('mousemove', e => {
  const coords = getCanvasCoords(e);
  onPointerMove(coords.x, coords.y);
});
window.addEventListener('mouseup', onPointerUp);

// Touch
canvas.addEventListener('touchstart', e => {
  if (e.touches.length > 0) {
    e.preventDefault();
    const coords = getCanvasCoords(e.touches[0]);
    onPointerDown(coords.x, coords.y);
  }
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  if (e.touches.length > 0) {
    e.preventDefault();
    const coords = getCanvasCoords(e.touches[0]);
    onPointerMove(coords.x, coords.y);
  }
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  onPointerUp();
}, { passive: false });

// Resize
window.addEventListener('resize', () => {
  W = canvas.width = canvas.parentElement.clientWidth;
  H = canvas.height = canvas.parentElement.clientHeight;
});

// Draw helpers
function drawFish(e, rot) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(rot);
  const s = e.size / 20;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.size * 0.6, e.size * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ff8c69'; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-e.size * 0.6, 0);
  ctx.lineTo(-e.size * 0.95, -e.size * 0.5 * s);
  ctx.lineTo(-e.size * 0.95, e.size * 0.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(e.size * 0.2, -e.size * 0.12, Math.max(2, e.size * 0.09), 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath();
  ctx.arc(e.size * 0.22, -e.size * 0.12, Math.max(1, e.size * 0.045), 0, Math.PI * 2);
  ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();
}

function drawDot(e) {
  ctx.beginPath();
  ctx.arc(e.x, e.y, Math.max(6, e.size * 0.2), 0, Math.PI * 2);
  ctx.fillStyle = '#ff2d55';
  ctx.fill();
}

// Update physics
function updateEntity(e, dt) {
  if (pointer.active) {
    const d = Math.max(10, Math.hypot(pointer.x - e.x, pointer.y - e.y));
    const pull = 2000 / (d * d);
    e.vx += (pointer.x - e.x) * pull * dt * 0.8;
    e.vy += (pointer.y - e.y) * pull * dt * 0.8;
  } else {
    e.vx += Math.sin(e.age * 0.001 + e.turn) * 6 * dt;
    e.vy += Math.cos(e.age * 0.001 + e.turn) * 6 * dt;
  }

  const maxSpeed = 220 * speedMultiplier;
  const sp = Math.hypot(e.vx, e.vy);
  if (sp > maxSpeed) { 
    e.vx = e.vx / sp * maxSpeed; 
    e.vy = e.vy / sp * maxSpeed; 
  }

  e.x += e.vx * dt;
  e.y += e.vy * dt;
  e.age += dt * 1000;

  if (e.x < -60) e.x = W + 60;
  if (e.x > W + 60) e.x = -60;
  if (e.y < -60) e.y = H + 60;
  if (e.y > H + 60) e.y = -60;
}

// Main loop
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!paused) {
    trySpawn(now);
    for (let i = entities.length - 1; i >= 0; --i) {
      const e = entities[i];
      updateEntity(e, dt);
      if (e.age > 120000) entities.splice(i, 1);
    }
  }

  ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(10,16,28,0.6)');
  g.addColorStop(1, 'rgba(4,8,16,0.95)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  for (const e of entities) {
    const angle = Math.atan2(e.vy, e.vx);
    if (e.kind === 'fish') { drawFish(e, angle); } else { drawDot(e); }
  }

  if (pointer.active) {
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  requestAnimationFrame(loop);
}

// Initial setup
for (let i = 0; i < 6; i++) entities.push(createEntity('fish'));
requestAnimationFrame(loop);

// Hide hint on first interaction
const hint = document.getElementById('touchHint');
['mousedown', 'touchstart'].forEach(ev => {
  window.addEventListener(ev, () => { hint.style.display = 'none'; }, { once: true });
});

// Pause on background
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  pauseBtn.textContent = paused ? 'Continuar' : 'Pausar';
});
