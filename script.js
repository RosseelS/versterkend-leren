// haal canvas op
const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext("2d");

// haal buttons op
const upButton = document.getElementById("up-button");
const downButton = document.getElementById("down-button");
const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");
const pickupButton = document.getElementById("pickup-button");

const buttons = [upButton, downButton, leftButton, rightButton, pickupButton];

// settings van het grid
const gridSize = 15;
let squareSize;
const grid = [];

let message = null;
let level = 1;
let amountBlueSquares = 5;
let amountYellowSquares = 2;
let sidesTouched = { bottom: false, top: false, left: false, right: false };
let amountOfSides = 0;

let playerX = Math.floor(gridSize / 2);
let playerY = gridSize - 2;
let fontSize = 150;

const playerColor = "#ff6487";
const blueSquareColor = "#00c8ff";
const borderColor = "#474163";
const greenSquareColor = "#5ca960";
const yellowSquareColor = "#fedf44";

// functie om canvas, grid en font in te stellen
function setupCanvas() {
  if (window.innerWidth > 768) {
    // pc
    gameCanvas.width = 500;
    gameCanvas.height = 500;
    fontSize = 150;
  } else {
    // mobiel
    gameCanvas.width = 400;
    gameCanvas.height = 400;
    fontSize = 100;
  }

  squareSize = gameCanvas.width / gridSize;

  // grid opnieuw vullen
  grid.length = 0;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid.push({ x: x * squareSize, y: y * squareSize });
    }
  }
}

// genereer blauwe en gele squares zonder overlap
const generateSquares = (numBlue, numYellow) => {
  const blue = [];
  const yellow = [];

  while (blue.length < numBlue || yellow.length < numYellow) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);

    if (x === playerX && y === playerY) continue; // startpositie speler
    if (y === 0) continue; // bovenste rij niet gebruiken
    if (level === 3 || level === 6) {
      if (y >= 1 && y <= 4) continue;
    }

    const occupied = [...blue, ...yellow].some((s) => s.x === x && s.y === y);
    if (occupied) continue;

    if (blue.length < numBlue) blue.push({ x, y });
    else if (yellow.length < numYellow) yellow.push({ x, y });
  }

  if (level === 3 || level === 6) {
    const blueSea = [];
    for (let y = 2; y <= 4; y++) {
      for (let x = 0; x < gridSize; x++) {
        blueSea.push({ x, y });
      }
    }
    blueSea.forEach((s) => blue.push(s));
  }

  return { blue, yellow };
};

// initialiseer squares
let { blue: blueSquares, yellow: yellowSquares } = generateSquares(
  amountBlueSquares,
  amountYellowSquares,
);

// teken een vakje
const colorSquare = (x, y, color) => {
  const index = y * gridSize + x;
  const square = grid[index];

  ctx.fillStyle = color;
  ctx.fillRect(square.x + 0.5, square.y + 0.5, squareSize - 1, squareSize - 1);
};

// toon bericht in het midden
const showMessage = (text) => {
  message = { text };
  drawGrid();

  setTimeout(() => {
    message = null;
    drawGrid();
  }, 2000);
};

// reset game functie
const resetGame = () => {
  playerX = Math.floor(gridSize / 2);
  playerY = gridSize - 2;

  const squares = generateSquares(amountBlueSquares, amountYellowSquares);
  blueSquares = squares.blue;
  yellowSquares = squares.yellow;

  amountOfSides = 0;
  sidesTouched = { bottom: false, top: false, left: false, right: false };

  buttons.forEach((button) => (button.disabled = false));

  drawGrid();
};

// check of speler op blauw vakje staat
const checkBlue = () => {
  if (blueSquares.some((b) => b.x === playerX && b.y === playerY)) {
    buttons.forEach((button) => (button.disabled = true));

    showMessage("X");
    setTimeout(() => {
      resetGame();
      showMessage(level);
    }, 2000);
  }
};

// check of speler op geel vakje staat
const checkYellow = () => {
  const index = yellowSquares.findIndex(
    (y) => y.x === playerX && y.y === playerY,
  );
  if (index !== -1) yellowSquares.splice(index, 1);
};

// check welke kanten speler raakt
const checkSide = () => {
  if (playerX === 0 && !sidesTouched.left) {
    amountOfSides++;
    sidesTouched.left = true;
  }
  if (playerY === 0 && !sidesTouched.top) {
    amountOfSides++;
    sidesTouched.top = true;
  }
  if (playerY === gridSize - 1 && !sidesTouched.bottom) {
    amountOfSides++;
    sidesTouched.bottom = true;
  }
  if (playerX === gridSize - 1 && !sidesTouched.right) {
    amountOfSides++;
    sidesTouched.right = true;
  }
};

// check of speler heeft gewonnen
const checkWin = () => {
  if (playerY !== 0) return;

  const isGreen = level <= 3 || (level === 4 && playerX % 2 === 0);

  const isRed = level >= 5 || (level === 4 && playerX % 2 !== 0);

  // groene vakjes = direct winnen
  if (isGreen) {
    winLevel();
  }

  // rode vakjes = 4 kanten nodig
  if (isRed && amountOfSides === 4) {
    winLevel();
  }
};

const winLevel = () => {
  buttons.forEach((button) => (button.disabled = true));

  const stars = "★".repeat(amountOfSides) + "☆".repeat(4 - amountOfSides);
  showMessage(stars);

  setTimeout(() => {
    showMessage("✓");

    setTimeout(() => {
      // LEVEL 6 = GAME WIN
      if (level === 6) {
        showMessage("♛");
        return; // stopt het spel hier
      }

      level++;

      if (level === 2) {
        amountBlueSquares = 10;
        amountYellowSquares = 3;
      }

      if (level === 3) {
        amountBlueSquares = 15;
        amountYellowSquares = 5;
      }

      if (level === 6) {
        amountBlueSquares = 20;
        amountYellowSquares = 6;
      }

      showMessage(level);
      resetGame();
    }, 2000);
  }, 1000);
};

// teken grid
const drawGrid = () => {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  for (let x = 0; x < gridSize; x++) {
    if (level <= 3) {
      colorSquare(x, 0, greenSquareColor);
    } else if (level === 4) {
      if (x % 2 === 0) colorSquare(x, 0, greenSquareColor);
      else colorSquare(x, 0, "#dd3e3e");
    } else {
      colorSquare(x, 0, "#dd3e3e");
    }
  }

  for (const b of blueSquares) colorSquare(b.x, b.y, blueSquareColor);
  for (const y of yellowSquares) colorSquare(y.x, y.y, yellowSquareColor);
  colorSquare(playerX, playerY, playerColor);

  // grid lijnen
  for (const square of grid) {
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(square.x, square.y, squareSize, squareSize);
  }

  // message in het midden
  if (message) {
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message.text, gameCanvas.width / 2, gameCanvas.height / 2);
  }
};

// speler bewegen
const movePlayer = (dx, dy) => {
  const newX = playerX + dx;
  const newY = playerY + dy;

  if (newX >= 0 && newX < gridSize) playerX = newX;
  if (newY >= 0 && newY < gridSize) playerY = newY;

  checkSide();
  if (yellowSquares.length > 0) checkBlue();
  checkWin();
  drawGrid();
};

// Event listeners
upButton.addEventListener("click", () => movePlayer(0, -1));
downButton.addEventListener("click", () => movePlayer(0, 1));
leftButton.addEventListener("click", () => movePlayer(-1, 0));
rightButton.addEventListener("click", () => movePlayer(1, 0));
pickupButton.addEventListener("click", () => checkYellow());

// setup canvas en start game
setupCanvas();
drawGrid();
showMessage(level);

// update canvas bij resize
window.addEventListener("resize", () => {
  setupCanvas();
  drawGrid();
});
