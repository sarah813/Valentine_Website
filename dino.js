console.log("dino.js loaded");

function startDinoGame(canvasId, options = {}) {

    // Basic game settings
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const groundY = canvas.height - 30;
    const targetScore = options.targetScore ?? 200;
    const onWin = options.onWin ?? (() => {});
    const onLose = options.onLose ?? (() => {});

    let won = false;
    let score = 0;

  // Running animation state
    let runFrame = 0;            // 0 or 1
    let runTime = 0;             // accumulates milliseconds
    const runFrameMs = 120;      // how fast the legs appear to move


    // Cat sprite image setup
    const catRunImg = new Image();
    catRunImg.src = "images/pixel-cat-run.png";

    const catStandImg = new Image();
    catStandImg.src = "images/pixel-cat-idle.png";

    let runReady = false;
    let standReady = false;

    catRunImg.onload = () => (runReady = true);
    catStandImg.onload = () => (standReady = true);

    catRunImg.onerror = () => console.log("Could not load:", catRunImg.src);
    catStandImg.onerror = () => console.log("Could not load:", catStandImg.src);

    const width = 35;

    // Dino state
    const dino = {
        x: 60,
        y: groundY - 40,
        w: width, //player size
        h: width*0.645, //player height
        vy: 0,
        onGround: true,
    };

    // Obstacles
    let obstacles = [];
    let spawnTimer = 0;
    let spawnEvery = 60; // smaller means more frequent spawns

    // Physics
    const gravity = 0.9;
    const jumpVelocity = -14;

    // Game state
    let speed = 6;
    let running = true;

    // Helper: collision test (rectangle vs rectangle)
    function hits(a, b) {
        // shrink the player hitbox a bit so it feels fair
        const padX = 6;
        const padY = 6;

        const ax = a.x + padX;
        const ay = a.y + padY;
        const aw = a.w - padX * 2;
        const ah = a.h - padY * 2;

        return (
            ax < b.x + b.w &&
            ax + aw > b.x &&
            ay < b.y + b.h &&
            ay + ah > b.y
        );
    }


    // Jump action
    function jump() {
        if (!running) return;
        if (dino.onGround) {
        dino.vy = jumpVelocity;
        dino.onGround = false;
        }
    }

    // Controls: Space or ArrowUp
    window.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.code === "ArrowUp") jump();
    });

    // Controls: tap or click on the canvas
    canvas.addEventListener("pointerdown", () => jump());

    function update(dt) {
        if (!running) return;
        // Increase difficulty slowly
        speed += 0.002;

        // Apply gravity
        dino.vy += gravity;
        dino.y += dino.vy;

        score += 1;
        const displayScore = Math.floor(score / 10);

        /* Win condition */
        if (displayScore >= targetScore) {
            won = true;
            running = false;
            onWin(displayScore);
            return;
        }

        if (dino.onGround) {
            runTime += dt;

            if (runTime >= runFrameMs) {
            runTime = 0;
            runFrame = 1 - runFrame; // toggles 0 to 1 to 0
            }
        } else {
            // In air, we do not animate running
            runTime = 0;
            runFrame = 0;
        }

        // Ground collision
        if (dino.y >= groundY - dino.h) {
        dino.y = groundY - dino.h;
        dino.vy = 0;
        dino.onGround = true;
        }

        // Spawn obstacles
        spawnTimer += 1;
        if (spawnTimer >= spawnEvery) {
        spawnTimer = 0;

        // Randomize spawn timing a bit
        spawnEvery = 70 + Math.floor(Math.random() * 40);

        // Create a cactus like obstacle
        const h = 30 + Math.floor(Math.random() * 30);
        obstacles.push({
            x: canvas.width + 10,
            y: groundY - h,
            w: 18 + Math.floor(Math.random() * 14),
            h: h,
        });
        }

        // Move obstacles
        obstacles = obstacles.map((o) => ({ ...o, x: o.x - speed }));

        // Remove off screen obstacles
        obstacles = obstacles.filter((o) => o.x + o.w > -10);

        // Check collisions
        for (const o of obstacles) {
        if (hits(dino, o)) {
            running = false;
            onLose(displayScore);
            return;
        }
        }
    }

    function draw() {
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();

        // Cat character
        // Draw player sprite
        if (!runReady || !standReady) {
        // fallback while images load
        ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
        } else {
        if (!dino.onGround) {
            // Jumping -> always use the run image
            ctx.drawImage(catRunImg, dino.x, dino.y, dino.w, dino.h);
        } else {
            // Running -> swap constantly between idle and run
            const imgToDraw = (runFrame === 0) ? catStandImg : catRunImg;
            ctx.drawImage(imgToDraw, dino.x, dino.y, dino.w, dino.h);
        }
        }  


        ctx.font = "18px sans-serif";
        const displayScore = Math.floor(score / 10);
        ctx.fillText("Score: " + displayScore, 12, 24);

        if (won) {
            ctx.font = "22px sans-serif";
            ctx.fillText("You win!", canvas.width / 2 - 40, canvas.height / 2);
        }

        // Obstacles
        for (const o of obstacles) {
        ctx.fillRect(o.x, o.y, o.w, o.h);
        }

        // Score text
        ctx.font = "18px sans-serif";
        ctx.fillText("Score: " + Math.floor(score / 10), 12, 24);

        // Game over message
        if (!running) {
        ctx.font = "22px sans-serif";
        ctx.fillText("Game Over", canvas.width / 2 - 55, canvas.height / 2);
        ctx.font = "16px sans-serif";
        ctx.fillText("Refresh to try again", canvas.width / 2 - 70, canvas.height / 2 + 24);
        }
    }

    let lastTime = 0;

    function loop(time) {
    const dt = time - lastTime;
    lastTime = time;

    update(dt);
    draw();

    requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

}
