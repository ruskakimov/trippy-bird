(function() {
  var canvas = document.getElementById('game-canvas');
  var ctx = canvas.getContext('2d');

  var dpr = window.devicePixelRatio || 1;

  var wh = window.innerHeight;
  var ww = window.innerWidth;
  var width = Math.floor(wh / 3 * 2);
  var height = Math.floor(ww / 2 * 3);

  if (ww >= width) {
    canvas.height = wh;
    canvas.width = width;
    canvas.style.height = wh + 'px';
    canvas.style.width = width + 'px';
  } else {
    canvas.height = height;
    canvas.width = ww;
    canvas.style.height = height + 'px';
    canvas.style.width = ww + 'px';
  }

  canvas.width *= dpr;
  canvas.height *= dpr;
  // ctx.scale(dpr, dpr);

  if (window.localStorage['highscore'] === undefined) {
    window.localStorage['highscore'] = 0;
  }

  var CW = canvas.width;

  var g = CW / 200;
  var score = 0;
  // screen value:
  // 0 - start
  // 1 - game
  // 2 - end screen
  var screen = 0;
  var intervalID = null;

  var themeID = 0;
  var themes = [
    {
      back: '#381440',
      bird: '#ff0',
      pipe: '#f00'
    },
    {
      back: '#028e9b',
      bird: '#98ed00',
      pipe: '#ff0d00'
    },
    {
      back: '#ffe800',
      bird: '#1049a9',
      pipe: '#d9005b'
    },
    {
      back: '#dc0055',
      bird: '#ffc900',
      pipe: '#01939a'
    },
    {
      back: '#00b454',
      bird: '#ffd200',
      pipe: '#b70094'
    },
    {
      back: '#104ba9',
      bird: '#ff8100',
      pipe: '#00ac6b'
    },
    {
      back: '#a5ef00',
      bird: '#e7003e',
      pipe: '#00bd39'
    }
  ];

  var bird = {
    x: CW / 8,
    y: CW / 8,
    vy: 0,
    width: CW / 8,
    jumpVY: -(CW * 0.05)
  };

  var pipe = {
    x: CW,
    gap: {
      y: CW / 4,
      height: CW * 0.45
    },
    vx: -(CW / 40),
    width: CW / 8
  };

  function nextTheme() {
    themeID += 1;
    if (themeID >= themes.length) themeID = 0;
    canvas.style.backgroundColor = themes[themeID].back;
  }

  function drawScene() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    tick();

    drawPipe();
    drawBird();

    if (pipe.x < -pipe.width) {
      makePipe();
      score += 1;
      window.localStorage['highscore'] = Math.max(
        window.localStorage['highscore'],
        score
      );
    }

    if (checkCollision()) {
      endGame();
    }
  }

  function drawBird() {
    ctx.beginPath();
    ctx.rect(bird.x, bird.y, bird.width, bird.width);
    ctx.fillStyle = themes[themeID].bird;
    ctx.fill();
  }

  function drawPipe() {
    ctx.beginPath();
    ctx.rect(pipe.x, 0, pipe.width, pipe.y);
    ctx.rect(
      pipe.x,
      pipe.y + pipe.gap.height,
      pipe.width,
      canvas.height - pipe.y - pipe.gap.height
    );
    ctx.fillStyle = themes[themeID].pipe;
    ctx.fill();
  }

  function drawScore() {
    ctx.font = CW / 8 + 'px monospace';
    ctx.fillStyle = themes[themeID].bird;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('last:', CW, CW * 0.2);
    ctx.fillText('best:', CW, CW * 0.7);

    ctx.font = CW / 3.3 + 'px Arial, sans-serif';
    ctx.fillText(score, CW * 0.97, CW * 0.3);
    ctx.fillText(window.localStorage['highscore'], CW * 0.97, CW * 0.8);
  }

  function drawCommand(command) {
    ctx.font = 'bold ' + CW / 20 + 'px monospace';
    ctx.fillStyle = themes[themeID].bird;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    var y = screen === 2 ? CW * 1.35 : CW * 0.75;
    ctx.fillText('press <' + command + '> or tap', CW / 2, y);
  }

  function makePipe() {
    pipe.y = randInt(CW / 8, canvas.height - pipe.gap.height - CW / 4);
    pipe.x = CW;
  }

  function tick() {
    bird.y += bird.vy;
    bird.vy += g;
    pipe.x += pipe.vx;
  }

  function checkCollision() {
    if (bird.y > canvas.height || bird.y < -bird.width) {
      return true;
    } else if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
      // pipe x collision
      if (bird.y < pipe.y || bird.y + bird.width > pipe.y + pipe.gap.height) {
        // pipe y collision
        return true;
      }
    }
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function endGame() {
    screen = 3;
    clearInterval(intervalID);
    setTimeout(function() {
      screen = 2;
      drawScore();
      drawCommand('space');
    }, 400);
  }

  function startGame() {
    screen = 1;
    score = 0;
    bird.y = CW / 8;
    bird.vy = 0;
    makePipe();
    intervalID = setInterval(drawScene, 1000 / 30);
    nextTheme();
  }

  function jump() {
    bird.vy = bird.jumpVY;
  }

  window.addEventListener('keypress', function(e) {
    e.preventDefault();
    switch (e.key) {
      case ' ':
        if (screen === 0 || screen === 2) {
          startGame();
        } else if (screen === 1) {
          jump();
        }
        break;
    }
  });

  function touchHandler(e) {
    if (e.touches) {
      e.preventDefault();
      if (screen === 0 || screen === 2) {
        startGame();
      } else if (screen === 1) {
        jump();
      }
    }
  }

  window.addEventListener('touchstart', touchHandler);

  drawCommand('space');
})();
