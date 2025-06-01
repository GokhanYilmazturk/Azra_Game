// Global variables (these were already global in your original script)
let points = parseInt(localStorage.getItem('points')) || 0;
const currentLevel = getLevelFromPoints(points);
const currentLevelIndex = levels.indexOf(currentLevel);
const levels = [
  "Grup-1", "Grup-2", "Grup-3", "Grup-4", "Grup-5",
  "Grup-6", "Grup-7", "Grup-8", "Grup-9", "Grup-10"
];
let currentAnswer = 0;
let correctStreak = 0;
let isComboQuestion = false;
let comboTimer = null;
let comboTimeLeft = 10;
let currentSudokuSolution = [];
let timerAudio = null;

// Character images for level up overlay
const levelCharacterImages = {
  "Grup-1": "images/char1.png",
  "Grup-2": "images/char2.png",
  "Grup-3": "images/char3.png",
  "Grup-4": "images/char4.png",
  "Grup-5": "images/char5.png",
  "Grup-6": "images/char6.png",
  "Grup-7": "images/char7.png",
  "Grup-8": "images/char8.png",
  "Grup-9": "images/char9.png",
  "Grup-10": "images/char10.png"
};

// Background images for each level
const levelBackgrounds = {
  "Grup-1": "images/level1.png",
  "Grup-2": "images/level2.png",
  "Grup-3": "images/level3.png",
  "Grup-4": "images/level4.png",
  "Grup-5": "images/level5.png",
  "Grup-6": "images/level1.png",
  "Grup-7": "images/level2.png",
  "Grup-8": "images/level3.png",
  "Grup-9": "images/level4.png",
  "Grup-10": "images/level5.png"
};

// Challenges for each level
const challenges = {
  "Grup-1": "0-5 arası toplama.",
  "Grup-2": "0-10 arası toplama.",
  "Grup-3": "0-10 arası toplama + 0-3 arası çarpma.",
  "Grup-4": "0-10 arası toplama + 0-10 arası çıkartma + 0-4 arası çarpma.",
  "Grup-5": "0-15 arası toplama + 0-10 arası çıkartma + 0-5 arası çarpma.",
  "Grup-6": "5-15 arası toplama + 0-10 arası çıkartma + 0-6 arası çarpma.",
  "Grup-7": "5-15 arası toplama + 0-10 arası çıkartma + 0-7 arası çarpma.",
  "Grup-8": "5-20 arası toplama + 0-10 arası çıkartma + 0-8 arası çarpma.",
  "Grup-9": "10-20 arası toplama + 0-10 arası çıkartma + 0-9 arası çarpma. Her soru için 10 sn süre.",
  "Grup-10": "10-20 arası toplama + 0-10 arası çıkartma + 0-10 arası çarpma.. Her soru için 5 sn süre."
};

// Function to get the level based on points
function getLevelFromPoints(points) {
  if (points < 100) {
    return "Grup-" + (Math.floor(points / 20) + 1);
  } else {
    return "Grup-" + (Math.floor((points - 100) / 10) + 6);
  }
}

// --- DOM Element References (to be assigned after fragments load) ---
let mainSectionContainer, gameSectionContainer, levelSectionContainer, sudokuSectionContainer;
let pointsDisplay, levelDisplay, gamePointsDisplay, gameLevelDisplay, levelPointsDisplay, levelLevelDisplay;
let questionTextElem, answerInputElem, feedbackElem, comboTimerElem;
let levelChallengesList, sudokuFeedbackElem;

// --- Fragment Loading Function ---
async function loadFragment(fragmentPath, containerId) {
  try {
    const response = await fetch(fragmentPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${fragmentPath}`);
    }
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Could not load fragment ${fragmentPath}:`, error);
    document.getElementById(containerId).innerHTML = `<p style="color:red;">Error loading content for ${containerId}. Please check console.</p>`;
  }
}

// --- Initialization Function (called after fragments are loaded) ---
function initializeGame() {
  // Assign DOM element references
  mainSectionContainer = document.getElementById("main-section-container");
  gameSectionContainer = document.getElementById("game-section-container");
  levelSectionContainer = document.getElementById("level-section-container");
  sudokuSectionContainer = document.getElementById("sudoku-section-container");
  leaderboardSectionContainer = document.getElementById("leaderboard-section-container");

  // Elements from main_section.html
  pointsDisplay = document.getElementById("points");
  levelDisplay = document.getElementById("level");

  // Elements from game_section.html (check if they exist before assigning)
  gamePointsDisplay = document.getElementById("game-points");
  gameLevelDisplay = document.getElementById("game-level");
  questionTextElem = document.getElementById("question-text");
  answerInputElem = document.getElementById("answer-input");
  feedbackElem = document.getElementById("feedback");
  comboTimerElem = document.getElementById("combo-timer");

  // Elements from level_section.html
  levelPointsDisplay = document.getElementById("level-points");
  levelLevelDisplay = document.getElementById("level-level");
  levelChallengesList = document.getElementById("level-challenges");

  // Elements from sudoku_section.html
  sudokuFeedbackElem = document.getElementById("sudoku-feedback");


  // Initial UI setup
  if (pointsDisplay) pointsDisplay.value = points; // It's an input field
  if (levelDisplay) levelDisplay.value = getCurrentLevel(); // It's an input field

  updatelevel(); // This will populate level data
  updateDisplay(); // Sets initial background etc.
  playMainScreenMusic(); // Play music on main screen

  // Add "Enter" key functionality for the answer input (if it exists)
  if (answerInputElem) {
    answerInputElem.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        submitAnswer();
      }
    });
  }

  // Set initial visibility (CSS already handles some, but JS can override/confirm)
  mainSectionContainer.style.display = "block";
  levelSectionContainer.style.display = "none";
  gameSectionContainer.style.display = "none";
  sudokuSectionContainer.style.display = "none";
  leaderboardSectionContainer.style.display = "none";
}

// --- Your Existing Game Logic Functions (No changes needed in most, just ensure DOM elements are accessed via variables set in initializeGame) ---

function getCurrentLevel() {
  return getLevelFromPoints(points);
}

function startGame() {
  mainSectionContainer.style.display = "none";
  gameSectionContainer.style.display = "block";
  levelSectionContainer.style.display = "none";
  sudokuSectionContainer.style.display = "none";
  leaderboardSectionContainer.style.display = "none";
  nextQuestion();
  playMainScreenMusic();
}

function nextQuestion(levelOverride = null) {
  const level = levelOverride || getCurrentLevel();
  let a, b, op;

  switch (level) {
    case "Grup-1":
      // 0-5 arası toplama
      op = "+";
      a = Math.floor(Math.random() * 6);
      b = Math.floor(Math.random() * 6);
      break;
    case "Grup-2":
      // 0-10 arası toplama
      op = "+";
      a = Math.floor(Math.random() * 11);
      b = Math.floor(Math.random() * 11);
      break;
    case "Grup-3":
      // 0-10 arası toplama + 0-3 arası çarpma
      op = Math.random() < 0.5 ? "+" : "*";
      if (op === "+") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
      } else {
        a = Math.floor(Math.random() * 4);
        b = Math.floor(Math.random() * 4);
      }
      break;
    case "Grup-4":
      // 0-10 arası toplama + 0-10 arası çıkartma + 0-4 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
      } else if (op === "-") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 5);
        b = Math.floor(Math.random() * 5);
      }
      break;
    case "Grup-5":
      // 0-15 arası toplama + 0-10 arası çıkartma + 0-5 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 16);
        b = Math.floor(Math.random() * 16);
      } else if (op === "-") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 6);
        b = Math.floor(Math.random() * 6);
      }
      break;
    case "Grup-6":
      // 5-15 arası toplama + 0-10 arası çıkartma + 0-6 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 11) + 5;
        b = Math.floor(Math.random() * 11) + 5;
      } else if (op === "-") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 7);
        b = Math.floor(Math.random() * 7);
      }
      break;
    case "Grup-7":
      // 5-15 arası toplama + 0-10 arası çıkartma + 0-7 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 11) + 5;
        b = Math.floor(Math.random() * 11) + 5;
      } else if (op === "-") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 8);
        b = Math.floor(Math.random() * 8);
      }
      break;
    case "Grup-8":
      // 5-20 arası toplama + 0-10 arası çıkartma + 0-8 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 16) + 5;
        b = Math.floor(Math.random() * 16) + 5;
      } else if (op === "-") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 9);
        b = Math.floor(Math.random() * 9);
      }
      break;
    case "Grup-9":
      // 10-20 arası toplama + 0-10 arası çıkartma + 0-9 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 11) + 10;
        b = Math.floor(Math.random() * 11) + 10;
      } else if (op === "-") {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 10);
        b = Math.floor(Math.random() * 10);
      }
      break;
    case "Grup-10":
      // 10-20 arası toplama + 0-10 arası çıkartma + 0-10 arası çarpma
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
      if (op === "+") {
        a = Math.floor(Math.random() * 11) + 10;
        b = Math.floor(Math.random() * 11) + 10;
      } else if (op === "-") {
        a = Math.floor(Math.random() * 16);
        b = Math.floor(Math.random() * 16);
        if (b > a) [a, b] = [b, a];
      } else {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
      }
      break;
  }

  currentAnswer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const opSymbol = op === "+" ? "+" : op === "-" ? "-" : "×";
  if (questionTextElem) questionTextElem.textContent = `${a} ${opSymbol} ${b} işlemi kaç eder?`;
  if (answerInputElem) answerInputElem.value = "";
  if (feedbackElem) feedbackElem.textContent = "";
  updateDisplay();
  if (answerInputElem) answerInputElem.focus();

  // --- Timer for Grup-9 and Grup-10 ---
  if (level === "Grup-9" || level === "Grup-10") {
    let timerSeconds = level === "Grup-9" ? 10 : 5;
    if (comboTimer) clearInterval(comboTimer);
    comboTimeLeft = timerSeconds;
    if (comboTimerElem) {
      comboTimerElem.textContent = `Süre: ${comboTimeLeft} sn`;
      comboTimerElem.style.display = "block";
    }
    // Play timer sound
    if (timerAudio) {
      timerAudio.pause();
      timerAudio.currentTime = 0;
    }
    timerAudio = new Audio("sounds/timer.mpeg");
    timerAudio.loop = true;
    timerAudio.play().catch(() => { });
    comboTimer = setInterval(() => {
      comboTimeLeft--;
      if (comboTimerElem) comboTimerElem.textContent = `Süre: ${comboTimeLeft} sn`;
      if (comboTimeLeft <= 0) {
        clearInterval(comboTimer);
        if (comboTimerElem) comboTimerElem.style.display = "none";
        // Stop timer sound
        if (timerAudio) {
          timerAudio.pause();
          timerAudio.currentTime = 0;
        }
        if (feedbackElem) feedbackElem.textContent = "⏰ Süre doldu!";
        setTimeout(nextQuestion, 1500);
      }
    }, 1000);
  } else {
    if (comboTimer) clearInterval(comboTimer);
    if (comboTimerElem) comboTimerElem.style.display = "none";
    // Stop timer sound
    if (timerAudio) {
      timerAudio.pause();
      timerAudio.currentTime = 0;
    }
  }
}

function validateInput(input) {
  input.value = input.value.replace(/[^0-9]/g, '');
}

function playRandomSound(type) {
  if (localStorage.getItem("soundEnabled") === "false") return;
  const correctSounds = ["sounds/correct1.m4a", "sounds/correct2.m4a", "sounds/correct3.m4a",
    "sounds/correct4.m4a", "sounds/correct5.m4a", "sounds/correct6.m4a"];
  const incorrectSounds = ["sounds/incorrect1.m4a", "sounds/incorrect2.m4a", "sounds/incorrect3.m4a"];
  const sounds = type === "correct" ? correctSounds : incorrectSounds;
  if (sounds.length === 0) {
    console.warn(`No sounds defined for type: ${type}`);
    // Fallback to original sounds if new ones aren't found or list is empty
    const fallbackSound = type === "correct" ? "sounds/correct.mp3" : "sounds/incorrect.mp3";
    const audio = new Audio(fallbackSound);
    audio.play().catch(e => console.error("Error playing fallback sound:", e));
    return;
  }
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  const audio = new Audio(randomSound);
  audio.play().catch(e => console.error("Error playing random sound:", e));
}


function submitAnswer() {
  if (!answerInputElem) return; // Guard clause
  const userAnswer = answerInputElem.value.trim();

  if (userAnswer === "" || isNaN(userAnswer)) {
    if (feedbackElem) feedbackElem.textContent = "Lütfen geçerli bir sayı gir!";
    return;
  }

  const parsedAnswer = parseInt(userAnswer);
  const currentLevel = getCurrentLevel();

  // Determine point and threshold logic
  const afterGrup5 = levels.indexOf(currentLevel) >= 5;
  const pointsPerCorrect = afterGrup5 ? 1 : 2;
  const pointsPerLevel = afterGrup5 ? 10 : 20;

  if (isComboQuestion) {
    clearInterval(comboTimer);
    if (comboTimerElem) comboTimerElem.style.display = "none";
    isComboQuestion = false;
    // Stop timer sound
    if (timerAudio) {
      timerAudio.pause();
      timerAudio.currentTime = 0;
    }
    if (parsedAnswer === currentAnswer) {
      points += 5;
      if (feedbackElem) feedbackElem.textContent = "🔥 KOMBO! 5 puan kazandın!";
      playRandomSound("correct");
    } else {
      if (feedbackElem) feedbackElem.textContent = "⏰ Komboda yanlış cevap!";
      playRandomSound("incorrect");
    }
    correctStreak = 0;
    localStorage.setItem('points', points);
    updateDisplay();
    setTimeout(nextQuestion, 1500);
    return;
  }

  if (parsedAnswer === currentAnswer) {
    points += pointsPerCorrect;
    correctStreak++;
    if (feedbackElem) feedbackElem.textContent = `🎉 Aferin! ${pointsPerCorrect} puan kazandın!`;
    playRandomSound("correct");
    localStorage.setItem('points', points);
    updateDisplay();
    if (correctStreak >= 3 && !["Grup-9", "Grup-10"].includes(currentLevel)) {
      setTimeout(askComboQuestion, 1200);
      return;
    }
  } else {
    points = Math.max(0, points - 1);
    correctStreak = 0;
    if (feedbackElem) feedbackElem.textContent = "❌ Bu yanlış oldu, 1 puan kaybettin.";
    playRandomSound("incorrect");
  }

  localStorage.setItem('points', points);

  // Level up logic
  const previousLevel = getLevelFromPoints(points - pointsPerCorrect); // previous points
  const newLevel = getLevelFromPoints(points);

  if (previousLevel !== newLevel) {
    alert(`🎉 Yeni seviyeye geçtin: ${newLevel}!`);
    playLevelUpSound();
    launchLevelUpOverlay();
  }

  updateDisplay();
  setTimeout(nextQuestion, 1500);
}

function playLevelUpSound() {
  if (localStorage.getItem("soundEnabled") === "false") return;
  const levelUpSound = new Audio("sounds/level-up.mpeg");
  levelUpSound.play().catch(e => console.error("Error playing level up sound:", e));
}

function updateDisplay() {
  // Update main section displays (these are input fields)
  if (pointsDisplay) pointsDisplay.value = points;
  if (levelDisplay) levelDisplay.value = getCurrentLevel();

  // Update game section displays (these are spans)
  if (gamePointsDisplay) gamePointsDisplay.textContent = points;
  if (gameLevelDisplay) gameLevelDisplay.textContent = getCurrentLevel();

  // Update level displays (these are spans)
  if (levelPointsDisplay) levelPointsDisplay.textContent = points;
  if (levelLevelDisplay) levelLevelDisplay.textContent = getCurrentLevel();


  const levelBackgrounds = {
    "Grup-1": "images/level1.png",
    "Grup-2": "images/level2.png",
    "Grup-3": "images/level3.png",
    "Grup-4": "images/level4.png",
    "Grup-5": "images/level5.png",
    "Grup-6": "images/level1.png",
    "Grup-7": "images/level2.png",
    "Grup-8": "images/level3.png",
    "Grup-9": "images/level4.png",
    "Grup-10": "images/level5.png"
  };

  const currentLevel = getCurrentLevel();
  // Path is relative to the main HTML file
  document.body.style.backgroundImage = `url('${levelBackgrounds[currentLevel] || 'images/start-screen.png'}')`;

  // Update game-section-hero background image
  const gameSectionHero = document.querySelector("#game-section .game-section-hero");
  if (gameSectionHero) {
    gameSectionHero.style.backgroundImage = `url('${levelBackgrounds[currentLevel] || 'images/start-screen.png'}')`;
  }

  if (currentLevel === "Grup-4") {
    document.body.classList.add("level-4");
  } else {
    document.body.classList.remove("level-4");
  }

  // Progress bar calculation
  const maxPoints = 150;
  const percent = Math.min(100, Math.round((points / maxPoints) * 100));
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (progressBar) progressBar.style.width = percent + "%";
  if (progressText) progressText.textContent = percent + "%";
}

function launchLevelUpOverlay() {
  const overlay = document.getElementById("levelup-overlay");
  if (!overlay) return;
  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.style.display = "none";
  }, 2500); // 2.5 seconds
}

function updatelevel() {
  if (!levelChallengesList) return; // Guard clause

  if (levelPointsDisplay) levelPointsDisplay.textContent = points;
  if (levelLevelDisplay) levelLevelDisplay.textContent = getCurrentLevel();

  levelChallengesList.innerHTML = "";
  for (const [level, description] of Object.entries(challenges)) {
    const h3 = document.createElement("h3");
    h3.className = "level-section-heading";
    h3.textContent = level;

    const p = document.createElement("p");
    p.className = "level-section-desc";
    p.textContent = description;

    levelChallengesList.appendChild(h3);
    levelChallengesList.appendChild(p);
  }
}

function resetGame() {
  points = 0;
  currentLevelIndex = 0;
  localStorage.setItem('points', points);

  if (pointsDisplay) pointsDisplay.value = points;
  if (levelDisplay) levelDisplay.value = getCurrentLevel();
  if (levelPointsDisplay) levelPointsDisplay.textContent = points;
  if (levelLevelDisplay) levelLevelDisplay.textContent = getCurrentLevel();

  updateDisplay(); // To reset background etc.
  alert("Oyun sıfırlandı! Yeni bir başlangıç yapabilirsin.");
}

function askComboQuestion() {
  isComboQuestion = true;
  comboTimeLeft = 10;
  if (comboTimerElem) {
    comboTimerElem.textContent = `KOMBO SORUSU! Süre: ${comboTimeLeft} sn`;
    comboTimerElem.style.display = "block";
  }
  if (feedbackElem) feedbackElem.textContent = "KOMBO SORUSU! Doğru cevaba 5 puan!";

  // Play timer sound
  if (timerAudio) {
    timerAudio.pause();
    timerAudio.currentTime = 0;
  }
  timerAudio = new Audio("sounds/timer.mpeg");
  timerAudio.loop = true;
  timerAudio.play().catch(() => { });

  // Always use the next level for combo question
  const currentLevel = getCurrentLevel();
  const currentLevelIndex = levels.indexOf(currentLevel);
  const nextLevelIndex = Math.min(currentLevelIndex + 1, levels.length - 1);
  const comboLevel = levels[nextLevelIndex];

  // Use nextQuestion logic for comboLevel
  nextQuestion(comboLevel);

  comboTimer = setInterval(() => {
    comboTimeLeft--;
    if (comboTimerElem) comboTimerElem.textContent = `KOMBO SORUSU! Süre: ${comboTimeLeft} sn`;
    if (comboTimeLeft <= 0) {
      clearInterval(comboTimer);
      if (comboTimerElem) comboTimerElem.style.display = "none";
      isComboQuestion = false;
      // Stop timer sound
      if (timerAudio) {
        timerAudio.pause();
        timerAudio.currentTime = 0;
      }
      if (feedbackElem) feedbackElem.textContent = "⏰ Süre doldu! Komboyu kaçırdın.";
      correctStreak = 0;
      setTimeout(nextQuestion, 1500);
    }
  }, 1000);
}

function generateSudoku4x4() {
  const base = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
  ];
  for (let band = 0; band < 4; band += 2) {
    if (Math.random() < 0.5) {
      [base[band], base[band + 1]] = [base[band + 1], base[band]];
    }
  }
  for (let stack = 0; stack < 4; stack += 2) {
    if (Math.random() < 0.5) {
      for (let row = 0; row < 4; row++) {
        [base[row][stack], base[row][stack + 1]] = [base[row][stack + 1], base[row][stack]];
      }
    }
  }
  return base.map(row => row.slice());
}

function backToMain() {
  mainSectionContainer.style.display = "block";
  gameSectionContainer.style.display = "none";
  levelSectionContainer.style.display = "block";
  sudokuSectionContainer.style.display = "none";
  leaderboardSectionContainer.style.display = "none";
  updateDisplay(); // Refresh main screen info
}

function generateAndShowSudoku() {
  if (sudokuFeedbackElem) sudokuFeedbackElem.textContent = "";
  currentSudokuSolution = generateSudoku4x4();
  let blanks = new Set();
  while (blanks.size < 8) {
    blanks.add(Math.floor(Math.random() * 16));
  }
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.getElementById(`s${r}${c}`);
      if (!cell) continue; // Cell might not be loaded yet if called too early
      const idx = r * 4 + c;
      cell.style.background = "";
      if (blanks.has(idx)) {
        cell.value = "";
        cell.disabled = false;
      } else {
        cell.value = currentSudokuSolution[r][c];
        cell.disabled = true;
      }
    }
  }
}

function showSudoku() {
  mainSectionContainer.style.display = "none";
  gameSectionContainer.style.display = "none";
  levelSectionContainer.style.display = "none";
  sudokuSectionContainer.style.display = "block";
  leaderboardSectionContainer.style.display = "none";
  generateAndShowSudoku();
}

function checkSudoku() {
  if (!sudokuFeedbackElem) return;
  let correct = true;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.getElementById(`s${r}${c}`);
      if (!cell) continue;
      if (!cell.disabled) {
        if (parseInt(cell.value) !== currentSudokuSolution[r][c]) {
          correct = false;
          cell.style.background = "#ffcccc";
        } else {
          cell.style.background = "#ccffcc";
        }
      }
    }
  }
  if (correct) {
    sudokuFeedbackElem.textContent = "Tebrikler, doğru çözdün! Yeni bir sudoku geliyor...";
    playLevelUpSound();
    launchLevelUpOverlay();
    setTimeout(generateAndShowSudoku, 2000);
  } else {
    sudokuFeedbackElem.textContent = "Bazı cevaplar yanlış, tekrar dene!";
  }
}

// --- Background Music Functions ---
const backgroundMusic = document.getElementById("backgroundMusic");

// Play music when on main screen (Ana Sayfa)
function playMainScreenMusic() {
  // Only play if enabled
  if (backgroundMusic && localStorage.getItem("musicEnabled") !== "false") {
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    backgroundMusic.play().catch(() => {
      document.body.addEventListener('click', () => {
        backgroundMusic.play();
      }, { once: true });
    });
  }
}

// Pause music when leaving main screen
function pauseMainScreenMusic() {
  if (backgroundMusic) backgroundMusic.pause();
}

// Call this in navigation logic:

// --- Event Listener to Load Fragments and Initialize ---
document.addEventListener("DOMContentLoaded", async () => {
  // Define fragment paths and their container IDs
  const fragmentsToLoad = [
    { path: "fragments/main_section.html", id: "main-section-container" },
    { path: "fragments/game_section.html", id: "game-section-container" },
    { path: "fragments/level_section.html", id: "level-section-container" },
    { path: "fragments/sudoku_section.html", id: "sudoku-section-container" },
    { path: "fragments/leaderboard_section.html", id: "leaderboard-section-container" }
  ];

  // Create an array of promises for loading each fragment
  const loadPromises = fragmentsToLoad.map(fragment => loadFragment(fragment.path, fragment.id));

  try {
    // Wait for all fragments to be loaded
    await Promise.all(loadPromises);
    // Once all fragments are loaded, initialize the game and UI elements
    initializeGame();

    // --- Add navigation logic for header buttons ---
    const homeBtn = document.getElementById("home-btn");
    const levelBtn = document.getElementById("level-btn");

    if (homeBtn) {
      homeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Show main section, hide others
        mainSectionContainer.style.display = "block";
        gameSectionContainer.style.display = "none";
        levelSectionContainer.style.display = "none";
        sudokuSectionContainer.style.display = "none";
        leaderboardSectionContainer.style.display = "none";
        updateDisplay();
        playMainScreenMusic(); // Play music on main screen
      });
    }

    if (levelBtn) {
      levelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Show level section, hide others
        mainSectionContainer.style.display = "none";
        gameSectionContainer.style.display = "none";
        levelSectionContainer.style.display = "block";
        sudokuSectionContainer.style.display = "none";
        leaderboardSectionContainer.style.display = "none";
        updatelevel();
        pauseMainScreenMusic(); // Pause music when navigating away from main screen
      });
    }


    // Leaderboard button logic
    const leaderboardBtn = document.getElementById("leaderboard-btn");
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        // Hide all other sections
        mainSectionContainer.style.display = "none";
        gameSectionContainer.style.display = "none";
        levelSectionContainer.style.display = "none";
        sudokuSectionContainer.style.display = "none";
        // Load leaderboard fragment if not loaded yet
        if (!leaderboardSectionContainer.innerHTML.trim()) {
          await loadFragment("fragments/leaderboard_section.html", "leaderboard-section-container");
        }
        leaderboardSectionContainer.style.display = "block";
        // Optionally, update leaderboard data here
        updateLeaderboard();
      });
    }

  } catch (error) {
    console.error("Error loading one or more fragments:", error);
    document.body.innerHTML = "<p>Üzgünüz, oyun yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>";
  }
});

// --- Modal Logic ---
document.addEventListener("DOMContentLoaded", () => {
  // Modal elements
  const settingsModal = document.getElementById("settings-modal");
  const gearBtn = document.getElementById("settings-btn"); // <-- use the id
  const closeBtn = document.getElementById("close-settings");
  const musicVolume = document.getElementById("music-volume");
  const musicVolumeValue = document.getElementById("music-volume-value");
  const musicToggle = document.getElementById("music-toggle");
  const soundToggle = document.getElementById("sound-toggle");

  // Show modal on gear click
  if (gearBtn) {
    gearBtn.addEventListener("click", () => {
      settingsModal.style.display = "flex";
      musicVolume.value = backgroundMusic.volume;
      musicVolumeValue.textContent = Math.round(backgroundMusic.volume * 100) + "%";
      // Use localStorage for checked state
      musicToggle.checked = localStorage.getItem("musicEnabled") !== "false";
      soundToggle.checked = localStorage.getItem("soundEnabled") !== "false";
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

  // Volume control
  if (musicVolume) {
    musicVolume.addEventListener("input", () => {
      backgroundMusic.volume = musicVolume.value;
      musicVolumeValue.textContent = Math.round(musicVolume.value * 100) + "%";
    });
  }

  // Music on/off
  if (musicToggle) {
    musicToggle.addEventListener("change", () => {
      localStorage.setItem("musicEnabled", musicToggle.checked ? "true" : "false");
      if (musicToggle.checked) {
        backgroundMusic.play();
      } else {
        backgroundMusic.pause();
      }
    });
  }

  // Sound effects on/off
  if (soundToggle) {
    soundToggle.addEventListener("change", () => {
      localStorage.setItem("soundEnabled", soundToggle.checked ? "true" : "false");
    });
  }
});

// Timer for Grup-9 and Grup-10
/* if (level === "Grup-9" || level === "Grup-10") {
  let timerSeconds = level === "Grup-9" ? 10 : 5;
  if (comboTimer) clearInterval(comboTimer);
  comboTimeLeft = timerSeconds;
  if (comboTimerElem) {
    comboTimerElem.textContent = `Süre: ${comboTimeLeft} sn`;
    comboTimerElem.style.display = "block";
  }
  // Play timer sound
  if (timerAudio) {
    timerAudio.pause();
    timerAudio.currentTime = 0;
  }
  timerAudio = new Audio("sounds/timer.mpeg");
  timerAudio.loop = true;
  timerAudio.play().catch(() => { });
  comboTimer = setInterval(() => {
    comboTimeLeft--;
    if (comboTimerElem) comboTimerElem.textContent = `Süre: ${comboTimeLeft} sn`;
    if (comboTimeLeft <= 0) {
      clearInterval(comboTimer);
      if (comboTimerElem) comboTimerElem.style.display = "none";
      // Stop timer sound
      if (timerAudio) {
        timerAudio.pause();
        timerAudio.currentTime = 0;
      }
      if (feedbackElem) feedbackElem.textContent = "⏰ Süre doldu!";
      setTimeout(nextQuestion, 1500);
    }
  }, 1000);
} else {
  if (comboTimer) clearInterval(comboTimer);
  if (comboTimerElem) comboTimerElem.style.display = "none";
  // Stop timer sound
  if (timerAudio) {
    timerAudio.pause();
    timerAudio.currentTime = 0;
  }
} */

if (["Grup-9", "Grup-10"].includes(getCurrentLevel())) {
  correctStreak = 0; // Never trigger combo
}

function updateLeaderboard() {
  // Fictional players
  const fictionalPlayers = [
    { name: "Gokhan", points: 135 },
    { name: "Rukiye", points: 87 },
    { name: "Betul", points: 42 },
    { name: "Zeynep", points: 19 },
    { name: "Asya", points: 102 }
  ].map(player => ({
    ...player,
    level: getLevelFromPoints(player.points)
  }));

  // Add Azra (the current player)
  const azraEntry = {
    name: "Azra",
    points: points,
    level: getCurrentLevel()
  };

  // Combine and sort
  let leaderboard = [...fictionalPlayers, azraEntry];
  leaderboard.sort((a, b) => b.points - a.points);

  const leaderboardCharacter = document.getElementById("leaderboard-character");
    const currentLevel = getCurrentLevel();
    const imgSrc = levelCharacterImages[currentLevel];
    if (leaderboardCharacter && imgSrc) {
      leaderboardCharacter.src = imgSrc;
      leaderboardCharacter.style.display = "block";
    } else if (leaderboardCharacter) {
      leaderboardCharacter.style.display = "none";
    }

  const leaderboardList = document.getElementById("leaderboard-list");
  if (!leaderboardList) return;

  leaderboardList.innerHTML = "";
  leaderboard.forEach(entry => {
    const tr = document.createElement("tr");
    if (entry.name === "Azra" && entry.points === points) {
      tr.className = "leaderboard-current";
    }
    tr.innerHTML = `
      <td>${entry.name}</td>
      <td>${entry.level}</td>
      <td>${entry.points}</td>
    `;
    leaderboardList.appendChild(tr);
  });
}