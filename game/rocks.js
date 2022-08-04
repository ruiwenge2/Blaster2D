const fs = require("fs");
const { random } = require("./functions.js");

const size = 5000;
const rocksize = 100;

var rocks = [];

for(let i = 0; i < random(20, 25); i++){
  var percent = random(50, 200);
  var realsize = rocksize * percent / 100;
  rocks.push({
    id: i,
    size: realsize,
    x: random(realsize / 2, size - realsize / 2),
    y: random(realsize / 2, size - realsize / 2),
    angle: random(0, 360)
  });
}

fs.writeFileSync("src/rocks.json", JSON.stringify({rocks:rocks}));