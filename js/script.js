'use strict'
const boardSettings = {
  columns : 10,
  rows : 21,
  blockSize : 35
}

const keyEvent = {
  left : 'ArrowLeft',
  right: 'ArrowRight',
  down: 'ArrowDown',
  rotate: 'ArrowUp',
  fastdDown: 'Space'
}
const poins = {
  1 : 100,
  2 : 300,
  3 : 500,
  4 : 800,
  5 : 300
}

const gameColors = [
  {x : 190, y : 130},
  {x : 100, y : 120},
  {x : 10, y : 160},
  {x : 0, y : 20},
  {x : 190, y : 40},
  {x : 50, y : 70},
  {x : 240, y : 90}
]
  
const moves = {
  [keyEvent.left]:  tetr => ({ ...tetr, x: tetr.x - tetr.speedX }),
  [keyEvent. right]: tetr => ({ ...tetr, x: tetr.x + tetr.speedX }),
  [keyEvent.down]: tetr => ({ ...tetr, y: tetr.y + tetr.speedY }),
  [keyEvent.rotate]: tetr => board.activeTetramino.rotateMatrix(tetr),
  // [keyEvent.fastdDown]: tetr => ({ ...tetr, y: tetr.y + 2 })
};

const canvas = document.querySelector('.game-area');
const context = canvas.getContext('2d');
context.canvas.width = boardSettings.columns * boardSettings.blockSize;
context.canvas.height = boardSettings.rows * boardSettings.blockSize;
context.scale(boardSettings.blockSize, boardSettings.blockSize);

class Board {
  constructor(context, colors) {
    this.activeTetramino = null;
    this.context = context;
    this.colors = colors;
    this.image = new Image();
    this.image.src = 'assets/blocks.png';
    this.image.width = 40;
    this.image.height = 40;
    this.fullRowsNum = 0;
    this.newRow = Array.from(Array(boardSettings.columns).fill(0));
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
        return value === 0 || (this.horizValid(currX) && this.verticalValid(currY) && this.isFree(currX, currY));
      })
    })
  }

  saveSett() {
    this.activeTetramino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.activeTetramino.y][x + this.activeTetramino.x] = value;
        }
      });
    });
  }

  drawBoardGrid() {
    this.grid.forEach( (row, y) => {
      row.forEach( (value, x) => {
        if (value > 0) {
          this.context.drawImage(this.image, this.colors[value - 1].x, this.colors[value - 1].y, this.image.width, this.image.height, x, y, 1, 1);
        }
      })
    })

  }

  getFullRows() {
    const fullRows = this.grid.reduce( (arr, row, y) => {
      if (row.every(value => value > 0 )) {
        arr = [...arr, y];
      }
      return arr;
    }, []);
    return fullRows;
  }

  clearFullRows() {
    const fullRows = this.getFullRows();
    if(fullRows.length) {
      console.time('label');
      fullRows.forEach( value => {
        this.grid.splice(value, 1);
        this.grid.unshift(this.newRow);
      });
      this.fullRowsNum = fullRows.length;
      console.timeEnd('label');
    }
  }

  clearFullRowsNum() {
    this.fullRowsNum = 0;
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
    this.y = -1;
    this.x = 0;
    this.speedX = 1;
    this.speedY = 1;
    this.image = new Image();
    this.image.src = 'assets/blocks.png';
    this.image.width = 40;
    this.image.height = 40;
  }

  draw() {
    // this.context.fillStyle = this.color;
    this.shape.forEach( (row, y) => {
      row.forEach( (value, x) => {
        if (value > 0) {
          // this.context.fillRect( this.x + x, this.y + y, 1, 1);
          this.context.drawImage(this.image, this.colors[value - 1].x, this.colors[value - 1].y, this.image.width, this.image.height, this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  randomTetramino() {
    this.num = this.randomDiap(this.colors.length - 1);
    // this.color = this.colors[this.num];
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
    const shape = newTetramino.shape;
    const N = shape.length - 1; 
    const newMatrix =  shape.map((row, i) => row.map((val, j) => shape[N - j][i]) );
    newTetramino.shape = newMatrix;
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
    this.score = 0;
    this.point = 100;
    this.fullRowsNum = 0;
    this.scoreElem = document.querySelector('.score');
    this.onPause = false;

    if(this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.startPlay();
      });
    }

    if(this.playBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.pauseGame();
      });
    }

    document.addEventListener('keydown', () => {
      this.moveTetramino(event);
    });
   
  }

  createNewTetramino() {
    this.tetram = new Tetramino(this.context, gameColors);
    this.board.activeTetramino = this.tetram;
    this.tetram.randomTetramino();
    this.tetram.draw();
  }

  moveTetramino(event) {
    if(!moves[event.code] || this.onPause) return;
    const newPosition = moves[event.code](this.board.activeTetramino);
    if (this.board.validatePos(newPosition)) {
      this.board.activeTetramino.updatePos(newPosition);
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
      this.board.activeTetramino.draw();
      this.board.drawBoardGrid();
      this.board.clearFullRows();
    }
  }

  startPlay() {
    cancelAnimationFrame(this.gameReq);
    this.onPause = false;
    this.gameOver.classList.remove('game-over-active');
    this.gameReq = null;
    this.count = 0;
    this.board.reset();
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
    this.createNewTetramino();
    this.animateGame();
  }

  animateGame() {
    if (this.count === 35) {
      this.count = 0;
      this.newPosition = moves['ArrowDown'](this.board.activeTetramino);
      if (board.validatePos(this.newPosition)) {
        this.board.activeTetramino.updatePos(this.newPosition);
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); 
        this.board.activeTetramino.draw();
        this.board.drawBoardGrid();
        this.board.clearFullRows();
        this.updateScore();
      } else {
        if (this.board.activeTetramino.y === -1) {
          this.finishRound();
          return;
        } else {
          this.board.saveSett();
          this.createNewTetramino();
        }
      }
    }
    this.count++;
    this.gameReq = requestAnimationFrame(() => {
      this.animateGame();
    });
  }

  finishRound() {
    this.gameOver.classList.add('game-over-active');
    this.score = 0;
  }

  updateScore() {
    this.fullRowsNum = this.board.fullRowsNum;
    if(this.fullRowsNum) {
      this.score += this.fullRowsNum*this.point*this.fullRowsNum;
      this.scoreElem.innerHTML = this.score;
      this.scoreElem.classList.add('active-score');
      setTimeout( () =>  this.scoreElem.classList.remove('active-score'), 500);
      this.board.clearFullRowsNum();
    }
  }

  pauseGame() {
    if (!this.board.activeTetramino) return;
    if(!this.onPause) {
      this.board.activeTetramino.speedY = 0;
      this.onPause = true;
    } else {
      this.board.activeTetramino.speedY = 1;
      this.onPause = false;
    }
  }

}

const board = new Board(context, gameColors);
const game = new TetrisGame(board, context);
// console.log(game);


