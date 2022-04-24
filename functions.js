module.exports.random = function(number1, number2){
  return Math.round(Math.random() * (number2 - number1)) + number1;
}

module.exports.generateCode = function(){
  const characters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var code = "";
  for(i = 0; i < 10; i++){
    code += characters[module.exports.random(0, characters.length - 1)];
  }
  return code;
}

module.exports.checkUser = function(id){
  for(let info of Object.keys(rooms.main.players)){
    if(info == id) return true;
  }
  return false;
}