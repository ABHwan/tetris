'use strict';
import BLOCKS from "./blocks.js"
// DOM
const playground = document.querySelector('.playground > ul');
const gameText = document.querySelector('.game-text');
const gameTextTitle = document.querySelector('.game-text > span');
const scoreDisplay = document.querySelector('.score');
const restartButton = document.querySelectorAll('.restart-button');
const pauseButton = document.querySelector('.pause-button');
const unPauseButton = document.querySelector('.unpause-button');
const durationText = document.querySelector('.duration > span');
const durationPlusButton = document.querySelector('.duration-plus-button');
const durationMinusButton = document.querySelector('.duration-minus-button');

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;
const TOP = 0;
const LEFT = 3;
const DIRECTION = 0;
const SPEED = 500;

// variables
let score = 0;
let duration = SPEED;
let speed = SPEED;
let downInterval;
let tempMovingItem;



const movingItem = {
  type: '',
  direction: DIRECTION,
  top: TOP,
  left: LEFT,
};

init();

// functions
function init() {
  tempMovingItem = { ...movingItem };
  duration = 500;
  speed = 500;
  showDurationText(duration);
  for(let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  generateNewBlock();
  
}

function blockRandomFix() {
  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  return blockArray[randomIndex][0];
}

function prependNewLine() {
    const li = document.createElement('li');
    const ul = document.createElement('ul');
  
    for(let j = 0; j < GAME_COLS; j++) {
      const matrix = document.createElement('li');
      ul.prepend(matrix);
    }
  
    li.prepend(ul);
    playground.prepend(li);
}
  
function renderBlocks(moveType='') {
  const { type, direction, top, left} = tempMovingItem;
  const movingBlocks = document.querySelectorAll('.moving');
  movingBlocks.forEach(moving => {
    moving.classList.remove(type, 'moving');
  })

  BLOCKS[type][direction].some(block => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, 'moving');
    } else {
      tempMovingItem = { ...movingItem };
      if(moveType === 'retry') {
        clearInterval(downInterval);
        showGameOverText();
      }
      setTimeout(() => {
        renderBlocks('retry');
        if (moveType === 'top') {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;

}

function seizeBlock() {
  const movingBlocks = document.querySelectorAll('.moving');
  movingBlocks.forEach(moving => {
    moving.classList.remove('moving');
    moving.classList.add('seized');
  });
  checkMatch();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach(child => {
    let matched = true;
    child.children[0].childNodes.forEach(li => {
      if (!li.classList.contains('seized')) {
        matched = false;
      }
      // console.log(window.getComputedStyle(li).backgroundColor);
    });
    if(matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerHTML = score;
    }
  });
  generateNewBlock();
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, duration)

  itemInit();
  tempMovingItem = { ...movingItem };
  renderBlocks();
}

function itemInit() {
  movingItem.type = blockRandomFix();
  movingItem.top = TOP;
  movingItem.left = LEFT;
  movingItem.direction = DIRECTION;
}

function checkEmpty(target) {
  if(!target || target.classList.contains('seized')) {
    return false;
  }
  return true;
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1; 
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1)
  }, 10)
}

function showGameOverText() {
  gameTextTitle.innerHTML = '게임종료!!';
  gameText.style.display = 'flex';
  unPauseButton.style.display = 'none';
}

function showPauseText() {
  clearInterval(downInterval);
  gameTextTitle.innerHTML = '일시정지';
  gameText.style.display = 'flex'
  unPauseButton.style.display = 'block';
}

function showUnpauseText() {
  let sec = 3;
  gameTextTitle.innerHTML = `${sec}초 후 재시작 됩니다!`;
  sec = sec - 1;

  let countInterval = setInterval(() => {
    gameTextTitle.innerHTML = `${sec}초 후 재시작 됩니다!`;
    sec = sec - 1;

    if (sec < 0) {
      clearInterval(countInterval);
      gameText.style.display = 'none';
      downInterval = setInterval(() => {
        moveBlock('top', 1);
      }, duration);
    }

  }, 1000);
}

function setDuration(type) {
  if ((type === 'plus' && duration <= 100) || (type==='minus' && duration >= 900)) {
    return false;
  }

  if (type === 'plus') {
    duration = duration - 100;
    speed = speed + 100;
  } else {
    duration = duration + 100;
    speed = speed - 100;
  }

  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, duration)
  showDurationText(speed);
}

function showDurationText(duration) {
  durationText.innerHTML = `속도 : ${duration / 1000}`
}

// event handling
document.addEventListener('keydown', e => {
  switch(e.keyCode) {
    case 27:
      showPauseText();
      break;
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
      break;
    case 9:
      e.preventDefault();
      break;
    default:
      break;
  }
  // console.log(e);
});
document.addEventListener('dblclick', e => {
  return false
})

const arrowUp = document.querySelector('#arrow-up')
const arrowLeft = document.querySelector('#arrow-left')
const arrowDown = document.querySelector('#arrow-down')
const arrowRight = document.querySelector('#arrow-right')
const spacebar = document.querySelector('#spacebar')
arrowUp.addEventListener('click', e => {
  changeDirection();
})
arrowLeft.addEventListener('click', e => {
  moveBlock("left", -1);
})
arrowDown.addEventListener('click', e => {
  moveBlock("top", 1);
})
arrowRight.addEventListener('click', e => {
  moveBlock("left", 1);
})
spacebar.addEventListener('click', e => {
  dropBlock();
})


restartButton.forEach(e => {
  e.addEventListener('click', () => {
    playground.innerHTML = '';
    scoreDisplay.innerHTML = '0';
    gameText.style.display = 'none';
    init();
  })
});

pauseButton.addEventListener('click', () => {
  showPauseText();
});

unPauseButton.addEventListener('click', () => showUnpauseText());

durationPlusButton.addEventListener('click', () => setDuration('plus'));

durationMinusButton.addEventListener('click', () => setDuration('minus'));