const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const state = {
  running: false,
  gameOver: false,
  bird: {
    x: 90,
    y: 200,
    radius: 14,
    velocity: 0,
  },
  gravity: 0.45,
  lift: -7.5,
  pipes: [],
  frame: 0,
  score: 0,
};

const pipeSettings = {
  width: 60,
  gap: 150,
  spacing: 200,
  minHeight: 60,
};

const resetGame = () => {
  state.running = false;
  state.gameOver = false;
  state.bird.y = 200;
  state.bird.velocity = 0;
  state.pipes = [];
  state.frame = 0;
  state.score = 0;
  scoreEl.textContent = "0";
  statusEl.textContent = "Press space or click to start.";
  draw();
};

const startGame = () => {
  if (state.gameOver) {
    resetGame();
  }
  if (!state.running) {
    state.running = true;
    statusEl.textContent = "";
  }
};

const jump = () => {
  startGame();
  if (!state.gameOver) {
    state.bird.velocity = state.lift;
  }
};

const spawnPipe = () => {
  const availableHeight = canvas.height - pipeSettings.gap - pipeSettings.minHeight * 2;
  const topHeight =
    pipeSettings.minHeight + Math.random() * availableHeight;

  state.pipes.push({
    x: canvas.width + pipeSettings.width,
    top: topHeight,
    passed: false,
  });
};

const update = () => {
  if (!state.running || state.gameOver) {
    return;
  }

  state.frame += 1;
  state.bird.velocity += state.gravity;
  state.bird.y += state.bird.velocity;

  if (state.frame % pipeSettings.spacing === 0) {
    spawnPipe();
  }

  state.pipes.forEach((pipe) => {
    pipe.x -= 2.5;
  });

  state.pipes = state.pipes.filter((pipe) => pipe.x + pipeSettings.width > -10);

  checkCollisions();
};

const checkCollisions = () => {
  const bird = state.bird;

  if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
    endGame();
    return;
  }

  state.pipes.forEach((pipe) => {
    const withinX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeSettings.width;
    const hitTop = bird.y - bird.radius < pipe.top;
    const hitBottom = bird.y + bird.radius > pipe.top + pipeSettings.gap;

    if (withinX && (hitTop || hitBottom)) {
      endGame();
    }

    if (!pipe.passed && pipe.x + pipeSettings.width < bird.x) {
      pipe.passed = true;
      state.score += 1;
      scoreEl.textContent = state.score.toString();
    }
  });
};

const endGame = () => {
  state.gameOver = true;
  state.running = false;
  statusEl.textContent = "Game over! Press restart or space to try again.";
};

const drawBird = () => {
  const { x, y, radius } = state.bird;
  ctx.save();
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1d2b3a";
  ctx.beginPath();
  ctx.arc(x + 5, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + radius + 10, y - 4);
  ctx.lineTo(x + radius + 10, y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawPipes = () => {
  ctx.fillStyle = "#4cb673";
  state.pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, pipeSettings.width, pipe.top);
    ctx.fillRect(
      pipe.x,
      pipe.top + pipeSettings.gap,
      pipeSettings.width,
      canvas.height - pipe.top - pipeSettings.gap,
    );
  });
};

const drawGround = () => {
  ctx.fillStyle = "#7bd19a";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPipes();
  drawGround();
  drawBird();
};

const loop = () => {
  update();
  draw();
  requestAnimationFrame(loop);
};

restartBtn.addEventListener("click", resetGame);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  jump();
});

resetGame();
loop();
