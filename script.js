// Elements
const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");

const letter_window = document.querySelector(".letter-window");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".btn[alt='Yes']");

const title = document.getElementById("letter-title");
const catImg = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

console.log("letter_window is", letter_window);

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
