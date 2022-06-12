function loggedIn(req){
  return (req.session.username ? true: false);
};

function random(number1, number2){
  return Math.round(Math.random() * (number2 - number1)) + number1;
};

function generateCode(){
  const characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var code = "";
  for(i = 0; i < 10; i++){
    code += characters[module.exports.random(0, characters.length - 1)];
  }
  return code;
};

function checkUser(id){
  for(let info of Object.keys(rooms.main.players)){
    if(info == id) return true;
  }
  return false;
};

function setUpRoom(){
  if(Object.keys(rooms.main.players).length == 0){
    rooms.main.coins = [];
    for(let i = 0; i < random(30, 50); i++){
      rooms.main.coins.push({
        id: i,
        x: random(coinsize / 2, size - coinsize / 2),
        y: random(coinsize / 2, size - coinsize / 2)
      });
    }
    
  }
};

function deleteUser(user){
  db.get("users").then(users => {
    if(Object.keys(users).includes(user)){
      delete users[user];
      db.set("users", users).then(() => {console.log(`deleted user ${user}`)});
      return;
    }
    console.log("error occured while deleting user");
  });
};

export { loggedIn, random, generateCode, checkUser, setUpRoom, deleteUser }