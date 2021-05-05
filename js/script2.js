'use strict'

const settings = {
  columns : 10,
  rows : 20,
  blockSize: 35
}

const button = document.querySelector('.play');
button.addEventListener('click', play);

const canvas = document.querySelector('.game-area');
const context = canvas.getContext('2d');
context.canvas.width = settings.columns * settings.blockSize;
context.canvas.height = settings.rows * settings.blockSize;
context.scale(settings.blockSize, settings.blockSize);

class Board {
  constructor() {
    this.activePiece = null;
  }

  reset() {
    this.grid = this.getEmptyBoard();
  }

  getEmptyBoard() {
    return Array.from(
      Array(settings.rows), () => Array(settings.columns).fill(0)
    );
  }

  insideWalls(x) {
    return x >= 0 && x < settings.columns;
  }
  
  aboveFloor(y) {
    return y <= settings.rows;
  }
  
  // не занята ли клетка поля другими фигурками
  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }
  
  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return value === 0 ||
            (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y));
      });
    });
  }

  rotate(p){
    // Клонирование матрицы
    let clone = JSON.parse(JSON.stringify(p));
    
    // алгоритм вращения
    for (let y = 0; y < p.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [p.shape[x][y], p.shape[y][x]] = 
        [p.shape[y][x], p.shape[x][y]];
      }
    }
    
    // Изменение порядка колонок
    p.shape.forEach(row => row.reverse());
    
    return clone;
  }

  animate() {
    board.piece.draw();
    requestAnimationFrame(this.animate.bind(this));
  }

  draw() {
    this.piece.draw();
  }
  
  drop() {
    let p = moves[keyEvent.down](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    }
  }

}

const board = new Board();

class Piece {
  constructor(context) {
    this.context = context;
    // this.color = 'blue';
    // this.shape = [];
    // this.x = 3;
    // this.y = 0;
  }

  spawn() {
    this.typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.shape = SHAPES[this.typeId];
    this.color = COLORS[this.typeId];
    this.x = 0;
    this.y = 0;
  }

  randomizeTetrominoType(noOfTypes) {
    return Math.floor(Math.random() * noOfTypes);
  }

  setStartPosition() {
    this.x = this.typeId === 4 ? 4 : 3;
  }

  draw() {
    this.spawn();
    this.setStartPosition();
    this.context.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.context.fillRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  move(p) {
    this.x = p.x;
    this.y = p.y;
  }

 }

 const COLORS = [  
  'cyan',
  'blue',
  'orange',
  'yellow',
  'green',
  'purple',
  'red'
];

const SHAPES = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
  [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
  [[4, 4], [4, 4]],
  [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
  [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
  [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
];

const keyEvent = {
  left : 'ArrowLeft',
  right: 'ArrowRight',
  down: 'ArrowDown',
  rotate: 'ArrowUp',
  fast: 'Space'
}

const moves = {
  [keyEvent.left]:  p => ({ ...p, x: p.x - 1 }),
  [keyEvent. right]: p => ({ ...p, x: p.x + 1 }),
  [keyEvent.down]:    p => ({ ...p, y: p.y + 1 }),
  [keyEvent.rotate]:  p => board.rotate(p),
  [keyEvent.fast]:    p => ({ ...p, y: p.y + 3 })
};

const time = { start: 0, elapsed: 0, level: 1000 };
let count = 0;

function animate(now = 0) {
  count++;
  p = moves[KEY.DOWN](board.piece);
  if(count === 30) {
    board.piece.move();  
    count = 0;
  }
 
  requestAnimationFrame(animate);
}

function play() {
  board.reset();
  let piece = new Piece(context);
  board.piece = piece;
  board.piece.setStartPosition();
  animate();
}


// document.addEventListener('keydown', (event) => console.log(event.code));

document.addEventListener('keydown', event => {
  if (moves[event.code]) {  
    event.preventDefault();
   
    // получение новых координат фигурки
    let p = moves[event.code](board.piece);
    console.log(p);

    
    // проверка нового положения
    if (board.valid(p)) {    
      // реальное перемещение фигурки, если новое положение допустимо
      board.piece.move(p);
      console.log(p);
      
      // стирание старого отображения фигуры на холсте
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); 
      
      board.piece.draw();
    }
  }
});

