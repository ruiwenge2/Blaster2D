const skins = [
  {
    id: 1,
    url: "skull",
    cost: 200
  },
  {
    id: 2,
    url: "smileyface",
    cost: 30
  }
]

skins.sort(function(a, b){return a.cost - b.cost})

module.exports = skins;