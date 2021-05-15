'use strict';

function createApp() {

  const boardSettings = {
    columns : 10,
    rows : 20,
    blockSize : null
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

  class Board {
    constructor(colors) {
      this.activeTetramino = null;
      this.colors = colors;
      this.image = new Image();
      this.image.src = 'assets/blocks.png';
      this.image.width = 40;
      this.image.height = 40;
      this.fullRowsNum = null;
      this.newRow = Array(boardSettings.columns).fill(0);
    }

    updateContext(app) {
      this.app = app;
      this.context = this.app.context;
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

    updateContext(ctx) {
      this.context = ctx;
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
    constructor(board) {
      this.board = board;
      this.currentUserScore = {};
      this.updatePassword = null;
      this.tetram = null;
      this.gameReq = null;
      this.count = 0;
      this.timer = null;
      this.score = 0;
      this.point = 100;
      this.fullRowsNum = null;
      this.onPause = false;
      this.gameIsOn = false;
      this.level = 1;
      this.eventCodes = {
        'ArrowLeft' : tetr => ({ ...tetr, x: tetr.x - tetr.speedX }),
        'ArrowRight': tetr => ({ ...tetr, x: tetr.x + tetr.speedX }),
        'ArrowDown' : tetr => ({ ...tetr, y: tetr.y + tetr.speedY}),
        'ArrowUp' : tetr => board.activeTetramino.rotateMatrix(tetr),
        'Space' : tetr => ({ ...tetr, y: tetr.y + tetr.speedY})
      };
      this.audioClearRows = new Audio('assets/audio/clear.rf64');
      this.audioMove = new Audio('assets/audio/sounds_block-rotate.mp3');
      this.audioGameOver = new Audio('assets/audio/gameover.rf64');
      this.audioDrop = new Audio('assets/audio/drop.mp3');
      this.audioClick = new Audio('assets/audio/click.mp3');
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
      this.touchmoveEventX = [];
      this.touchmoveEventY = [];
      this.touchСoordinates = {
        touchStartX : 0,
        touchStartY : 0,
        touchEndX : 0,
        touchEndX : 0
      }

      document.addEventListener('keydown', (event) => this.moveTetramino(event));
    }

    updateApp(app) {
      this.app = app;
      this.context = this.app.context;
      this.ajaxHandlerScript = this.app.ajaxHandlerScript;
      this.stringName = this.app.stringName;
      this.user = this.app.user;
    }

    addListeners() {
      this.playBtn = document.querySelector('.play');
      this.pauseBtn = document.querySelector('.pause');
      this.pauseBtnCont = this.pauseBtn.querySelector('.btn-text');
      this.gameOver = document.querySelector('.game-over');
      this.scoreElem = document.querySelector('.score');
      this.levelElem = document.querySelector('.level');
      this.soundOnBtns = document.querySelectorAll('.sound-on'); 
      this.soundOffBtns = document.querySelectorAll('.sound-off'); 
      this.gameArea = document.querySelector('.game-area');
      this.dropBtn = document.querySelector('.drop');

      this.playBtn.addEventListener('click', (event) => this.startPlay(event));
      this.playBtn.addEventListener('touchstart', (event) => this.startPlay(event));
  
      this.pauseBtn.addEventListener('click', (event) => this.pauseGame(event));
      this.pauseBtn.addEventListener('touchstart', (event) => this.pauseGame(event));

      this.gameArea.addEventListener('touchmove', (event) => this.handleTouch(event));
      this.gameArea.addEventListener('touchstart', (event) => this.saveTouchSett(event));
      this.gameArea.addEventListener('touchend', (event) => this.rotateActiveTetramino(event));
      this.dropBtn.addEventListener('touchstart', (event) => this.drop(event));
      this.dropBtn.addEventListener('click', (event) => this.drop(event));
  
      this.soundOnBtns.forEach(btn => btn.addEventListener('click', (event) => this.turnOnTheSound(event)));
      this.soundOnBtns.forEach(btn => btn.addEventListener('touchstart', (event) => this.turnOnTheSound(event)));
  
      this.soundOffBtns.forEach(btn => btn.addEventListener('click', (event) => this.turnOffTheSound(event)));
      this.soundOffBtns.forEach(btn => btn.addEventListener('touchstart', (event) => this.turnOffTheSound(event)));
    }

    removePlaySett() {
      cancelAnimationFrame(this.gameReq);
      this.board.activeTetramino = null;
      this.gameReq = null;
      this.onPause = false;
      this.level = 1;
      this.score = 0;
      this.timer = 32;
      this.count = 0;
      this.touchmoveCounter = 0;
      this.board.reset();
      this.gameIsOn = false;
      this.dropCount = 0;
    }
  
    startPlay(event) {
      event.preventDefault();
      this.playAudio(this.audioClick);
      this.removePlaySett();
      this.pauseBtnCont.innerHTML = 'Pause';
      this.pauseBtn.querySelector('.pause-svg').setAttribute('xlink:href', 'assets/sprites.svg#pause');
      this.scoreElem.innerHTML = this.score;
      this.levelElem.innerHTML = this.level;
      this.gameOver.classList.remove('game-over-active');
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);  
      this.createNewTetramino();
      this.gameIsOn = true;
      this.animateGame();
    }
  
    moveTetramino(event) {
      if(!this.eventCodes[event.code] || this.onPause || !this.gameIsOn) return;
      event.preventDefault();
      let newPosition = this.eventCodes[event.code](this.board.activeTetramino);
      if (event.code === 'Space') {
        if (this.dropCount < this.timer) return;
        while (this.board.validatePos(newPosition)) {
          this.board.activeTetramino.updatePos(newPosition);
          newPosition = this.eventCodes[event.code](this.board.activeTetramino);
        }
        this.playAudio(this.audioDrop);
        this.dropCount = 0;
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
        this.board.activeTetramino = null;
        this.board.clearFullRows();
        if (this.board.fullRowsNum) {
          this.playAudio(this.audioClearRows);
          window.navigator.vibrate([130, 50, 130]);
          this.updateScore();
          this.updateLevel();
        }
        this.createNewTetramino();
      }
      return true;
    }
  
    handleTouch(event) {
      event.preventDefault();
      if (!this.gameIsOn || this.onPause) return;
      this.touchmoveEventX.push(event.targetTouches[0].pageX);
      this.touchmoveEventY.push(event.targetTouches[0].pageY);
  
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
    }
  
    drop(event) {
      event.preventDefault();
      if(!this.gameIsOn || this.onPause || this.dropCount < this.timer) return;
      let newPosition = this.eventCodes['Space'](this.board.activeTetramino);
      while (this.board.validatePos(newPosition)) {
        this.board.activeTetramino.updatePos(newPosition);
        newPosition = this.eventCodes['Space'](this.board.activeTetramino);
      }
      this.playAudio(this.audioDrop);
      this.dropCount = 0;
    }
  
    saveTouchSett(event) {
      this.touchСoordinates.touchStartX = event.targetTouches[0].pageX;
      this.touchСoordinates.touchStartY = event.targetTouches[0].pageY;
    }
  
    rotateActiveTetramino(event) {
      event.preventDefault();
      if (!this.gameIsOn || this.onPause) return;
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
      this.clearTouchCoordArr();
      Object.keys(this.touchСoordinates).forEach( value => this.touchСoordinates[value] = 0);
    }
  
    clearTouchCoordArr() {
      this.touchmoveEventX = [];
      this.touchmoveEventY = [];
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
      this.dropCount++;
      this.gameReq = requestAnimationFrame(() => {
        this.animateGame();
      });   
    }
  
    endGame() {
      this.gameOver.classList.add('game-over-active');
      this.playAudio(this.audioGameOver);
      this.saveScore();
      this.score = 0;
      this.gameIsOn = false;
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
      this.playAudio(this.audioClick);
      const pauseSvg = this.pauseBtn.querySelector('.pause-svg');
      if(!this.onPause) {
        this.board.activeTetramino.speedY = 0;
        this.onPause = true;
        this.pauseBtnCont.innerHTML = 'Resume';
        pauseSvg.setAttribute('xlink:href', 'assets/sprites.svg#play');
        this.pauseBtn.classList.add('onpause');
      } else {
        this.board.activeTetramino.speedY = 1;
        this.onPause = false;
        this.pauseBtnCont.innerHTML = 'Pause';
        pauseSvg.setAttribute('xlink:href', 'assets/sprites.svg#pause');
        this.pauseBtn.classList.remove('onpause');
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
    
    saveScore() {
      if (!this.score) return;
      this.currentUserScore = {};
      this.currentUserScore.name = this.user;
      this.currentUserScore.score = this.score;
      this.storeInfo();
    }
  
    storeInfo() {
      this.updatePassword=Math.random();
      let sp = new URLSearchParams();
      sp.append('f', 'LOCKGET');
      sp.append('n', this.stringName);
      sp.append('p', this.updatePassword);
  
      fetch(this.ajaxHandlerScript, { method: 'post', body: sp })
          .then( response => response.json() )
          .then( data => this.lockGetReady(data));
    }
  
    lockGetReady(data) {
      const gameStorage = JSON.parse(data.result);
      gameStorage.scoreStorage.push(this.currentUserScore);
      let sp = new URLSearchParams();
      sp.append('f', 'UPDATE');
      sp.append('n', this.stringName);
      sp.append('v', JSON.stringify(gameStorage));
      sp.append('p', this.updatePassword);
  
      fetch(this.ajaxHandlerScript, { method: 'post', body: sp });
  
    }
  
  }
  
  class App {
    constructor(game, board){
      this.ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
      this.stringName = 'KOT_TETRIS_JS';
      this.SPAState = {};
      this.board = board;
      this.game = game;
      this.canvas = null;
      this.context = null;
      this.xxx = false;
      this.gameState = {
        'activeTetramino' : this.board.activeTetramino,
        'sound' : this.game.audioIsON,
        'onPause' : this.game.onPause,
        'score' : this.game.score,
        'level' : this.game.level
      }

      if (localStorage.tetris) {
        this.user = JSON.parse(localStorage.tetris).userName;
      } else {
        this.user = 'Player';
      }
      window.addEventListener('hashchange', () => this.switchToStateFromURLHash());
      window.addEventListener('beforeunload', (event) => this.showPreventMessage(event));
    }
  
    getAppStorage() {
      let sp = new URLSearchParams();
      sp.append('f', 'READ');
      sp.append('n', this.stringName);
    
      return fetch(this.ajaxHandlerScript, { method: 'post', body: sp })
          .then( response => response.json() )
          .then( data => JSON.parse(data.result))
    }
  
    switchToStateFromURLHash() {
      this.saveGameSettings();
      this.canvas = null;
      const URLHash = window.location.hash;
      const stateStr = URLHash.substr(1);

      if (stateStr!="") { 
        this.SPAState = { pagename: stateStr};
      } else {
        this.SPAState = { pagename: 'Main'}; 
      }
      
      switch (this.SPAState.pagename) {
        case 'Main':
          this.createMainPage();
          break;
        case 'Game':
          this.createGamePage();
          break;
        case 'Rules':
          this.createRulesPage();
          break;
        case 'Recordes':
          this.getAppStorage().then( resut => this.createRecordesPage(resut));
          break;
      }
    }
  
    switchToState(newState) {
      const stateStr = newState.pagename;
      location.hash = stateStr;
    }

    saveGameSettings() {
      this.gameState.activeTetramino = this.board.activeTetramino;
      this.gameState.sound = this.game.audioIsON;
      this.gameState.onPause = this.game.onPause;
      this.gameState.score = this.game.score;
      this.gameState.level = this.game.level;
      cancelAnimationFrame(this.game.gameReq);
      this.game.gameReq = null;
    }
    
    createGamePage() {
      document.body.innerHTML = '';
      const containerElem = this.createElem('div','container');
      document.body.appendChild(containerElem);
      const gameWrapper = this.createElem('div','game-wrapper');
      const buttons = this.createElem('div','buttons');
      const tetris = this.createElem('div','tetris');
      const info = this.createElem('div','info');
      const arrowBack = this.createElem('button','arrow-back', '<svg><use xlink:href="assets/sprites.svg#arrow-back"/></svg>');
      const gameWrapperChildren = [buttons, tetris, info, arrowBack];
      this.addChildren(gameWrapperChildren,  gameWrapper);
      const playBtnInnerHTML = '<span>Play</span><svg><use xlink:href="assets/sprites.svg#power"/></svg>';
      const pauseBtnInnerHTML =  this.gameState.onPause ? 
      '<span class="btn-text">Resume</span><svg><use class="pause-svg" xlink:href="assets/sprites.svg#play"/></svg>' :
      '<span class="btn-text">Pause</span><svg><use class="pause-svg" xlink:href="assets/sprites.svg#pause"/></svg>' ;
      const pauseBtnStyles = this.gameState.onPause ? 'pause btn onpause' : 'pause btn';
      const dropBtnInnerHTML = '<svg><use xlink:href="assets/sprites.svg#drop"/></svg>';
      const playBtn = this.createElem('button','play btn', playBtnInnerHTML);
      const pauseBtn = this.createElem('button', pauseBtnStyles, pauseBtnInnerHTML);
      const dropBtn = this.createElem('button','drop btn', dropBtnInnerHTML);
      const soundsBtn = this.createElem('div','sound-btns');
      const buttonsChildren = [playBtn, pauseBtn, dropBtn, soundsBtn];
      this.addChildren(buttonsChildren, buttons);
      const soundONInnerHTML = '<svg><use xlink:href="assets/sprites.svg#sound-on"/></svg>';
      const soundOffInnerHTML = '<svg><use xlink:href="assets/sprites.svg#sound-off"/></svg>';
      const soundON =  this.createElem('button','sound-on sound-btn', soundONInnerHTML);
      const soundOff =  this.createElem('button','sound-off sound-btn', soundOffInnerHTML);
      this.gameState.sound === 'on' ? soundON.classList.add('active') : soundOff.classList.add('active');
      const soundsBtnChildren = [soundON, soundOff];
      this.addChildren(soundsBtnChildren, soundsBtn);
      const gameOver =  this.createElem('div','game-over', 'Game Over');
      tetris.appendChild(gameOver);
      const infoScoreRow = this.createElem('div','output');
      const scoreIcon = this.createElem('div','icon', '<svg><use xlink:href="assets/sprites.svg#star"/></svg>');
      const score = this.createElem('div','score', `${this.gameState.score}`);
      this.addChildren([scoreIcon, score], infoScoreRow);
      const infoLevelRow = this.createElem('div','output');
      const levelIcon = this.createElem('div','icon', '<svg><use xlink:href="assets/sprites.svg#trophy"></svg>');
      const level = this.createElem('div','level', this.gameState.level);
      this.addChildren([levelIcon, level],  infoLevelRow);
      this.addChildren([infoScoreRow, infoLevelRow],  info);
      containerElem.appendChild(gameWrapper);

      arrowBack.addEventListener('click', () => this.switchToState({pagename: 'Main'}));
      arrowBack.addEventListener('touchstart', () => this.switchToState({pagename: 'Main'}));

      boardSettings.blockSize = this.calculateBlockSize();
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.width = boardSettings.columns * boardSettings.blockSize;
      this.canvas.height = boardSettings.rows * boardSettings.blockSize;
      this.canvas.classList.add('game-area');
      document.querySelector('.tetris').appendChild(this.canvas);
      this.board.updateContext(this);
      this.game.updateApp(this);
      this.game.addListeners();
      this.game.audioIsON = this.gameState.sound;
      this.game.onPause = this.gameState.onPause;
      if(this.game.gameIsOn) {
        this.game.activeTetramino = this.gameState.activeTetramino;
        this.game.activeTetramino.updateContext(this.context);
        this.game.gameReq = requestAnimationFrame(() => {
          this.game.animateGame();
        }); 
      }
    }
  
    createMainPage() {
      document.body.innerHTML = '';
      const containerElem = this.createElem('div','container mob-container');
      document.body.appendChild(containerElem);
      const menu = this.createElem('div', 'menu popup');
      const title = this.createElem('h1', 'title', 'Tetris');
      const regLabel = this.createElem('label', 'reg-label', 'Enter your nickname');
      regLabel.setAttribute('for', 'reg-input');
      const regElem = this.createElem('form', 'reg-form');
      if(this.user !== 'Player') {
        regElem.classList.add('submitted');
      }
      const regInput = this.createElem('input', 'reg-input');
      regInput.setAttribute('id', 'reg-input');
      regInput.setAttribute('type', 'text');
      regInput.setAttribute('placeholder', this.user);
      const regSubmitBtn = this.createElem('button', 'reg-btn', '<svg><use xlink:href="assets/sprites.svg#check-mark"/></svg>');
      regSubmitBtn.setAttribute('type', 'submit');
     
      this.addChildren([regInput, regSubmitBtn], regElem);
      const newGame = this.createElem('button', 'menu-btn', 'New Game');
      const rules = this.createElem('button', 'menu-btn', 'Rules');
      const recordes = this.createElem('button', 'menu-btn', 'Recordes');
      this.addChildren([title, regLabel, regElem, newGame, rules, recordes], menu);
  
      regSubmitBtn.addEventListener('click', (event) => this.submitReg(event));
      regSubmitBtn.addEventListener('touchstart', (event) => this.submitReg(event));
      regInput.addEventListener('click', (event) => this.activateForm(event));
      regInput.addEventListener('touchstart', (event) => this.activateForm(event));
      newGame.addEventListener('click', () => this.switchToNewGame());
      newGame.addEventListener('touchstart', () => this.switchToNewGame());
      rules.addEventListener('click', () => this.switchToState({pagename: 'Rules'}));
      rules.addEventListener('touchstart', () => this.switchToState({pagename: 'Rules'}));
      recordes.addEventListener('click', () => this.switchToState({pagename: 'Recordes'}));
      recordes.addEventListener('touchstart', () => this.switchToState({pagename: 'Recordes'}));
  
      containerElem.appendChild(menu);
    }

    switchToNewGame() {
      this.game.removePlaySett();
      this.saveGameSettings();
      this.switchToState({pagename: 'Game'})
    }
  
    createRecordesPage(result) {
      const score = result.scoreStorage;
      score.sort(this.compareScore);
      score.splice(10, score.length - 1);
      document.body.innerHTML = '';
      const containerElem = this.createElem('div','container mob-container');
      document.body.appendChild(containerElem);
      const recordesHTMLElem = this.createElem('div', 'recordes popup');
      const title = this.createElem('h1', 'title', 'Recordes');
      const recordTable = this.createElem('div', 'record-table');
      const arrowBack = this.createElem('button','arrow-back', '<svg><use xlink:href="assets/sprites.svg#arrow-back"/></svg>');
      this.addChildren([title, recordTable, arrowBack], recordesHTMLElem);
      score.forEach((elem, index) => {
        const scorePos = this.createElem('div','score-position', `${index+1}.`);
        const userName = this.createElem('div','user-name', elem.name);
        const userScore = this.createElem('div','user-score', elem.score);
        this.addChildren([scorePos, userName, userScore], recordTable);
      })
      arrowBack.addEventListener('click', () => this.switchToState({pagename: 'Main'}));
      arrowBack.addEventListener('touchstart', () => this.switchToState({pagename: 'Main'}));
      containerElem.appendChild(recordesHTMLElem);
    }
  
    createRulesPage() {
      document.body.innerHTML = '';
      const containerElem = this.createElem('div','container mob-container');
      document.body.appendChild(containerElem);
      const rulesHTMLElem = this.createElem('div', 'rules popup');
      const title = this.createElem('h1', 'title', 'Rules');
      const objective = this.createElem('div', 'rules', 'Try to fit as many tetrominoes as possible on the screen by clearing rows!');
      const subtitleDesk = this.createElem('h2', 'subtitle', 'For desktops');
      const desktopRulesInnerHtml = '<div class="rules-row">Press the UP key to rotate the tetrimino</div><div class="rules-row">Press the DOWN key to accelerate the tetromino</div><div class="rules-row">Press the LEFT and RIGHT keys to move the tetromino respective diriction</div><div class="rules-row">Press SPACE key to drop the tetromino</div>';
      const desktopRules = this.createElem('div', 'rules', desktopRulesInnerHtml);
      const subtitleMob = this.createElem('h2', 'subtitle', 'For mobiles');
      const mobileRulesInnerHtml = '<div class="rules-row">Touch the play area to rotate the tetrimino</div><div class="rules-row">To move the tetromino touch the play area and move in respective direction</div><div class="rules-row">Touch the DOWN button to drop the tetromino</div>';
      const mobileRules = this.createElem('div', 'rules', mobileRulesInnerHtml);
      const arrowBack = this.createElem('button','arrow-back', '<svg><use xlink:href="assets/sprites.svg#arrow-back"/></svg>');
      this.addChildren([title, objective, subtitleDesk, desktopRules, subtitleMob, mobileRules, arrowBack], rulesHTMLElem);
      arrowBack.addEventListener('click', () => this.switchToState({pagename: 'Main'}));
      arrowBack.addEventListener('touchstart', () => this.switchToState({pagename: 'Main'}));
      containerElem.appendChild(rulesHTMLElem);
    }
  
    createElem(elem, styleClass, value) {
      const HTMLelem = document.createElement(elem);
      if (styleClass) {
        HTMLelem.className = styleClass;
      }
      if (value) {
        HTMLelem.innerHTML = value;
      }
      return HTMLelem;
    }
  
    addChildren(arr, parentElem) {
      arr.forEach(elem => parentElem.appendChild(elem));
    }
  
    compareScore(a, b) {
      return b.score - a.score;
    }
  
    submitReg(event) {
      event.preventDefault();
      const regInput = document.querySelector('.reg-input');
      if (regInput.value) {
        this.user = regInput.value;
        localStorage.tetris = JSON.stringify({ 
          'userName' : this.user
        });
      }
      const regForm = document.querySelector('.reg-form');
      regForm.classList.add('submitted');
      const regLabel = document.querySelector('.reg-label');
      regLabel.innerHTML = 'You nickname';
      
    }
  
    activateForm() {
      const regForm = document.querySelector('.reg-form');
      regForm.classList.remove('submitted');
    }

    calculateBlockSize() {
      const windowHeight = document.documentElement.clientHeight;
      const root = document.querySelector(':root');
      const rootStyles = getComputedStyle(root);
      const gameWrapPaddingTop = parseInt(rootStyles.getPropertyValue('--game-wrapper-paddingTop'));
      const tetrisPadding =  parseInt(rootStyles.getPropertyValue('--tetris-padding'));
      if (window.matchMedia("(max-width:850px)").matches) {
        const windowWidth = document.documentElement.clientWidth;
        const info = document.querySelector('.info');
        const btnContainer = document.querySelector('.buttons');
        const infoHeight = parseInt(window.getComputedStyle(info).getPropertyValue("height"));
        const btnContainerHeight = parseInt(window.getComputedStyle(btnContainer).getPropertyValue("height"));
        let blockSize = Math.floor((windowHeight - infoHeight - btnContainerHeight - (gameWrapPaddingTop + tetrisPadding) * 2)/boardSettings.rows);
        if (blockSize * boardSettings.columns + tetrisPadding * 3 > windowWidth) {
          blockSize = (windowWidth - tetrisPadding * 3) / boardSettings.columns;
        }
        return blockSize;
      } else {
       return Math.floor((windowHeight - (gameWrapPaddingTop + tetrisPadding) * 2)/ boardSettings.rows) ;
      }
    }

    recalculateBlockSize() {
      if(this.canvas) {
        boardSettings.blockSize = this.calculateBlockSize();
        this.canvas.width = boardSettings.columns * boardSettings.blockSize;
        this.canvas.height = boardSettings.rows * boardSettings.blockSize;
      }
    }

    showPreventMessage(event) {
      if(window.location.hash === '#Game' && this.gameIsOn) {
        const dialogText = 'Are you sure you want to leave this page?';
        event.returnValue = dialogText;
        return dialogText;
      }
    }

  }

  const board = new Board(gameColors);
  const game = new TetrisGame(board);
  const terisApp = new App(game, board);
  terisApp.switchToStateFromURLHash();

  window.addEventListener('resize', () => terisApp.recalculateBlockSize());
  
}

window.addEventListener('DOMContentLoaded', createApp);

