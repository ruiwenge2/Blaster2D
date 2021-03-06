const size = 5000;
const playersize = 65;
const radius = playersize / 2;
const coinsize = 37.5;
const ratio = size / 500;
const treesize = 300;
const gamestate_rate = 100;

function random(number1, number2){
  return Math.round(Math.random() * (number2 - number1)) + number1;
}

function checkMovement(direction, x, y){
  if(direction == "left"){
    if(x <= 0) return false;
  } if(direction == "right"){
    if(x + playersize >= size) return false;
  } if(direction == "up"){
    if(y <= 0) return false;
  } if(direction == "down"){
    if(y + playersize >= size) return false;
  } if(direction == "none"){
    return false;
  }
  return true;
}

export { size, playersize, coinsize, ratio, random, checkMovement, treesize, gamestate_rate, radius };