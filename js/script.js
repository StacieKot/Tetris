'use strict';

function createGame(){
  const columns = 10;
  const rows = 20;
  const blockSize = calculateWindowSize();
  console.log(blockSize);

  const boardSettings = {
    columns : columns,
    rows : rows,
    blockSize : blockSize
  };

  const gameColors = [
    {x : 190, y : 130},
    {x : 100, y : 120},
    {x : 10, y : 160},
    {x : 0, y : 20},
    {x : 190, y : 40},
    {x : 50, y : 70},
    {x : 240, y : 90},
    {x : 285, y : 0},
    {x : 331, y : 0},
    {x : 331, y : 126},
    {x : 285, y : 126}
  ];

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.canvas.width = boardSettings.columns * boardSettings.blockSize;
  context.canvas.height = boardSettings.rows * boardSettings.blockSize;
  canvas.classList.add('game-area');
  document.querySelector('.tetris').appendChild(canvas);
  document.querySelector('.container').style.visibility = "visible";
  
  class Board {
    constructor(context, colors) {
      this.activeTetramino = null;
      this.context = context;
      this.colors = colors;
      this.image = new Image();
      this.image.src = 'assets/blocks.png';
      this.image.width = 40;
      this.image.height = 40;
      this.fullRowsNum = null;
      this.newRow = Array(boardSettings.columns).fill(0);
    }
  
    reset() {
      this.grid = (() => {
        return Array.from(Array(boardSettings.rows), () => Array(boardSettings.columns).fill(0));
      })(); 
    }
  
    horizValid(x) {
      return x >= 0 && x < boardSettings.columns ? true : false;
    }
  
    verticalValid(y) {
      return y < boardSettings.rows ? true : false;
    }
  
    isFree(x, y) {
      return this.grid[y] && this.grid[y][x] === 0 ? true : false;
    }
  
    validatePos(pos) {
      return pos.shape.every( (row, shapeY) => {
        return row.every( (value, shapeX) => {
          const currX = pos.x + shapeX;
          const currY = pos.y + shapeY;
          return value === 0 || (currY < 0 && currX > 0 && currX < boardSettings.columns) ||  (this.horizValid(currX) && this.verticalValid(currY) && this.isFree(currX, currY));
        });
      });
    }
  
    saveSett() {
       const cloneGrid =  JSON.parse(JSON.stringify(this.grid)); 
        this.activeTetramino.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value > 0 && cloneGrid[y]) {
              cloneGrid[y + this.activeTetramino.y][x + this.activeTetramino.x] = value;
            } 
          });
        });
        this.grid = cloneGrid;
    }
  
    drawBoardGrid() {
      this.grid.forEach( (row, y) => {
        row.forEach( (value, x) => {
          if (value > 0) {
            this.context.drawImage(this.image, this.colors[value - 1].x, this.colors[value - 1].y, this.image.width, this.image.height, x*boardSettings.blockSize, y*boardSettings.blockSize, boardSettings.blockSize, boardSettings.blockSize);
          }
        });
      });
    }
  
    clearFullRows() {
      this.fullRowsNum = 0;
      this.grid.forEach((row, y) => {
        if (row.every(value => value > 0)) {
          this.fullRowsNum++;
          this.grid.splice(y, 1);
          this.grid.unshift(this.newRow);
        }
      });
    }
  
  }
  
  class Tetramino {
    constructor(context, colors) {
      this.context = context;
      this.shapes = [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
        [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
        [[4, 4], [4, 4]],
        [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
        [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
        [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
        [[8, 0, 8], [8, 8, 8], [0, 0, 0]],
        [[9, 0, 0], [9, 9, 9], [0, 0, 9]],
        [[10, 10, 10], [0, 10, 0], [0, 10, 0]],
        [[0, 11, 0], [11, 11, 11], [0, 11, 0]]
      ];
      this.colorsAmount = 7;
      this.colors = colors;
      this.y = -2;
      this.x = 0;
      this.speedX = 1;
      this.speedY = 1;
      this.image = new Image();
      this.image.src = 'assets/blocks.png';
      this.image.width = 40;
      this.image.height = 40;
    }
  
    draw() {
      this.shape.forEach( (row, y) => {
        row.forEach( (value, x) => {
          if (value > 0) {
            this.context.drawImage(this.image, this.colors[value - 1].x, this.colors[value - 1].y, this.image.width, this.image.height, 
              (this.x + x)*boardSettings.blockSize, (this.y + y)*boardSettings.blockSize, boardSettings.blockSize, boardSettings.blockSize);
          }
        });
      });
    }
  
    randomTetramino() {
      this.num = this.randomDiap(this.colorsAmount - 1);
      this.shape = this.shapes[this.num];
      this.x = this.num === 4 ? 4 : 3; 
    }
  
    updatePos(tetramino) {
      this.x = tetramino.x;
      this.y = tetramino.y;
      this.shape = tetramino.shape;
    }
  
    randomDiap(m) {
      return Math.floor(
        Math.random()*(m + 1));
    }
  
    rotateMatrix(tetramino) {
      const newTetramino = JSON.parse(JSON.stringify(tetramino));
      for (let y = 0; y < newTetramino.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [newTetramino.shape[x][y], newTetramino.shape[y][x]] = [newTetramino.shape[y][x], newTetramino.shape[x][y]];
        }
      }
      newTetramino.shape.forEach(row => row.reverse());
      return newTetramino;
    }
    
  }
  
  class TetrisGame {
    constructor(board, context) {
      this.board = board;
      this.context = context;
      this.playBtn = document.querySelector('.play');
      this.pauseBtn = document.querySelector('.pause');
      this.pauseBtnCont = this.pauseBtn.querySelector('.btn-text');
      this.rulesBtns = document.querySelectorAll('.rules');
      this.recordesBtns = document.querySelectorAll('.recordes');
      this.gameOver = document.querySelector('.game-over');
      this.scoreElem = document.querySelector('.score');
      this.levelElem = document.querySelector('.level');
      this.soundOnBtns = document.querySelectorAll('.sound-on'); 
      this.soundOffBtns = document.querySelectorAll('.sound-off'); 
      this.registrBtn = document.querySelector('.submit-btn');
      this.gameArea = document.querySelector('.game-area');
      this.menuBurg = document.querySelector('.menu-burger');
      this.closeBtn = document.querySelector('.close-btn');
      this.menu = document.querySelector('.aside-menu');
      this.dropBtn = document.querySelector('.drop');
      this.tetram = null;
      this.gameReq = null;
      this.count = 0;
      this.timer = null;
      this.score = 0;
      this.point = 100;
      this.fullRowsNum = null;
      this.onPause = false;
      this.level = 1;
      this.progress = null;
      this.eventCodes = {
        'ArrowLeft' : tetr => ({ ...tetr, x: tetr.x - tetr.speedX }),
        'ArrowRight': tetr => ({ ...tetr, x: tetr.x + tetr.speedX }),
        'ArrowDown' : tetr => ({ ...tetr, y: tetr.y + tetr.speedY}),
        'ArrowUp' : tetr => board.activeTetramino.rotateMatrix(tetr),
        'Space' : tetr => ({ ...tetr, y: tetr.y + tetr.speedY})
      };
      this.audioClearRows = new Audio('assets/audio/clear.rf64');
      this.audioMove = new Audio('assets/audio/sounds_block-rotate.mp3');
      this.audioMoveDown = new Audio('assets/audio/selection.rf64');
      this.audioGameOver = new Audio('assets/audio/gameover.rf64');
      this.audioDrop = new Audio('assets/audio/drop.mp3');
      this.audioIsON = 'on';
      this.levelsScore = 1000;
      this.levelsTimer = {
        3 : 31,
        6 : 30,
        9 : 29,
        12 : 28,
        15 : 27,
        18 : 26,
        21 : 25
      }
      this.nickname = null;
      this.touchmoveEventX = [];
      this.touchmoveEventY = [];
      this.touchmoveEventTimer = [];
      this.touchmoveCounter = 0;
      this.touchСoordinates = {
        touchStartX : 0,
        touchStartY : 0,
        touchEndX : 0,
        touchEndX : 0
      }
      
      this.playBtn.addEventListener('click', (event) => this.startPlay(event));
      this.playBtn.addEventListener('touchstart', (event) => this.startPlay(event));
  
      this.pauseBtn.addEventListener('click', (event) => this.pauseGame(event));
      this.pauseBtn.addEventListener('touchstart', (event) => this.pauseGame(event));
    
      this.registrBtn.addEventListener('click', (event) => this.submitRegistr(event));
      this.registrBtn.addEventListener('touchstart', (event) => this.submitRegistr(event));
  
      document.addEventListener('keydown', (event) => {
        this.moveTetramino(event);
      });
      this.gameArea.addEventListener('touchmove', (event) => this.handleTouch(event));
      this.gameArea.addEventListener('touchstart', (event) => this.saveTouchSett(event));
      this.gameArea.addEventListener('touchend', (event) => this.rotateActiveTetramino(event));
      this.dropBtn.addEventListener('touchstart', (event) => this.drop(event));
  
      this.menuBurg.addEventListener('click', (event) => this.openAsideMenu(event));
      this.menuBurg.addEventListener('touchstart', (event) => this.openAsideMenu(event));
  
      this.closeBtn.addEventListener('click', (event) => this.closeAsideMenu(event));
      this.closeBtn.addEventListener('touchstart', (event) => this.closeAsideMenu(event));
  
      this.soundOnBtns.forEach(btn => btn.addEventListener('click', (event) => this.turnOnTheSound(event)));
      this.soundOnBtns.forEach(btn => btn.addEventListener('touchstart', (event) => this.turnOnTheSound(event)));
  
      this.soundOffBtns.forEach(btn => btn.addEventListener('click', (event) => this.turnOffTheSound(event)));
      this.soundOffBtns.forEach(btn => btn.addEventListener('touchstart', (event) => this.turnOffTheSound(event)));
    }
  
    startPlay(event) {
      event.preventDefault();
      cancelAnimationFrame(this.gameReq);
      this.gameReq = null;
      this.onPause = false;
      this.pauseBtnCont.innerHTML = 'Pause';
      this.level = 1;
      this.score = 0;
      this.timer = 32;
      this.scoreElem.innerHTML = this.score;
      this.levelElem.innerHTML = this.level;
      this.gameOver.classList.remove('game-over-active');
      this.count = 0;
      this.touchmoveCounter = 0;
      this.board.reset();
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
      this.createNewTetramino();
      this.animateGame();
    }
  
    moveTetramino(event) {
      if(!this.eventCodes[event.code] || this.onPause) return;
      event.preventDefault();
      let newPosition = this.eventCodes[event.code](this.board.activeTetramino);
      if (event.code === 'Space') {
        while (this.board.validatePos(newPosition)) {
          this.board.activeTetramino.updatePos(newPosition);
          newPosition = this.eventCodes[event.code](this.board.activeTetramino);
        }
        this.playAudio(this.audioDrop);
      } else {
        if (this.board.validatePos(newPosition)) {
          this.board.activeTetramino.updatePos(newPosition);
          if(event.code !== 'ArrowDown') {
            this.playAudio(this.audioMove);
          } 
        }
      }
    }
  
    moweDown() {
      const newPosition = this.eventCodes.ArrowDown(this.board.activeTetramino);
      if(this.board.validatePos(newPosition)) {
        this.board.activeTetramino.updatePos(newPosition);
      } else {
        if (this.board.activeTetramino.y < 0) {
          return false;
        }
        this.board.saveSett();
        this.board.clearFullRows();
        if (this.board.fullRowsNum) {
          this.playAudio(this.audioClearRows);
          this.updateScore();
          this.updateLevel();
        }
        this.createNewTetramino();
      }
      return true;
    }
  
    handleTouch(event) {
      event.preventDefault();
      if (!this.board.activeTetramino) return;
      const touchX = event.targetTouches[0].pageX;
      const touchY = event.targetTouches[0].pageY;
      this.touchmoveEventX.push(touchX);
      this.touchmoveEventY.push(touchY);
      this.touchmoveEventTimer.push(this.touchmoveCounter);
  
      if (this.touchmoveEventX[this.touchmoveEventX.length - 1] > this.touchmoveEventX[0] + boardSettings.blockSize) {
        this.moveActiveTetram('ArrowRight');
      } else if (this.touchmoveEventX[this.touchmoveEventX.length - 1] < this.touchmoveEventX[0] - boardSettings.blockSize) {
        this.moveActiveTetram('ArrowLeft');
      } else if (this.touchmoveEventY[this.touchmoveEventY.length - 1] > this.touchmoveEventY[0] + boardSettings.blockSize) {
        this.moveActiveTetram('ArrowDown');
      } 
    }
  
    moveActiveTetram(event, sound) {
      const newPosition = this.eventCodes[event](this.board.activeTetramino);
      if (this.board.validatePos(newPosition)) {
        this.board.activeTetramino.updatePos(newPosition);
        if (sound) {
          this.playAudio(sound);
        }
      } 
      this.clearTouchCoordArr();
      this.clearTouchTimer();
    }

    drop(event) {
      event.preventDefault();
      if(!this.board.activeTetramino) return;
      let newPosition = this.eventCodes['Space'](this.board.activeTetramino);
      while (this.board.validatePos(newPosition)) {
        this.board.activeTetramino.updatePos(newPosition);
        newPosition = this.eventCodes['Space'](this.board.activeTetramino);
      }
      this.playAudio(this.audioDrop);
    }
  
    saveTouchSett(event) {
      this.touchСoordinates.touchStartX = event.targetTouches[0].pageX;
      this.touchСoordinates.touchStartY = event.targetTouches[0].pageY;
    }
  
    rotateActiveTetramino(event) {
      event.preventDefault();
      if (!this.board.activeTetramino) return;
      this.touchСoordinates.touchEndX = event.changedTouches[0].pageX;
      this.touchСoordinates.touchEndY = event.changedTouches[0].pageY;
      if (Math.abs(this.touchСoordinates.touchEndX - this.touchСoordinates.touchStartX) <= boardSettings.blockSize &&
          this.touchСoordinates.touchEndY - this.touchСoordinates.touchStartY <= boardSettings.blockSize) {
            const newPosition = this.eventCodes['ArrowUp'](this.board.activeTetramino);
            if (this.board.validatePos(newPosition)) {
              this.playAudio(this.audioMove);
              this.board.activeTetramino.updatePos(newPosition);
            } 
      }
      this. clearTouchCoordArr();
      Object.keys(this.touchСoordinates).forEach( value => this.touchСoordinates[value] = 0);
    }
  
    clearTouchCoordArr() {
      this.touchmoveEventX = [];
      this.touchmoveEventY = [];
    }
  
    clearTouchTimer() {
      this.touchmoveEventTimer = [];
      this.touchmoveCounter = 0;
    }
  
    createNewTetramino() {
      this.tetram = new Tetramino(this.context, gameColors);
      this.board.activeTetramino = this.tetram;
      this.board.xxx = true;
      this.updateColors();
      this.tetram.randomTetramino();
      this.tetram.draw();
    }
  
    updateColors() {
      switch (this.level) {
        case 1:
          this.board.activeTetramino.colorsAmount = 7;
          break;
        case 2:
        case 3:
        case 4:
          this.board.activeTetramino.colorsAmount = 8;
          break;
        case 5:
        case 6:
        case 7:
          this.board.activeTetramino.colorsAmount = 9;
          break;
        case 8:
        case 9:
        case 10:
          this.board.activeTetramino.colorsAmount = 10;
          break;
        default:
          this.board.activeTetramino.colorsAmount = 11;
          break;
      }
    }
  
    animateGame() {
      if (this.count === this.timer) {
        this.count = 0;
        if (!this.moweDown()) {
          this.endGame();
          return;
        }
      }
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
      this.board.activeTetramino.draw();
      this.board.drawBoardGrid();
      this.count++;
      this.touchmoveCounter++;
      this.gameReq = requestAnimationFrame(() => {
        this.animateGame();
      });   
    }
  
    endGame() {
      this.gameOver.classList.add('game-over-active');
      this.playAudio(this.audioGameOver);
      this.score = 0;
    }
  
    updateScore() {
      this.fullRowsNum = this.board.fullRowsNum;
      this.score += this.fullRowsNum*this.point*this.fullRowsNum;
      this.scoreElem.innerHTML = this.score;
      this.scoreElem.classList.add('active-score');
      setTimeout( () =>  this.scoreElem.classList.remove('active-score'), 500);
    }
  
    updateLevel() { 
      const currLevel = Math.floor(this.score/this.levelsScore) + 1;
      if (currLevel > this.level) {
        this.level = currLevel;
        this.levelElem.innerHTML = this.level;
        this.levelElem.classList.add('active-score');
        setTimeout( () =>  this.levelElem.classList.remove('active-score'), 500);
        if (this.levelsTimer[this.level]) {
          this.timer = this.levelsTimer[this.level];
        }
      }
    }
  
    pauseGame(event) {
      event.preventDefault();
      if (!this.board.activeTetramino) return;
      if(!this.onPause) {
        this.board.activeTetramino.speedY = 0;
        this.onPause = true;
        this.pauseBtnCont.innerHTML = 'Resume';
        if (window.matchMedia("(max-width:850px)").matches) {
          this.pauseBtn.classList.add('resume');
        }
      } else {
        this.board.activeTetramino.speedY = 1;
        this.onPause = false;
        this.pauseBtnCont.innerHTML = 'Pause';
        if (window.matchMedia("(max-width:850px)").matches) {
          this.pauseBtn.classList.remove('resume');
        }
      }
    }
  
    playAudio(audio) {
      if (this.audioIsON === 'on') {
        audio.currentTime = 0;
        audio.play();
      }
    }
  
    turnOnTheSound(event) {
      event.preventDefault();
      this.soundOnBtns.forEach( btn => btn.classList.add('active'));
      this.soundOffBtns.forEach( btn => btn.classList.remove('active'));
      this.audioIsON = 'on';
    }
  
    turnOffTheSound(event) {
      event.preventDefault();
      this.soundOffBtns.forEach( btn => btn.classList.add('active'));
      this.soundOnBtns.forEach( btn => btn.classList.remove('active'));
      this.audioIsON = 'off';
    }
  
    submitRegistr(event) {
      event.preventDefault();
      const regForm = document.querySelector('.registration-form');
      this.nickname = regForm.querySelector('.nickname-input').value;
      regForm.classList.add('notvisible');
    }
  
    openAsideMenu(event) {
      event.preventDefault();
      this.menu.classList.add('aside-menu-opened');
    }
  
    closeAsideMenu(event) {
      event.preventDefault();
      this.menu.classList.remove('aside-menu-opened');
    }
  
  }
  
  const board = new Board(context, gameColors);
  const game = new TetrisGame(board, context);
  
  function calculateWindowSize() {
    const windowHeight = document.documentElement.clientHeight;
    const root = document.querySelector(':root');
    const rootStyles = getComputedStyle(root);
    const gameWrapPaddingTop = parseInt(rootStyles.getPropertyValue('--game-wrapper-paddingTop'));
    const tetrisPadding =  parseInt(rootStyles.getPropertyValue('--tetris-padding'));
    if (window.matchMedia("(max-width:850px)").matches) {
      const info = document.querySelector('.info');
      const btnContainer = document.querySelector('.buttons');
      const infoHeight = parseInt(window.getComputedStyle(info).getPropertyValue("height"));
      const btnContainerHeight = parseInt(window.getComputedStyle(btnContainer).getPropertyValue("height"));
      return Math.floor((windowHeight - infoHeight - btnContainerHeight - (gameWrapPaddingTop + tetrisPadding) * 2)/rows);
    } else {
     return Math.floor((windowHeight - (gameWrapPaddingTop + tetrisPadding) * 2)/ rows) ;
    }
  }
  
  function recalculateBlockSize() {
    const blockSize = calculateWindowSize();
    boardSettings.blockSize = blockSize;
    context.canvas.width = boardSettings.columns * boardSettings.blockSize;
    context.canvas.height = boardSettings.rows * boardSettings.blockSize;
  }
  
  window.addEventListener('resize', recalculateBlockSize);
  
};

window.addEventListener('load', createGame);

