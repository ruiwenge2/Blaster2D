module.exports.loggedIn = function(req){
  return (req.session.username ? true: false);
};

module.exports.random = function(number1, number2){
  return Math.round(Math.random() * (number2 - number1)) + number1;
};

module.exports.generateCode = function(length, cap = false){
  const characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var code = "";
  for(i = 0; i < 20; i++){
    code += characters[module.exports.random(0, characters.length - 1)];
  }
  if(cap){
    code = code.toUpperCase();
  }
  return code;
};

module.exports.checkUser = function(id){
  return Object.keys(rooms.main.players).includes(id);
};

module.exports.setUpRoom = function(){
  if(Object.keys(rooms.main.players).length == 0){
    rooms.main.coins = [];
    for(let i = 0; i < module.exports.random(30, 50); i++){
      rooms.main.coins.push({
        id: i,
        x: module.exports.random(coinsize / 2, size - coinsize / 2),
        y: module.exports.random(coinsize / 2, size - coinsize / 2)
      });
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
  let result = await require('axios')({
    method:"POST",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      response: token,
      secret: secret
    }
  });
  return result.data.success;
}

module.exports.shoot = function(id, angle){
  // if(rooms.main.players[id].spawntimeleft) return;
  rooms.main.bullets[rooms.main.new_bullet_id] = {
    shooter: id,
    x: rooms.main.players[id].x + Math.cos(angle) * (radius + 40), 
    y: rooms.main.players[id].y + Math.sin(angle) * (radius + 40),
    angle: ((angle * 180 / Math.PI) + 360) % 360,
    angle2: angle,
    id: rooms.main.new_bullet_id,
    shooterName: rooms.main.players[id].name
  }
  
  io.emit("new bullet", rooms.main.new_bullet_id, rooms.main.bullets[rooms.main.new_bullet_id]);
  rooms.main.new_bullet_id++;
}