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

// const gameColors = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];

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
  [keyEvent.left]:  tetr => ({ ...tetr, x: tetr.x - 1 }),
  [keyEvent. right]: tetr => ({ ...tetr, x: tetr.x + 1 }),
  [keyEvent.down]: tetr => ({ ...tetr, y: tetr.y + 1 }),
  [keyEvent.rotate]: tetr => board.activeTetramino.rotateMatrix(tetr),
  // [keyEvent.fastdDown]: tetr => ({ ...tetr, y: tetr.y + 2 })
};

const playSettings = {
  count : 0,
}

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
          // this.context.fillStyle = this.colors[value - 1];
          // this.context.fillRect(x, y, 1, 1);
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
    this.fullRowsNum = fullRows.length;
    fullRows.forEach( value => {
      this.grid.splice(value, 1);
      this.grid.unshift(Array.from(Array(boardSettings.columns).fill(0)));
    });
    console.log(this.fullRowsNum);
  }

  clearFullRowsNum() {
    const fullRowsNum = 0;
  }

}

const board = new Board(context, gameColors);

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
  }

  randomDiap(m) {
    return Math.floor(
      Math.random()*(m + 1));
  }

  rotateMatrix(tetramino) {
    const shape = tetramino.shape;
    const N = shape.length - 1; 
    const newMatrix =  shape.map((row, i) => row.map((val, j) => shape[N - j][i]) );
    tetramino.shape = newMatrix;
    return tetramino;
  }

}

class TetrisGame {
  constructor(board, context, playBtn, gameOver) {
    this.board = board;
    this.context = context;
    this.playBtn = document.querySelector(playBtn);
    this.gameOver = document.querySelector(gameOver);
    this.tetram = null;
    this.gameReq = null;
    this.count = 0;
    this.score = 0;
    this.point = 100;
    this.fullRows = 0;
    this.scoreElem = document.querySelector('.score');

    if(this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.startPlay();
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
    if(!moves[event.code]) return;
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
        this.board.clearFullRowsNum();
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
    this.fullRows = this.board.fullRowsNum;
    this.score += Math.sqrt(this.fullRows)*this.point;
    this.scoreElem.innerHTML = this.score;
    console.log(this.score);
  }

}

const game = new TetrisGame(board, context, '.play', '.game-over');
// console.log(game);


