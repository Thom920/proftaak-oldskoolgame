// Variabelen voor het doolhof
let gridSize = 30; // Grootte van elk 'vakje' in het doolhof
let grid; // 2D array representatie van het doolhof
let mazeWidth, mazeHeight; // Afmetingen van het doolhof in vakjes
let canvasWidth, canvasHeight; // Afmetingen van het canvas in pixels

// Representatie van het doolhof (0: leeg, 1: muur, 2: klein bolletje, 3: groot bolletje, 4: spookhuis)
let initialGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 3, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 1, 1, 2, 1, 4, 4, 4, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 4, 1, 4, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 4, 4, 4, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 2, 1],
  [1, 1, 2, 1, 2, 2, 2, 0, 2, 2, 2, 1, 2, 1, 1],
  [1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1, 1, 2, 1],
  [1, 3, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Spelersvariabelen
let pacman;
let pacmanSize = gridSize * 0.9;
let pacmanSpeed = 2; // Snelheid in pixels per frame

// Geest variabelen
let ghosts = [];
let ghostSize = gridSize * 0.9;
let ghostSpeed = 1.5;

// Spelstatus variabelen
let score = 0;
let lives = 3;
let gameState = "start"; // Mogelijkheden: 'start', 'playing', 'game over', 'level complete'
let pelletsRemaining;

// Bonus item variabelen
let bonusItem = null;
let bonusItemPosition = { x: -1, y: -1 }; // Grid positie van het bonus item
let bonusItemSpawnTimer = 0;
let bonusItemDuration = 10 * 60; // Duur dat het bonus item zichtbaar is (frames)

// Variabelen voor animatie (mond open/dicht)
let pacmanMouthAngle = 45; // Hoek van de mond in graden
let mouthSpeed = 5; // Hoe snel de mond opent/sluit
let mouthDirection = -1; // -1: sluit, 1: opent

// Locaties van spookhuis en tunnel
let ghostHousePos = { x: 7, y: 4 }; // Midden van het spookhuis in grid coördinaten
let tunnelRow = 9; // De rij waar de tunnels zich bevinden

function activatePowerPellet() {
  // Maak alle geesten kwetsbaar
  for (let ghost of ghosts) {
    ghost.isVulnerable = true;
    ghost.vulnerableTimer = ghost.frightenedDuration;
    ghost.state = "frightened";
    ghost.isFlashing = false;
    ghost.flashState = false;
  }
}


// ====== p5.js preload functie (voor het laden van assets) ======
function preload() { }

// ====== p5.js setup functie ======
function setup() {
  mazeHeight = initialGrid.length;
  mazeWidth = initialGrid[0].length;
  canvasWidth = mazeWidth * gridSize;
  canvasHeight = mazeHeight * gridSize;

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("game-container"); // Plaats het canvas in de game-container div

  // Zet de framerate (standaard is 60)
  // frameRate(60);

  // Initialiseer het doolhof en tel het aantal bolletjes
  resetGrid();
  pelletsRemaining = countPellets();

  // Initialiseer Pac-Man (vind een startpositie - nu een lege cel dichtbij start)
  let pacmanStartPos = findStartPosition(0) || findStartPosition(2); // Zoek een leeg vakje om te starten
  if (pacmanStartPos) {
    pacman = new PacMan(pacmanStartPos.x, pacmanStartPos.y);
  } else {
    console.error("Kon geen startpositie vinden voor Pac-Man.");
    gameState = "error"; // Handel dit af indien nodig
  }

  // Initialiseer geesten (plaats ze op een startpositie, bijv. in het spookhuis als dat er is)
  // We plaatsen ze in het spookhuis vakje (type 4)
  let ghostStart = findStartPosition(4);
  if (ghostStart) {
    for (let i = 0; i < 4; i++) {
      // 4 geesten
      ghosts.push(new Ghost(ghostStart.x, ghostStart.y, i)); // Geef elke geest een unieke ID
    }
  } else {
    console.error("Kon geen startpositie vinden voor geesten.");
    gameState = "error";
  }
}

// ====== p5.js draw functie ======
function draw() {
  background(0); // Zwarte achtergrond

  if (gameState === "start") {
    displayStartScreen();
  } else if (gameState === "playing") {
    update();
    display();
  } else if (gameState === "game over") {
    displayGameOver();
  } else if (gameState === "level complete") {
    displayLevelComplete();
  }
  // Voeg een error state toe voor debugging
  if (gameState === "error") {
    background(255, 0, 0); // Rode achtergrond voor fout
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Fout bij het initialiseren!", width / 2, height / 2);
  }

  updateScoreDisplay();
  updateLivesDisplay();
}

// ====== Hoofd game logic update functie ======
function update() {
  // Update Pac-Man
  if (pacman) {
    pacman.move();
    pacman.checkPelletCollision();
    pacman.checkWallCollision(); // Nodig voor de beoogde richting check
    pacman.updateAnimation(); // Update mond animatie
    pacman.checkTunnel(); // Controleer tunnels
  }

  // Update geesten
  for (let i = 0; i < ghosts.length; i++) {
    let ghost = ghosts[i];
    ghost.move();
    // Botsingsdetectie met muren wordt binnen de geest move() afgehandeld
    ghost.updateState(); // Update geest state (chase/scatter/frightened)
    ghost.checkTunnel(); // Controleer tunnels

    // Controleer botsing tussen Pac-Man en geest
    if (pacman && ghost.collidesWith(pacman)) {
      if (ghost.isVulnerable) {
        // Geest opeten
        if (ghost.state !== "eaten") {
          // Alleen opeten als niet al opgegeten is in deze kwetsbaarheidsperiode
          score += 100 * (i + 1); // Hogere score voor opeenvolgende geesten (simpele bonus)
          ghost.state = "eaten"; // Geest gaat terug naar spookhuis
        }
      } else if (ghost.state !== "eaten") {
        // Alleen gepakt worden als geest niet kwetsbaar of opgegeten is
        // Pac-Man verliest leven
        loseLife();
        break; // Stop de loop, Pac-Man is al gepakt
      }
    }
  }

  // Update bonus item timer en spawnen
  bonusItemSpawnTimer++;
  if (bonusItem === null && bonusItemSpawnTimer > 30 * 60) {
    // Spawn bonus item na 30 seconden (voorbeeld)
    spawnBonusItem();
    bonusItemSpawnTimer = 0; // Reset timer
  }
  if (bonusItem) {
    bonusItem.update();
    if (bonusItem.isCollected || bonusItem.isExpired()) {
      bonusItem = null; // Verwijder bonus item
    } else if (pacman && bonusItem.collidesWith(pacman)) {
      bonusItem.collect();
      score += bonusItem.points; // Voeg bonuspunten toe
    }
  }

  // Controleer win conditie
  if (pelletsRemaining === 0) {
    gameState = "level complete";
  }

  // Controleer game over conditie (gebeurt in loseLife)
}

// ====== Display functies ======

function display() {
  drawMaze();
  if (pacman) pacman.display();
  for (let ghost of ghosts) {
    ghost.display();
  }
  if (bonusItem) {
    bonusItem.display();
  }
}

function drawMaze() {
  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      let type = grid[y][x];
      let px = x * gridSize;
      let py = y * gridSize;

      if (type === 1) {
        // Muur
        fill(0, 0, 255); // Blauwe muren
        noStroke();
        rect(px, py, gridSize, gridSize);
      } else if (type === 2) {
        // Klein bolletje
        fill(255, 255, 0); // Gele bolletjes
        noStroke();
        ellipse(
          px + gridSize / 2,
          py + gridSize / 2,
          gridSize / 5,
          gridSize / 5
        );
      } else if (type === 3) {
        // Groot bolletje
        fill(255, 255, 0); // Gele bolletjes
        noStroke();
        ellipse(
          px + gridSize / 2,
          py + gridSize / 2,
          gridSize / 2.5,
          gridSize / 2.5
        );
      } else if (type === 4) {
        // Spookhuis (teken als lege ruimte met andere kleur?)
        fill(50); // Grijze achtergrond voor spookhuis
        noStroke();
        rect(px, py, gridSize, gridSize);
        // Optioneel: teken een lijn aan de bovenkant van het spookhuis
        stroke(255);
        line(px, py, px + gridSize, py);
      } else if (type === 5) {
        // Tunnel (teken als lege ruimte)
        fill(0); // Zwarte achtergrond voor tunnels
        noStroke();
        rect(px, py, gridSize, gridSize);
      }
      // Type 0 (lege ruimte) wordt getekend door de zwarte achtergrond van de canvas.
    }
  }
}

function displayStartScreen() {
  background(0);
  fill(255, 255, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("PAC-MAN", width / 2, height / 2 - 50);
  textSize(24);
  text("Druk op Enter om te starten", width / 2, height / 2 + 50);
  text("Gebruik de pijltjestoetsen", width / 2, height / 2 + 90);
}

function displayGameOver() {
  background(0);
  fill(255, 0, 0);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Game Over!", width / 2, height / 2 - 30);
  fill(255);
  textSize(24);
  text("Score: " + score, width / 2, height / 2 + 10);
  text("Druk op Enter om opnieuw te spelen", width / 2, height / 2 + 50);
}

function displayLevelComplete() {
  background(0);
  fill(0, 255, 0);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Niveau Voltooid!", width / 2, height / 2 - 30);
  fill(255);
  textSize(24);
  text("Score: " + score, width / 2, height / 2 + 10);
  text(
    "Druk op Enter voor het volgende niveau (niet geïmplementeerd)",
    width / 2,
    height / 2 + 50
  );
}

// ====== Helper functies ======

function countPellets() {
  let count = 0;
  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      if (grid[y][x] === 2 || grid[y][x] === 3) {
        count++;
      }
    }
  }
  return count;
}

function updateScoreDisplay() {
  document.getElementById("score").innerText = "Score: " + score;
}

function updateLivesDisplay() {
  document.getElementById("lives").innerText = "Levens: " + lives;
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    gameState = "game over";
  } else {
    // Reset Pac-Man en geesten naar startposities
    resetCharacters();
    // Geesten zijn niet kwetsbaar na een leven verliezen
    for (let ghost of ghosts) {
      ghost.isVulnerable = false;
      ghost.vulnerableTimer = 0;
      ghost.state = "scatter"; // Reset staat
    }
  }
}

// Vind een startpositie (gecentreerd in een vakje)
function findStartPosition(allowedType) {
  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      if (initialGrid[y][x] === allowedType) {
        return {
          x: x * gridSize + gridSize / 2,
          y: y * gridSize + gridSize / 2,
        };
      }
    }
  }
  return null; // Geen geschikte startpositie gevonden
}

// Reset Pac-Man en geesten naar hun startposities
function resetCharacters() {
  let pacmanStartPos = findStartPosition(0); // Pac-Man start op een leeg vakje
  if (pacmanStartPos) {
    pacman = new PacMan(pacmanStartPos.x, pacmanStartPos.y);
  } else {
    console.error("Kon geen Pac-Man start vinden bij reset.");
  }

  let ghostStart = findStartPosition(4); // Geesten starten in het spookhuis
  if (ghostStart) {
    ghosts = []; // Leeg de geesten array
    for (let i = 0; i < 4; i++) {
      ghosts.push(new Ghost(ghostStart.x, ghostStart.y, i));
    }
  } else {
    console.error("Kon geen geest start vinden bij reset.");
  }
}

// Spawnen van een bonus item op een willekeurige lege locatie
function spawnBonusItem() {
  let emptyCells = [];
  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      // Zoek een lege cel die geen muur, bolletje, spookhuis of tunnel is
      if (initialGrid[y][x] === 0) {
        let isOccupied = false;
        // Controleer of Pac-Man of een geest al in dit vakje is
        if (
          pacman &&
          dist(
            pacman.x,
            pacman.y,
            x * gridSize + gridSize / 2,
            y * gridSize + gridSize / 2
          ) < gridSize
        ) {
          isOccupied = true;
        }
        for (let ghost of ghosts) {
          if (
            dist(
              ghost.x,
              ghost.y,
              x * gridSize + gridSize / 2,
              y * gridSize + gridSize / 2
            ) < gridSize
          ) {
            isOccupied = true;
            break;
          }
        }

        if (!isOccupied) {
          emptyCells.push({ x: x, y: y });
        }
      }
    }
  }

  if (emptyCells.length > 0) {
    let randomIndex = floor(random(emptyCells.length));
    let pos = emptyCells[randomIndex];
    bonusItemPosition = pos; // Sla de grid positie op
    bonusItem = new BonusItem(
      pos.x * gridSize + gridSize / 2,
      pos.y * gridSize + gridSize / 2,
      100
    ); // 100 punten waard
    console.log("Bonus item gespawnd op:", pos);
  } else {
    console.log("Geen lege plek gevonden om bonus item te spawnen.");
  }
}

// ====== Event Listener voor toetsenbord input ======
function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    startGame();
  } else if (gameState === "playing" && pacman) {
    if (keyCode === LEFT_ARROW) {
      pacman.setDirection(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
      pacman.setDirection(1, 0);
    } else if (keyCode === UP_ARROW) {
      pacman.setDirection(0, -1);
    } else if (keyCode === DOWN_ARROW) {
      pacman.setDirection(0, 1);
    }
  } else if (gameState === "game over" && keyCode === ENTER) {
    resetGame();
  }
  // Voeg een reset voor level complete toe indien je meerdere niveaus hebt
  else if (gameState === "level complete" && keyCode === ENTER) {
    // TODO: Ga naar volgend niveau (niet geïmplementeerd)
    resetGame(); // Voor nu, begin opnieuw
  }
}

// Functie om het spel te starten
function startGame() {
  gameState = "playing";
}

// Functie om het spel opnieuw te starten
function resetGame() {
  score = 0;
  lives = 3;
  gameState = "playing";
  resetGrid(); // Reset het doolhof
  pelletsRemaining = countPellets();
  resetCharacters(); // Reset Pac-Man en geesten
  bonusItem = null; // Verwijder bonus item
  bonusItemSpawnTimer = 0; // Reset bonus item timer
}

// Reset het doolhof naar de initiële staat
function resetGrid() {
  grid = JSON.parse(JSON.stringify(initialGrid));
  // Zorg ervoor dat spookhuis en tunnels weer correct worden ingesteld
  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      if (initialGrid[y][x] === 4) {
        grid[y][x] = 4; // Zet spookhuis terug
      } else if (initialGrid[y][x] === 5) {
        grid[y][x] = 5; // Zet tunnel terug
      }
    }
  }
}

// ====== Pac-Man Klasse ======
class PacMan {
  constructor(x, y) {
    this.initialX = x; // Voor reset
    this.initialY = y;
    this.x = x; // x-positie (midden)
    this.y = y; // y-positie (midden)
    this.dirX = 0; // Bewegingsrichting x
    this.dirY = 0; // Bewegingsrichting y
    this.intendedDirX = 0; // Gewenste bewegingsrichting x (voor soepele bochten)
    this.intendedDirY = 0; // Gewenste bewegingsrichting y
    this.speed = pacmanSpeed;
  }

  setDirection(dirX, dirY) {
    this.intendedDirX = dirX;
    this.intendedDirY = dirY;
  }

  move() {
    // Controleer of de beoogde richting mogelijk is (niet in een muur)
    // Dit checkt of er in de *volgende* stap (met beoogde richting) een muur is
    if (this.canMoveInDirection(this.intendedDirX, this.intendedDirY)) {
      this.dirX = this.intendedDirX;
      this.dirY = this.intendedDirY;
    }

    // Verplaats Pac-Man in de huidige richting
    let newX = this.x + this.dirX * this.speed;
    let newY = this.y + this.dirY * this.speed;

    // Controleer nogmaals op muurbotsing voor de daadwerkelijke verplaatsing
    if (!this.checkWallCollisionAt(newX, newY)) {
      this.x = newX;
      this.y = newY;
    } else {
      // Stop als er een muur is
      this.dirX = 0;
      this.dirY = 0;
    }
  }

  // Controleert of Pac-Man in een bepaalde richting kan bewegen zonder muurbotsing
  canMoveInDirection(dirX, dirY) {
    let testX = this.x + dirX * this.speed;
    let testY = this.y + dirY * this.speed;
    return !this.checkWallCollisionAt(
      testX + (dirX * pacmanSize) / 2,
      testY + (dirY * pacmanSize) / 2
    );
  }

  checkWallCollisionAt(testX, testY) {
    // Bepaal de 4 hoekpunten van de Pac-Man bounding box voor de testpositie
    let left = testX - pacmanSize / 2;
    let right = testX + pacmanSize / 2;
    let top = testY - pacmanSize / 2;
    let bottom = testY + pacmanSize / 2;

    // Converteer hoekpunten naar grid coördinaten
    let gridX1 = floor(left / gridSize);
    let gridY1 = floor(top / gridSize);
    let gridX2 = floor((right - 1) / gridSize); // -1 om binnen het vakje te blijven
    let gridY2 = floor((bottom - 1) / gridSize);

    // Controleer de 4 hoeken van de bounding box van Pac-Man
    // Zorg ervoor dat de grid coördinaten binnen de grenzen vallen
    if (
      gridX1 < 0 ||
      gridX1 >= mazeWidth ||
      gridY1 < 0 ||
      gridY1 >= mazeHeight ||
      gridX2 < 0 ||
      gridX2 >= mazeWidth ||
      gridY2 < 0 ||
      gridY2 >= mazeHeight
    ) {
      // Als een deel buiten de grenzen is, maar het is geen tunnelvakje, behandel het als een muur
      if (
        gridY1 !== tunnelRow ||
        gridY2 !== tunnelRow ||
        gridX1 < -1 ||
        gridX2 >= mazeWidth + 1
      ) {
        // Check ook of we niet in de tunnel rij zijn
        return true;
      }
    }

    // Controleer of een van de 4 hoekpunten zich in een muurvakje bevindt
    if (
      gridX1 >= 0 &&
      gridY1 >= 0 &&
      gridY1 < mazeHeight &&
      gridX1 < mazeWidth &&
      grid[gridY1][gridX1] === 1
    )
      return true;
    if (
      gridX2 >= 0 &&
      gridY1 >= 0 &&
      gridY1 < mazeHeight &&
      gridX2 < mazeWidth &&
      grid[gridY1][gridX2] === 1
    )
      return true;
    if (
      gridX1 >= 0 &&
      gridY2 >= 0 &&
      gridY2 < mazeHeight &&
      gridX1 < mazeWidth &&
      grid[gridY2][gridX1] === 1
    )
      return true;
    if (
      gridX2 >= 0 &&
      gridY2 >= 0 &&
      gridY2 < mazeHeight &&
      gridX2 < mazeWidth &&
      grid[gridY2][gridX2] === 1
    )
      return true;

    return false;
  }

  checkPelletCollision() {
    // Bepaal het grid vakje waar het *midden* van Pac-Man zich bevindt
    let gridX = floor(this.x / gridSize);
    let gridY = floor(this.y / gridSize);

    // Controleer het vakje waar Pac-Man zich bevindt
    if (gridX >= 0 && gridX < mazeWidth && gridY >= 0 && gridY < mazeHeight) {
      if (grid[gridY][gridX] === 2) {
        // Klein bolletje
        grid[gridY][gridX] = 0; // Verwijder het bolletje
        score += 10;
        pelletsRemaining--;
      } else if (grid[gridY][gridX] === 3) {
        // Groot bolletje
        grid[gridY][gridX] = 0; // Verwijder het bolletje
        score += 50;
        pelletsRemaining--;
        activatePowerPellet(); // Activeer power pellet effect
      }
    }
  }

  // Controleer voor tunnels en teleporteer Pac-Man
  checkTunnel() {
    // Controleer of Pac-Man zich op de tunnelrij bevindt
    if (Math.round(this.y / gridSize) === tunnelRow) {
      if (this.x < -pacmanSize / 2) {
        this.x = canvasWidth + pacmanSize / 2;
      } else if (this.x > canvasWidth + pacmanSize / 2) {
        this.x = -pacmanSize / 2;
      }
    }
  }

  updateAnimation() {
    // Update de mond animatie
    if (this.dirX !== 0 || this.dirY !== 0) {
      // Alleen animeren als Pac-Man beweegt
      pacmanMouthAngle += mouthDirection * mouthSpeed;

      // Keer de richting van de animatie om als de mond volledig open of gesloten is
      if (pacmanMouthAngle >= 45 || pacmanMouthAngle <= 0) {
        mouthDirection *= -1;
      }
    } else {
      // Houd de mond open als Pac-Man stilstaat
      pacmanMouthAngle = 45;
    }
  }

  display() {
    fill(255, 255, 0); // Geel
    noStroke();

    // Teken Pac-Man als een boog om de mond te simuleren
    push(); // Sla de huidige tekeninstellingen op
    translate(this.x, this.y); // Verplaats de oorsprong naar Pac-Man's positie
    rotate(atan2(this.dirY, this.dirX)); // Roteer Pac-Man in de bewegingsrichting

    let angle1 = radians(pacmanMouthAngle);
    let angle2 = radians(360 - pacmanMouthAngle);

    arc(0, 0, pacmanSize, pacmanSize, angle1, angle2, PIE); // Teken de boog

    pop(); // Herstel de tekeninstellingen
  }

  // Toegevoegd aan de PacMan Klasse

  checkWallCollision() {
    // Bepaal de 4 hoekpunten van de Pac-Man bounding box
    let left = this.x - pacmanSize / 2;
    let right = this.x + pacmanSize / 2;
    let top = this.y - pacmanSize / 2;
    let bottom = this.y + pacmanSize / 2;

    // Converteer hoekpunten naar grid coördinaten
    let gridX1 = floor(left / gridSize);
    let gridY1 = floor(top / gridSize);
    let gridX2 = floor((right - 1) / gridSize); // -1 om binnen het vakje te blijven
    let gridY2 = floor((bottom - 1) / gridSize);

    // Controleer of de grid coördinaten binnen de grenzen vallen en of er een muur is
    if (
      gridX1 < 0 ||
      gridX1 >= mazeWidth ||
      gridY1 < 0 ||
      gridY1 >= mazeHeight ||
      gridX2 < 0 ||
      gridX2 >= mazeWidth ||
      gridY2 < 0 ||
      gridY2 >= mazeHeight
    ) {
      // Als een deel buiten de grenzen is, maar het is geen tunnelvakje, behandel het als een muur
      if (
        gridY1 !== tunnelRow ||
        gridY2 !== tunnelRow ||
        gridX1 < -1 ||
        gridX2 >= mazeWidth + 1
      ) {
        return true; // Botsing met rand (behandel als muur)
      }
    }

    // Controleer of een van de 4 hoekpunten zich in een muurvakje bevindt
    if (
      gridX1 >= 0 &&
      gridY1 >= 0 &&
      gridY1 < mazeHeight &&
      gridX1 < mazeWidth &&
      grid[gridY1][gridX1] === 1
    )
      return true;
    if (
      gridX2 >= 0 &&
      gridY1 >= 0 &&
      gridY1 < mazeHeight &&
      gridX2 < mazeWidth &&
      grid[gridY1][gridX2] === 1
    )
      return true;
    if (
      gridX1 >= 0 &&
      gridY2 >= 0 &&
      gridY2 < mazeHeight &&
      gridX1 < mazeWidth &&
      grid[gridY2][gridX1] === 1
    )
      return true;
    if (
      gridX2 >= 0 &&
      gridY2 >= 0 &&
      gridY2 < mazeHeight &&
      gridX2 < mazeWidth &&
      grid[gridY2][gridX2] === 1
    )
      return true;

    return false;
  }
}

// ====== Ghost Klasse ======
class Ghost {
  constructor(x, y, id) {
    this.initialX = x; // Initiële positie
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.dirX = 0; // Start met stilstand of een willekeurige richting
    this.dirY = 0;
    this.speed = ghostSpeed;
    this.id = id; // Unieke ID voor elke geest (voor verschillende kleuren/AI)
    this.color = this.getGhostColor(id); // Kleur gebaseerd op ID
    this.isVulnerable = false;
    this.vulnerableTimer = 0;
    this.frightenedDuration = 10 * 60; // Duur van kwetsbaarheid in frames (bijv. 10 seconden op 60 fps)
    this.frightenedFlashTimer = 0; // Timer voor knipperen
    this.frightenedFlashDuration = 2 * 60; // Duur van knipperen aan het einde
    this.flashState = false; // true: wit, false: blauw
    this.state = "scatter"; // Mogelijke staten: 'scatter', 'chase', 'frightened', 'eaten'
    this.target = { x: 0, y: 0 }; // Doelwit voor 'chase' en 'scatter'
    this.scatterTargets = [
      // Voorbeeld scatter targets (hoekpunten)
      { x: gridSize * (mazeWidth - 1) - gridSize / 2, y: gridSize / 2 }, // Top-right (Blinky)
      { x: gridSize / 2, y: gridSize / 2 }, // Top-left (Pinky)
      {
        x: gridSize * (mazeWidth - 1) - gridSize / 2,
        y: gridSize * (mazeHeight - 1),
      },
      {
        x: gridSize * (mazeWidth - 1) - gridSize / 2,
        y: gridSize * (mazeHeight - 1) - gridSize / 2,
      }, // Bottom-right (Clyde)
    ];
    this.isFlashing = false; // Geeft aan of de geest aan het knipperen is
    this.eatenSpeedMultiplier = 2; // Geesten bewegen sneller terug naar spookhuis wanneer opgegeten
    this.normalSpeed = ghostSpeed;
  }

  getGhostColor(id) {
    switch (id) {
      case 0:
        return color(255, 0, 0); // Blinky (Rood)
      case 1:
        return color(255, 184, 255); // Pinky (Roze)
      case 2:
        return color(0, 255, 255); // Inky (Cyan)
      case 3:
        return color(255, 184, 82); // Clyde (Oranje)
      default:
        return color(255); // Standaard Wit
    }
  }

  // Bepaalt het doelwit van de geest afhankelijk van de staat en ID
  updateTarget() {
    if (!pacman) return; // Geen doelwit als Pac-Man er niet is

    let pacmanGridX = floor(pacman.x / gridSize);
    let pacmanGridY = floor(pacman.y / gridSize);

    switch (this.state) {
      case "chase":
        // Simpele Chase AI (volgt Pac-Man) - TODO: Implementeer echte complexe AI
        switch (this.id) {
          case 0: // Blinky (Rood) - Volgt Pac-Man direct
            this.target.x = pacman.x;
            this.target.y = pacman.y;
            break;
          case 1: // Pinky (Roze) - Richt zich op 4 vakjes voor Pac-Man
            // Dit is een vereenvoudiging, de echte AI is complexer en houdt rekening met muren
            let targetX = pacmanGridX + pacman.dirX * 4;
            let targetY = pacmanGridY + pacman.dirY * 4;
            // Special case voor up: Pinky richt zich 4 up en 4 left in het origineel
            if (pacman.dirX === 0 && pacman.dirY === -1) {
              targetX = pacmanGridX - 4;
              targetY = pacmanGridY - 4;
            }
            this.target.x = targetX * gridSize + gridSize / 2;
            this.target.y = targetY * gridSize + gridSize / 2;
            break;
          case 2: // Inky (Cyan) - Richt zich op een punt relatief aan Pac-Man en Blinky
            // Dit is zeer complex in het origineel. Simpele versie: richt zich op Pac-Man.
            this.target.x = pacman.x;
            this.target.y = pacman.y;
            // Een iets complexere versie: bereken een vector van Blinky naar 2 vakjes voor Pac-Man, en verdubbel deze.
            // Dit vereist Blinky's positie, wat de code complexer maakt. We houden het simpel voor nu.
            break;
          case 3: // Clyde (Oranje) - Verspreidt zich in zijn hoek tenzij dichtbij Pac-Man
            let distanceToPacman = dist(this.x, this.y, pacman.x, pacman.y);
            if (distanceToPacman < gridSize * 8) {
              // Als dichterbij dan 8 vakjes (ongeveer)
              // Ga naar zijn scatter target hoek
              this.target = this.scatterTargets[this.id];
            } else {
              // Volg Pac-Man
              this.target.x = pacman.x;
              this.target.y = pacman.y;
            }
            break;
          default: // Standaard, volg Pac-Man
            this.target.x = pacman.x;
            this.target.y = pacman.y;
            break;
        }
        break;
      case "scatter":
        // Ga naar het toegewezen scatter target
        this.target = this.scatterTargets[this.id % this.scatterTargets.length];
        break;
      case "frightened":
        // Geen specifiek doelwit, beweeg willekeurig (afgehandeld in move())
        break;
      case "eaten":
        // Ga terug naar het midden van het spookhuis
        let houseCenterX = ghostHousePos.x * gridSize + gridSize / 2;
        let houseCenterY = ghostHousePos.y * gridSize + gridSize / 2;
        this.target.x = houseCenterX;
        this.target.y = houseCenterY;

        // Als de geest het spookhuis bereikt, reset
        if (dist(this.x, this.y, this.target.x, this.target.y) < this.speed) {
          this.reset();
          this.state = "scatter"; // Begin weer in scatter (kan variëren per geest)
        }
        break;
    }
  }

  // ...in class Ghost...

  move() {
    // Alleen richting kiezen als de geest precies in het midden van een vakje staat
    let inCenter =
      abs((this.x - gridSize / 2) % gridSize) < 1e-2 &&
      abs((this.y - gridSize / 2) % gridSize) < 1e-2;

    if (inCenter) {
      this.updateTarget();

      let currentGridX = floor(this.x / gridSize);
      let currentGridY = floor(this.y / gridSize);

      let possibleMoves = [];
      let directions = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ];

      for (let dir of directions) {
        let nextGridX = currentGridX + dir[0];
        let nextGridY = currentGridY + dir[1];
        if (
          nextGridX >= 0 &&
          nextGridX < mazeWidth &&
          nextGridY >= 0 &&
          nextGridY < mazeHeight &&
          grid[nextGridY][nextGridX] !== 1
        ) {
          // Niet omkeren, behalve bij frightened/eaten
          let isReverse = dir[0] === -this.dirX && dir[1] === -this.dirY;
          if (
            this.state !== "frightened" &&
            this.state !== "eaten" &&
            isReverse
          ) {
            continue;
          }
          possibleMoves.push(dir);
        }
      }

      let nextDir = [this.dirX, this.dirY];

      if (this.state === "frightened") {
        if (possibleMoves.length > 0) nextDir = random(possibleMoves);
      } else if (this.state === "eaten") {
        let minDistance = Infinity;
        for (let dir of possibleMoves) {
          let nextX = (currentGridX + dir[0]) * gridSize + gridSize / 2;
          let nextY = (currentGridY + dir[1]) * gridSize + gridSize / 2;
          let distance = dist(nextX, nextY, this.target.x, this.target.y);
          if (distance < minDistance) {
            minDistance = distance;
            nextDir = dir;
          }
        }
      } else {
        // chase/scatter
        let minDistance = Infinity;
        for (let dir of possibleMoves) {
          let nextX = (currentGridX + dir[0]) * gridSize + gridSize / 2;
          let nextY = (currentGridY + dir[1]) * gridSize + gridSize / 2;
          let distance = dist(nextX, nextY, this.target.x, this.target.y);
          if (distance < minDistance) {
            minDistance = distance;
            nextDir = dir;
          }
        }
      }

      this.dirX = nextDir[0];
      this.dirY = nextDir[1];
    }

    // Altijd bewegen in huidige richting
    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;

    // Corrigeer positie naar het midden van het vakje als bijna in het midden
    if (
      abs((this.x - gridSize / 2) % gridSize) < this.speed &&
      abs((this.y - gridSize / 2) % gridSize) < this.speed
    ) {
      this.x = round((this.x - gridSize / 2) / gridSize) * gridSize + gridSize / 2;
      this.y = round((this.y - gridSize / 2) / gridSize) * gridSize + gridSize / 2;
    }

    this.checkTunnel();
  }

  // Controleer voor tunnels en teleporteer geest
  checkTunnel() {
    if (Math.round(this.y / gridSize) === tunnelRow) {
      if (this.x < -ghostSize / 2) {
        this.x = canvasWidth + ghostSize / 2;
      } else if (this.x > canvasWidth + ghostSize / 2) {
        this.x = -ghostSize / 2;
      }
    }
  }
  updateState() {
    if (this.state === "frightened") {
      this.vulnerableTimer--;
      // Knipper logica
      if (this.vulnerableTimer <= this.frightenedFlashDuration) {
        this.isFlashing = true;
        if (frameCount % 10 === 0) {
          // Knipper elke 10 frames (voorbeeld)
          this.flashState = !this.flashState;
        }
      } else {
        this.isFlashing = false;
        this.flashState = false; // Zorg dat hij blauw blijft
      }

      if (this.vulnerableTimer <= 0) {
        this.isVulnerable = false;
        this.isFlashing = false;
        this.flashState = false;
        this.state = random() < 0.5 ? "chase" : "scatter"; // Terug naar chase of scatter
        // TODO: Ga terug naar de staat waarin de geest was voordat hij kwetsbaar werd
      }
    } else if (this.state === "eaten") {
      // Geest keert terug naar spookhuis
      // Wordt afgehandeld in updateTarget en move()
    } else {
      // chase of scatter
      this.isVulnerable = false; // Zorg ervoor dat ze niet kwetsbaar zijn in deze staten
      this.isFlashing = false;
      this.flashState = false;

      // TODO: Implementeer timing voor het wisselen tussen chase en scatter staten
      // In het origineel wisselen geesten periodiek van staat
    }
  }

  collidesWith(other) {
    // Eenvoudige cirkel-cirkel botsingsdetectie
    let d = dist(this.x, this.y, other.x, other.y);
    return d < ghostSize / 2 + pacmanSize / 2;
  }

  display() {
    push();
    translate(this.x, this.y);

    // Teken lichaam
    if (this.state === "eaten") {
      fill(100); // Grijsachtig als opgegeten
    } else if (this.isVulnerable) {
      if (this.isFlashing && this.flashState) {
        fill(255); // Wit bij knipperen
      } else {
        fill(0, 0, 255); // Blauw als kwetsbaar
      }
    } else {
      fill(this.color);
    }
    noStroke();
    ellipse(0, 0, ghostSize, ghostSize); // Hoofd
    rect(-ghostSize / 2, 0, ghostSize, ghostSize / 2); // Onderkant (rechthoek)

    // Teken "golven" aan de onderkant (vereenvoudigde weergave)
    beginShape();
    vertex(-ghostSize / 2, ghostSize / 2);
    vertex((-ghostSize / 2) * 0.75, ghostSize / 2 + ghostSize * 0.1);
    vertex((-ghostSize / 2) * 0.5, ghostSize / 2);
    vertex((-ghostSize / 2) * 0.25, ghostSize / 2 + ghostSize * 0.1);
    vertex(0, ghostSize / 2);
    vertex((ghostSize / 2) * 0.25, ghostSize / 2 + ghostSize * 0.1);
    vertex((ghostSize / 2) * 0.5, ghostSize / 2);
    vertex((ghostSize / 2) * 0.75, ghostSize / 2 + ghostSize * 0.1);
    vertex(ghostSize / 2, ghostSize / 2);
    endShape(CLOSE);

    // Teken ogen
    let eyeSize = ghostSize * 0.3;
    let pupilSize = eyeSize * 0.5;
    let eyeOffsetX = ghostSize * 0.2;
    let eyeOffsetY = ghostSize * 0.1;

    // Bepaal oogrichting (vereenvoudigd: kijkt naar Pac-Man als in chase, anders vooruit of willekeurig)
    let eyeDirX = 0;
    let eyeDirY = 0;

    if (pacman && (this.state === "chase" || this.state === "eaten")) {
      let angleToPacman = atan2(pacman.y - this.y, pacman.x - this.x);
      eyeDirX = cos(angleToPacman);
      eyeDirY = sin(angleToPacman);
    } else {
      // Kijkt in de bewegingsrichting in andere staten (of vooruit als stilstaat)
      eyeDirX = this.dirX;
      eyeDirY = this.dirY;
      if (eyeDirX === 0 && eyeDirY === 0) eyeDirX = 1; // Kijk naar rechts als stil
    }

    // Wit van het oog
    fill(255);
    ellipse(-eyeOffsetX, -eyeOffsetY, eyeSize, eyeSize);
    ellipse(eyeOffsetX, -eyeOffsetY, eyeSize, eyeSize);

    // Pupil (zwarte cirkel)
    fill(0);
    ellipse(
      -eyeOffsetX + (eyeDirX * eyeSize) / 4,
      -eyeOffsetY + (eyeDirY * eyeSize) / 4,
      pupilSize,
      pupilSize
    );
    ellipse(
      eyeOffsetX + (eyeDirX * eyeSize) / 4,
      -eyeOffsetY + (eyeDirY * eyeSize) / 4,
      pupilSize,
      pupilSize
    );

    pop();
  }

  reset() {
    // Stuur de geest terug naar zijn initiële positie in het spookhuis
    this.x = this.initialX;
    this.y = this.initialY;
    this.dirX = 0; // Start stil
    this.dirY = 0;
    this.isVulnerable = false;
    this.vulnerableTimer = 0;
    this.isFlashing = false;
    this.flashState = false;
    this.state = "scatter"; // Begin weer in scatter (kan variëren per geest in origineel)
    this.speed = this.normalSpeed; // Reset snelheid
  }
}

// ====== Bonus Item Klasse ======
class BonusItem {
  constructor(x, y, points) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.spawnTime = frameCount;
    this.duration = bonusItemDuration; // Hoe lang zichtbaar
    this.isCollected = false;
    this.size = gridSize * 0.7; // Grootte van het bonus item
    // TODO: Implementeer verschillende bonus items (kers, aardbei, etc.) en hun grafische weergave
  }

  update() {
    // Controleer of de bonus item tijd is verstreken
    if (frameCount > this.spawnTime + this.duration) {
      this.isCollected = true; // Behandel als verzameld zodat het verdwijnt
    }
  }

  display() {
    if (!this.isCollected) {
      fill(255, 0, 0); // Rode kers (voorbeeld)
      noStroke();
      ellipse(this.x, this.y, this.size, this.size);
      // TODO: Teken daadwerkelijk een kers of ander bonus item
    }
  }

  collidesWith(other) {
    // Eenvoudige cirkel-cirkel botsingsdetectie
    if (this.isCollected) return false; // Niet botsen als al verzameld

    let d = dist(this.x, this.y, other.x, other.y);
    return d < this.size / 2 + pacmanSize / 2;
  }

  collect() {
    this.isCollected = true;
    // TODO: Speel bonus item geluidseffect
  }

  isExpired() {
    return frameCount > this.spawnTime + this.duration;
  }
}

// TODO: Implementeer score weergave op het scherm
// TODO: Implementeer levens weergave op het scherm
// TODO: Implementeer start muziek en game over muziek
// TODO: Verfijn geest AI om meer op het origineel te lijken
// TODO: Implementeer verschillende niveaus
