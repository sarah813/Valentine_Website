// Elements
const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");

const letter_window = document.querySelector(".letter-window");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".btn[alt='Yes']");

const title = document.getElementById("letter-title");
//const catImg = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

// Game elements
const gameContainer = document.getElementById("game-container");
const canvas = document.getElementById("dino-canvas");
const ctx = canvas.getContext("2d");
const winContainer = document.getElementById("win-container");

// Prevent starting the game multiple times
let gameStarted = false;

console.log("letter_window is", letter_window);
console.log("startDinoGame is", typeof startDinoGame); 

function clamp(value, min, max){
    return Math.max(min, Math.min(max,value));
}

const minScale = 0.1;  // smallest size when very close
const maxDist = 220;    // distance in px where shrinking stops

envelope.addEventListener("click", () => {
    envelope.style.display = "none";
    letter.style.display = "flex";

    requestAnimationFrame(() => {
        letter_window.classList.add("open");
    })
});

letter_window.addEventListener("pointermove", (e) => {
    const rect = noBtn.getBoundingClientRect();

    const cx = rect.left + rect.width /2
    const cy = rect.top + rect.height /2

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const power = 2;

    const d = clamp(dist / maxDist, 0, 1); //between 0 & 1, close -> far
    const dPower = Math.pow(d, power);

    const scale = minScale + (1 - minScale) * dPower;

    noBtn.style.transform = `scale(${scale})`;
})

letter_window.addEventListener("pointerleave", () => {
  // Reset when the cursor leaves the window
  noBtn.style.transform = "scale(1)";
});

yesBtn.addEventListener("click", () => {
  // 1) Change the title text
  title.textContent = "You thought it would be easy? First prove yourself!";

  // 2) Hide the cat and the Yes No buttons so the focus is the game
  //catImg.style.display = "none";
  buttons.style.display = "none";
  // 3) Show the game container
  gameContainer.style.display = "block";

  // 4) Start the game only once
  if (!gameStarted) {
    
    gameStarted = true;

    console.log("gameContainer:", gameContainer);
    console.log("winContainer:", winContainer);
    console.log("title:", title);

    startDinoGame("dino-canvas",{
        targetScore: 100,
        onWin: () => {
            gameContainer.style.display = "none";
            winContainer.style.display ="block";
            title.textContent = "You did it! Onto the next task";
        },
    });

  }
});

