
module.exports.loggedIn = function(req){
  return (req.session.username ? true: false);
};

module.exports.random = function(number1, number2){
  return Math.round(Math.random() * (number2 - number1)) + number1;
};

module.exports.generateCode = function(length, cap = false){
  const characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var code = "";
  for(i = 0; i < length; i++){
    code += characters[module.exports.random(0, characters.length - 1)];
  }
  if(cap){
    code = code.toUpperCase();
  }
  return code;
};

module.exports.checkUser = function(id){
  var check;
  Object.keys(rooms).forEach(room => {
    if(check) return;
    check = Object.keys(rooms[room].players).includes(id) || rooms[room].diedPlayers.includes(id);
  })
  return check;
};

module.exports.playerDead = function(id){
  var check;
  Object.keys(rooms).forEach(room => {
    if(check) return;
    check = rooms[room].diedPlayers.includes(id);
  })
  return check;
}

module.exports.setUpRoom = function(room){
  if(Object.keys(rooms[room].players).length == 0){
    rooms[room].coins = {};
    for(let i = 0; i < maxCoins; i++){
      let x = module.exports.random(coinsize / 2, size - coinsize / 2);
      let y = module.exports.random(coinsize / 2, size - coinsize / 2);
      while(module.exports.goldRockCol(x, y)){
        x = module.exports.random(coinsize / 2, size - coinsize / 2);
        y = module.exports.random(coinsize / 2, size - coinsize / 2);
      }
      rooms[room].coins[rooms[room].new_coin_id] = {
        id: rooms[room].new_coin_id,
        x,
        y
      };
      rooms[room].new_coin_id++;
    }
  }
};

module.exports.getUser = async function(user){
  let users = await db.get("users");
  return users[user];
}

module.exports.deleteUser = function(user){
  db.get("users").then(users => {
    if(Object.keys(users).includes(user)){
      delete users[user];
      db.set("users", users).then(() => {console.log(`deleted user ${user}`)});
      return;
    }
    console.log("error occured while deleting user");
  });
};

module.exports.verify = async function(token, secret){
  let result = await require("axios")({
    method: "POST",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      response: token,
      secret: secret
    }
  });
  return result.data;
}

module.exports.circleCol = function(x1, y1, r1, x2, y2, r2){
  var dx = x1 - x2;
  var dy = y1 - y2;
  var distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < r1 + r2) return true;
  return false;
}

module.exports.goldRockCol = (x, y) => {
  let col = false;
  rocks.forEach(rock => {
    if(module.exports.circleCol(x, y, coinsize / 2, rock.x, rock.y, rock.size / 2)){
      col = true;
    }
  });
  return col;
}
module.exports.getTime = () => {
  let date = new Date();
  return `, [${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`
}