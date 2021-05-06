'use strict';

const boardSettings = {
  columns : 10,
  rows : 20,
  blockSize : 35
};

const gameColors = [
  {x : 190, y : 130},
  {x : 100, y : 120},
  {x : 10, y : 160},
  {x : 0, y : 20},
  {x : 190, y : 40},
  {x : 50, y : 70},
  {x : 240, y : 90}
];

const canvas = document.querySelector('.game-area');
const context = canvas.getContext('2d');
context.canvas.width = boardSettings.columns * boardSettings.blockSize;
context.canvas.height = boardSettings.rows * boardSettings.blockSize;
// context.scale(boardSettings.blockSize, boardSettings.blockSize);

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
      [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
    ];
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
    this.num = this.randomDiap(this.colors.length - 1);
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
    this.rulesBtn = document.querySelector('.rules');
    this.recordesBtn = document.querySelector('.recordes');
    this.gameOver = document.querySelector('.game-over');
    this.tetram = null;
    this.gameReq = null;
    this.count = 0;
    this.timer = null;
    this.score = 0;
    this.point = 100;
    this.fullRowsNum = null;
    this.scoreElem = document.querySelector('.score');
    this.lavelElem = document.querySelector('.lavel');
    this.onPause = false;
    this.lavel = 1;
    this.progress = null;
    this.eventCodes = {
      'ArrowLeft' : tetr => ({ ...tetr, x: tetr.x - tetr.speedX }),
      'ArrowRight': tetr => ({ ...tetr, x: tetr.x + tetr.speedX }),
      'ArrowDown' : tetr => ({ ...tetr, y: tetr.y + tetr.speedY}),
      'ArrowUp' : tetr => board.activeTetramino.rotateMatrix(tetr)
    };

    if(this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.startPlay();
      });
    }

    if(this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.pauseGame();
      });
    }

    document.addEventListener('keydown', (event) => {
      this.moveTetramino(event);
    });
    
  }

  startPlay() {
    cancelAnimationFrame(this.gameReq);
    this.gameReq = null;
    this.onPause = false;
    this.pauseBtn.innerHTML = 'Pause';
    this.lavel = 1;
    this.score = 0;
    this.timer = 32;
    this.scoreElem.innerHTML = this.score;
    this.lavelElem.innerHTML = this.lavel;
    this.gameOver.classList.remove('game-over-active');
    this.count = 0;
    this.board.reset();
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
    this.createNewTetramino();
    this.animateGame();
  }

  moveTetramino(event) {
    if(!this.eventCodes[event.code] || this.onPause) return;
    event.preventDefault();
    const newPosition = this.eventCodes[event.code](this.board.activeTetramino);
    if (this.board.validatePos(newPosition)) {
      this.board.activeTetramino.updatePos(newPosition);
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
        this.updateScore();
        this.updateLavel();
      }
      this.createNewTetramino();
    }
    return true;
  }

  createNewTetramino() {
    this.tetram = new Tetramino(this.context, gameColors);
    this.board.activeTetramino = this.tetram;
    this.board.xxx = true;
    this.tetram.randomTetramino();
    this.tetram.draw();
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
    this.gameReq = requestAnimationFrame(() => {
      this.animateGame();
    });   
  }

  endGame() {
    this.gameOver.classList.add('game-over-active');
    this.score = 0;
  }

  updateScore() {
    this.fullRowsNum = this.board.fullRowsNum;
    this.score += this.fullRowsNum*this.point*this.fullRowsNum;
    this.scoreElem.innerHTML = this.score;
    this.scoreElem.classList.add('active-score');
    setTimeout( () =>  this.scoreElem.classList.remove('active-score'), 500);
  }

  updateLavel() {
    this.progress = Math.floor(this.score / 1000);
    if (this.progress > this.lavel) {
      this.lavel = this.progress;
      this.lavelElem.innerHTML = this.lavel;
      this.timer -= 5;
    }
  }

  pauseGame() {
    if (!this.board.activeTetramino) return;
    if(!this.onPause) {
      this.board.activeTetramino.speedY = 0;
      this.onPause = true;
      this.pauseBtn.innerHTML = 'Resume';
    } else {
      this.board.activeTetramino.speedY = 1;
      this.onPause = false;
      this.pauseBtn.innerHTML = 'Pause';
    }
  }

}

const board = new Board(context, gameColors);
const game = new TetrisGame(board, context);



