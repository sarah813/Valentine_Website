console.log("dino.js loaded");

function startDinoGame(canvasId, options = {}) {

    let previewObstaclesEnabled = false; // toggle at runtime (no reload)

    // Basic game settings
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    let groundY = canvas.height - 30;
    const targetScore = options.targetScore ?? 200;
    const onWin = options.onWin ?? (() => {});
    const onLose = options.onLose ?? (() => {});

    let won = false;
    let score = 0;

  // Running animation state
    let runFrame = 0;            // 0 or 1
    let runTime = 0;             // accumulates milliseconds
    const runFrameMs = 120;      // how fast the legs appear to move
    let dino = null;

    function resizeCanvas() {
    const maxW = 700;
    const minW = 300;

    const w = Math.max(minW, Math.min(maxW, window.innerWidth * 0.8));
      const h = w * 0.28;

    canvas.width = Math.floor(w);
    canvas.height = Math.floor(h);
    groundY = canvas.height - 20;

    // If the player exists, snap it to the ground after resize
    if (dino) {
        dino.y = groundY - dino.h;
        dino.vy = 0;
        dino.onGround = true;
    }
    }

    function previewObstacles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // optional background ground line
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();

      // draw each obstacle with its own w/h in a row
      let x = 20;
      const allPreview = obstacleImgs.concat(obstacleRareImgs);
      for (const o of allPreview) {
          const w = o.w ?? 40;  // fallback if you haven't added sizes yet
          const h = o.h ?? 40;

          const y = groundY - h;

            if (o.img.complete && o.img.naturalWidth > 0) {
            ctx.drawImage(o.img, x, y, w, h);
            } else {
            // fallback box if image isn't loaded yet
            ctx.fillRect(x, y, w, h);
            }

            // move x to the right for next one
            x += w + 20;
        }
    }


    resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Toggle obstacle preview without reloading (press P or call in console)
  window.toggleObstaclePreview = () => {
    previewObstaclesEnabled = !previewObstaclesEnabled;
    if (previewObstaclesEnabled) {
      previewObstacles(); // immediate draw
    }
  };

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "p") {
      window.toggleObstaclePreview();
    }
  });

    const width = 35;

    dino = {
    x: 60,
    y: groundY - 40,
    w: width,
    h: width * 0.645,
    vy: 0,
    onGround: true,
    };

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

    const obstacleImgs = [
        { img: new Image(), src: "images/cute-frog1.png", w: 35, h: 40 },
        { img: new Image(), src: "images/cute-frog2.png", w: 35, h: 50 },
        { img: new Image(), src: "images/cute-frog3.png", w: 35, h: 70  },

        { img: new Image(), src: "images/plant1.png", w: 30, h: 55 },
        { img: new Image(), src: "images/plant2.png", w: 44, h: 70 },
    ];

    const obstacleRareImgs = [
        { img: new Image(), src: "images/cute-duck.png", w: 35, h: 45 },
    ]

    // Obstacles
    let obstaclesReady = 0;
    let obstacles = [];
    let spawnTimer = 0;
      let spawnEvery = 40; // smaller means more frequent spawns

    //check if loaded
    for (const o of obstacleImgs) {
        o.img.src = o.src;

        o.img.onload = () => {
            obstaclesReady += 1;
        };

        o.img.onerror = () => {
            console.log("Could not load:", o.src);
        };
    }

    for (const o of obstacleRareImgs) {
        o.img.src = o.src;

        o.img.onload = () => {
            obstaclesReady += 1;
        };

        o.img.onerror = () => {
            console.log("Could not load:", o.src);
        };
    }

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
              spawnEvery = 45 + Math.floor(Math.random() * 25);

            let prob = Math.random();
            let pick = null;

              if (prob < 0.1) {
                  pick = obstacleRareImgs[0];
              } else {
                  pick = obstacleImgs[Math.floor(Math.random() * obstacleImgs.length)];
              }
  
              // Choose a size for the obstacle (fallback if not provided)
              const w = pick.w ?? (28 + Math.floor(Math.random() * 18));
              const h = pick.h ?? (40 + Math.floor(Math.random() * 30));
  
              obstacles.push({
                  img: pick.img,
                  x: canvas.width + 10,
                  y: groundY - h,
                  w,
                  h,
              });

        }

        // Check collisions after movement
        for (const o of obstacles) {
            if (hits(dino, o)) {
                running = false;
                onLose(displayScore);
                return;
            }
        }

        // Move obstacles
        obstacles = obstacles.map((o) => ({ ...o, x: o.x - speed }));

        // Remove off screen obstacles
        obstacles = obstacles.filter((o) => o.x + o.w > -10);
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

        //Obstacles
                // Check collisions
        for (const o of obstacles) {
        // If the image is loaded, draw it
            if (o.img && o.img.complete && o.img.naturalWidth > 0) {
                ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
            } else {
                // Fallback if image is not ready yet
                ctx.fillStyle = "#000";
                ctx.fillRect(o.x, o.y, o.w, o.h);
            }
        }

        // ----- UI text (score + messages) -----

        const displayScore = Math.floor(score / 10);
        // padding from edges, responsive to canvas size
        const pad = Math.round(Math.max(12, canvas.width * 0.03));

        // Score (top left)
        ctx.fillStyle = "#95143d";          // color for your UI text
        ctx.textAlign = "left";             // left aligned for score
        ctx.font = '18px "RusticRoadway"';  // same font family as your site (or use sans-serif if you prefer)
        ctx.textBaseline = "top"; // makes y coordinate act like “top edge”
        ctx.fillText("Score: " + displayScore, pad, pad);//15, 35); //fix x & y position of score

        // Center message (win / game over)
        ctx.textAlign = "center";           // center alignment for big message

        if (won) {
        ctx.font = '26px "RusticRoadway"';
        ctx.fillText("You win!", canvas.width / 2, canvas.height / 2);
        } else if (!running) {
        ctx.font = '30px "RusticRoadway"';
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        }

        // Reset alignment if you draw more text later
        ctx.textAlign = "left";
    }

    let lastTime = 0;

  function loop(time) {

      if (previewObstaclesEnabled) {
          previewObstacles();
          requestAnimationFrame(loop); // keep preview updating (and redraw on resize)
          return; // stop here, no gameplay
      }
    
    const dt = time - lastTime;
    lastTime = time;

    update(dt);
    draw();


    requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

}
