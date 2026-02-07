// Elements
const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");

const letter_window = document.querySelector(".letter-window");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".btn[alt='Yes']");

const tooLongContainer = document.getElementById("toolong-container");
const grumpyCat = document.getElementById("grumpy-cat");

const title = document.getElementById("letter-title");
//const catImg = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

// Game elements
const gameContainer = document.getElementById("game-container");
const canvas = document.getElementById("dino-canvas");
const ctx = canvas.getContext("2d");
const winContainer = document.getElementById("win-container");
const looseContainer = document.getElementById("loose-container");
const gameHint = document.getElementById("game-hint");
const restartBtn = document.getElementById("restart-btn");

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
    
    //grumpy cat

    const intensity = 1 - dPower; // 0 far, 1 close

    grumpyCat.style.opacity = intensity;

    // Rotation: far = -90deg, close = 0deg
    const startAngle = -90;  // hidden
    const endAngle = -30;    // still tilted when fully visible

    const angle = startAngle + (endAngle - startAngle) * intensity;

    // Translate: far = 110%, close = 0%
    const slide = (1 - intensity) * 110;

    grumpyCat.style.transform = `translateX(${slide}%) rotate(${angle}deg)`;

})

letter_window.addEventListener("pointerleave", () => {
  // Reset when the cursor leaves the window
  noBtn.style.transform = "scale(1)";
});

yesBtn.addEventListener("animationend", () => {
    const state = getComputedStyle(yesBtn).opacity;
    console.log("opacity after fade:", state);

    if(state == "0.1"){
        yesBtn.classList.add("disabled");
    }
    
    buttons.style.display = "none";

    setTimeout(() => {
    tooLongContainer.style.display = "block"; // or "flex" if you want flex layout
    }, 400); // 3000 ms = 3 seconds
 
})

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

    const originalHint = gameHint ? gameHint.textContent : "";
    let seconds = 4;
    if (gameHint) gameHint.textContent = `Get ready... `;

    console.log("gameContainer:", gameContainer);
    console.log("winContainer:", winContainer);
    console.log("title:", title);

    const countdownId = setInterval(() => {
      seconds -= 1;

      if (seconds >= 0) {
        if (gameHint) gameHint.textContent = `Starting in ${seconds}`;
      } else {
        clearInterval(countdownId);
      }
    }, 1000);

    setTimeout(() => {
      if (gameHint) gameHint.textContent = originalHint;

      startDinoGame("dino-canvas", {
        targetScore: 50,
        onWin: () => {
          gameContainer.style.display = "none";
          winContainer.style.display = "flex";
          title.textContent = "You did it! Onto the next level";
        },

          onLose: () => {
            gameContainer.style.display = "none";
            winContainer.style.display = "none";

            const looseText = looseContainer.querySelector(".loose-text");
            if (looseText) looseText.textContent = "Game Over!";

            // Use flex so the restart image sits directly under the text
            looseContainer.style.display = "flex";
          },
      });
    }, 5000);

  }
});

// Restart button click
restartBtn.addEventListener("click", () => {
  // 1) Hide the lose screen
  looseContainer.style.display = "none";
  // 2) Hide win screen too (just in case)
  winContainer.style.display = "none";
  // 3) Show the game again
  gameContainer.style.display = "block";
  // 4) Reset title (optional: you can keep your “prove yourself”)
  title.textContent = "You thought it would be easy? First prove yourself!";

  // 5) Allow the game to start again
  gameStarted = false;

  yesBtn.classList.remove("disabled")

  yesBtn.style.opacity = "1"

  // 6) Simulate clicking Yes to restart the whole flow
  yesBtn.click();
});


