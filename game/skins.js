const fs = require("fs");

const skins = [
  {
    id: 0,
    url: "player",
    cost: 0
  },
  {
    id: 1,
    url: "skull",
    cost: 1000
  },
  {
    id: 2,
    url: "smileyface",
    cost: 200
  },
  {
    id: 3,
    url: "target",
    cost: 100
  },
  {
    id: 4,
    url: "basketball",
    cost: 500
  },
  {
    id: 5,
    url: "sunglasses",
    cost: 2000
  },
  {
    id: 6,
    url: "thumbsup",
    cost: 150
  },
  {
    id: 7,
    url: "expressionless",
    cost: 200
  },
  {
    id: 8,
    url: "magician",
    cost: 800
  },
  {
    id: 9,
    url: "lightning",
    cost: 300
  },
  {
    id: 10,
    url: "crown",
    cost: 3000
  },
  {
    id: 11,
    url: "cap",
    cost: 900
  }
];

fs.writeFileSync("src/skins.json", JSON.stringify(skins));

skins.sort(function(a, b){return a.cost - b.cost});

module.exports = skins;