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

//Level 2
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-btn");
const startLevel2 = document.getElementById("level2");

// MCQ elements
const multipleChoice = document.getElementById("MCQ");
const mcqScoreEl = document.getElementById("mcq-score");
const mcqProgress = document.getElementById("mcq-progress");
const mcqQuestion = document.getElementById("mcq-question");
const mcqOptions = document.getElementById("mcq-options");
const mcqFeedback = document.getElementById("mcq-feedback");
const mcqNext = document.getElementById("mcq-next");
//Win Loose
const winCont = document.getElementById("WIN-MCQ");
const looseCont = document.getElementById("LOOSE-MCQ");
const fullRestartBtn = document.getElementById("restart-btn-2");
const nextBtn2 = document.getElementById("next-btn-last");

//To do list
const todolist = document.getElementById("TodoList");
const todolistItems = document.getElementById("todo-items");

// Prevent starting the game multiple times
let gameStarted = false;

console.log("letter_window is", letter_window);
console.log("startDinoGame is", typeof startDinoGame); 

function clamp(value, min, max){
    return Math.max(min, Math.min(max,value));
}

function hide(el) {
  if (!el) return;
  el.style.display = "none";
}

function show(el, display = "block") {
  if (!el) return;
  el.style.display = display;
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
        targetScore: 30, //change max score here
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

//Level 2:
nextBtn.addEventListener("click",() => {
    looseContainer.style.display = "none";
    winContainer.style.display = "none";
    title.textContent = "Now, let's see if you really love me!";
    startLevel2.style.display = "block";
})

// 10 questions
const QUESTIONS = [
  { q: "What is the name of my dog?", options: ["Ceyna", "Seina", "Cina", "Ceyla"], answer: [0] },
  { q: "What is my fevorite flower?", options: ["Lillies", "Roses", "Carnation", "Peonies"], answer: [2] },
  { q: "Pick my favorite date location", options: ["Coffee place", "Flowerfield", "Restaurant", "Beach"], answer: [1] },
  { q: "What do I like most:", options: ["Water", "Mountains", "City", "Forest"], answer: [1] },
  { q: "How to best surprise me?", options: ["Flowers", "Love letter/Note", "Surprise Date", "Movie Night with snacks"], answer: [0,1,2,3] },
  { q: "What to do when I am sad", options: ["Hug me & say all will be okay", "Give me space & let me come to you", "Find solutions to my problems", "A hot drink"], answer: [0] },
  { q: "If I am stressed, I want", options: ["Silence", "A cuddle", "A plan", "Help with my task"], answer: [2] },
  { q: "My favorite genre", options: ["Crime", "History", "Romance", "Action"], answer: [0] },
  { q: "What do I like most about you", options: ["Your eyes", "Your humour", "Your comfort", "Your amazing body"], answer: [0,1,2,3] },
  { q: "How many cousins do I have?", options: ["6 girls, no guys", "4 girls, one guy", "5 girls, 2 guys", "7 girls, one guy"], answer: [3] },
  { q: "Who loves who more", options: ["I love you more", "You love me more", "Equal!"], answer: [0] },
];


let answers = [];

function renderQuestion(i) {
      const item = QUESTIONS[i];     

      // Show the question in the main title area
      title.textContent = item.q;
    // Keep mcq-question as a subtitle (set on start)

      // reset selections for this question
      answers = [];
      mcqOptions.innerHTML = "";

      item.options.forEach((text, idx) => {
          const opt = document.createElement("div");
          opt.className = "mcq-option";
          opt.textContent = text;

          //When clicking an option
          opt.addEventListener("click", () => {
            console.log("clicked option index:", idx);
            if(opt.classList.contains("is-selected")){
                opt.classList.remove("is-selected");
                answers = answers.filter(x => x !== idx);
                console.log("after remove:", answers);
            }else{
                opt.classList.add("is-selected");
                answers.push(idx);
                console.log("selected idx:", idx);
                console.log("Answer Array:", answers);
            }
          })
          mcqOptions.appendChild(opt);
      });  
}

let mcqIndex = 0;
let mcqScore = 0;
let mcqScoreGen = 0;

startBtn.addEventListener("click",() => {
    looseContainer.style.display = "none";
    winContainer.style.display = "none";
    startLevel2.style.display = "none";
    title.textContent = "Let's see if you can answer these questions.";
    multipleChoice.style.display = "block";
    
    mcqIndex = 0;
    mcqScore = 0;

    updateMcqScore(mcqScoreGen);

  renderQuestion(mcqIndex);
})

mcqNext.addEventListener("click", () => {
    const current = QUESTIONS[mcqIndex];
    console.log(current);

    if(current.answer.slice().sort().join(",") == answers.slice().sort().join(",")){
        mcqScore += 1;
        mcqScoreGen += 1;
    }

    console.log("Score:", mcqScore);

    mcqIndex += 1;
    answers = []; // important: clear selection

    if(mcqIndex < QUESTIONS.length){
        renderQuestion(mcqIndex);
        updateMcqScore(mcqScoreGen);
    }else{
        console.log("Finished! Score:", mcqScore);
        
        multipleChoice.style.display = "none";       

          if(mcqScoreGen>6){
              winCont.style.display = "block";
              title.textContent = "Yeay you actually love me!";
          }else{
              looseCont.style.display = "block";
              title.textContent = "Do you even know me at all..?";
          }
    }
})

const TODOList = [
  { t: "Flowers"},
  { t: "Good Mood"},
];

nextBtn2.addEventListener("click", () => {
    winCont.style.display = "none";
    todolist.style.display = "block";
    
    todolistItems.innerHTML = "";

    item.options.forEach((text, idx) => {
          const opt = document.createElement("div");
          opt.className = "mcq-option";
          opt.textContent = text;

          //When clicking an option
          opt.addEventListener("click", () => {
            console.log("clicked option index:", idx);
            if(opt.classList.contains("is-selected")){
                opt.classList.remove("is-selected");
                answers = answers.filter(x => x !== idx);
                console.log("after remove:", answers);
            }else{
                opt.classList.add("is-selected");
                answers.push(idx);
                console.log("selected idx:", idx);
                console.log("Answer Array:", answers);
            }   
           })
    })
})



nextBtn2.addEventListener("click", () => {})

function updateMcqScore(score) {
  mcqScoreEl.textContent = `Score: ${score}`;
}

//Loose MCQ


fullRestartBtn.addEventListener("click", () => {
  hide(looseCont);
  hide(winCont);
  hide(multipleChoice);
  hide(gameContainer);
  hide(winContainer);
  hide(looseContainer);
  hide(startLevel2);
  hide(tooLongContainer);

  show(buttons, "flex");          // IMPORTANT: buttons need flex
  title.textContent = "Will you be my Valentine?";

  yesBtn.classList.remove("disabled");
  yesBtn.style.opacity = "1";

  const winTextEl = winContainer.querySelector(".win-text");
  if (winTextEl) winTextEl.textContent = ""; // clear old message

  gameStarted = false;
  mcqIndex = 0;
  mcqScore = 0;
  mcqScoreGen = 0;
  answers = [];
});



