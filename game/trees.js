const fs = require("fs");
const { random } = require("./functions.js");

const size = 5000;
const treesize = 300;

var trees = [];

for(let i = 0; i < random(30, 40); i++){
  var percent = random(50, 200);
  var realsize = treesize * percent / 100;
  trees.push({
    id: i,
    size: realsize,
    x: random(realsize / 2, size - realsize / 2),
    y: random(realsize / 2, size - realsize / 2),
    angle: random(0, 360)
  });
}

fs.writeFileSync("src/trees.json", JSON.stringify({trees:trees}));