// Global variables (these were already global in your original script)
let points = parseInt(localStorage.getItem('points')) || 0;
//const currentLevel = getCurrentLevel();
const levels = [
  "Grup-1", "Grup-2", "Grup-3", "Grup-4", "Grup-5",
  "Grup-6", "Grup-7", "Grup-8", "Grup-9", "Grup-10"
];
//const currentLevelIndex = levels.indexOf(currentLevel);
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
  mainSectionContainer = document.getElementById("main-section");
  gameSectionContainer = document.getElementById("game-section");
  levelSectionContainer = document.getElementById("level-section");
  sudokuSectionContainer = document.getElementById("sudoku-section");
  leaderboardSectionContainer = document.getElementById("leaderboard-section");

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
  const characterImg = document.getElementById("levelup-character");
  const newLevel = getCurrentLevel();
  if (!overlay || !characterImg) return;

  // Set character image based on level
  const imgSrc = levelCharacterImages[newLevel];
  if (imgSrc) {
    characterImg.src = imgSrc;
    characterImg.style.display = "block";
  } else {
    characterImg.style.display = "none";
  }

  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.style.display = "none";
    characterImg.style.display = "none";
  }, 2500); // 12.5 seconds
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
  timerAudio.play().catch(() => {});

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

function updateLeaderboard() {
  // ...existing leaderboard logic...

  // Show character image for current level
  const leaderboardCharacter = document.getElementById("leaderboard-character");
  const currentLevel = getCurrentLevel();
  const imgSrc = levelCharacterImages[currentLevel];
  if (leaderboardCharacter && imgSrc) {
    leaderboardCharacter.src = imgSrc;
    leaderboardCharacter.style.display = "block";
  } else if (leaderboardCharacter) {
    leaderboardCharacter.style.display = "none";
  }

  // ...existing leaderboard table population logic...
}
