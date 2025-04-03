


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const background = new Image(); background.src = '/background.png';
const hedgehogImg = new Image(); hedgehogImg.src = '/hedgehog.png';
const signImg = new Image(); signImg.src = '/sign.png';

const jumpSound = document.getElementById('jumpSound');
const weideMusic = document.getElementById('weideMusic');
const scoreDisplay = document.getElementById('scoreDisplay');
const startMessage = document.getElementById('startMessage');

let hedgehog = { x: 100, y: 0, width: 180, height: 180, vy: 0, gravity: 1.2, jumping: false };
let groundY = canvas.height - hedgehog.height - 20;
hedgehog.y = groundY;

let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("tomo_high_score") || 0;
let obstacles = [];
let lastObstacleTime = 0;
let obstacleCooldown = 1500;

function drawBackground() { ctx.drawImage(background, 0, 0, canvas.width, canvas.height); }
function drawHedgehog() { ctx.drawImage(hedgehogImg, hedgehog.x, hedgehog.y, hedgehog.width, hedgehog.height); }
function drawObstacle(ob) { ctx.drawImage(signImg, ob.x, ob.y, ob.width, ob.height); }

function updateGame() {
  if (!gameStarted || gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (hedgehog.jumping) {
    hedgehog.vy += hedgehog.gravity;
    hedgehog.y += hedgehog.vy;
    if (hedgehog.y >= groundY) {
      hedgehog.y = groundY;
      hedgehog.vy = 0;
      hedgehog.jumping = false;
    }
  }

  if (Date.now() - lastObstacleTime > obstacleCooldown && Math.random() < 0.85) {
    obstacles.push({ x: canvas.width, y: groundY + 10, width: 100, height: 130 });
    lastObstacleTime = Date.now();
    obstacleCooldown = Math.floor(1200 + Math.random() * 1000);
  }

  obstacles = obstacles.filter(ob => ob.x + ob.width > 0);
  for (let ob of obstacles) {
    ob.x -= 6;
    drawObstacle(ob);
    if (
      hedgehog.x < ob.x + ob.width &&
      hedgehog.x + hedgehog.width > ob.x &&
      hedgehog.y + hedgehog.height > ob.y
    ) {
      gameOver = true;
      weideMusic.play();
      alert('Game Over! Your score: ' + score);
      if (score > highScore) {
        localStorage.setItem("tomo_high_score", score);
        alert("🎉 New High Score!");
      }
      location.reload();
    }
  }

  drawHedgehog();
  score++;
  scoreDisplay.innerText = "Score: " + score;
  requestAnimationFrame(updateGame);
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!gameStarted) {
      gameStarted = true;
      startMessage.remove();
      updateGame();
    } else if (!hedgehog.jumping && !gameOver) {
      hedgehog.vy = -32;
      hedgehog.jumping = true;
      jumpSound.play();
    }
  }
});

document.getElementById("closeRules").onclick = () => {
  document.getElementById("rulesModal").style.display = "none";
};

document.getElementById("connectWalletBtn").onclick = async () => {
  try {
    const wallet = await window.tomoConnect();
    alert("✅ Wallet connected: " + wallet.address);
  } catch (e) {
    alert("❌ Wallet connection failed.");
    console.error(e);
  }
};

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = canvas.height - hedgehog.height - 20;
  if (!hedgehog.jumping) hedgehog.y = groundY;
});

background.onload = () => {
  drawBackground();
  drawHedgehog();
};
