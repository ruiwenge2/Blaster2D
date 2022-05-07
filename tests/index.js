const bcrypt = require('bcrypt');
const saltRounds = 10;

const password = "blah ioddf"
const another = "test hello"

bcrypt.hash(password, saltRounds, function(err, hash) {
  bcrypt.compare(another, hash, function(err, result){
    console.log(result)
  })
});

