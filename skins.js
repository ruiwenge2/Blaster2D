const skins = [
  {
    id: 0,
    url: "player",
    cost: 0
  },
  {
    id: 1,
    url: "skull",
    cost: 200
  },
  {
    id: 2,
    url: "smileyface",
    cost: 100
  },
  {
    id: 3,
    url: "target",
    cost: 100
  }
];

skins.sort(function(a, b){return a.cost - b.cost});

export default skins;