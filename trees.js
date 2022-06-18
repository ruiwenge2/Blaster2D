const fs = require("fs");
const { random } = require("./functions.js");

var trees = [];

const size = 6000;
const treesize = 300;

for(let i = 0; i < random(100, 150); i++){
  var percent = random(50, 100);
  var realsize = treesize * percent / 100;
  trees.push({
    id: i,
    size: realsize,
    x: random(realsize / 2, size - realsize / 2),
    y: random(realsize / 2, size - realsize / 2)
  });
}

fs.writeFileSync("src/trees.json", JSON.stringify({trees:trees}));

require("./webpack.config.js");