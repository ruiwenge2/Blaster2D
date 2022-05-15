const bcrypt = require('bcrypt');
const saltRounds = 10;

const password = "blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf blah ioddf dffgdcsdrjyi&6$hyjggsgtkulk'o;sdfjukfegd er7erudhfhdhdsjfieiei#9ddn fe f emrejriiefieifijajfjejfjejfjdjfjdfjdjjdijjj.  i3ie9w99disjdjskdmsmdmsmf.   ksidoo"; // lol
const another = "test hello";

bcrypt.hash(password, saltRounds, function(err, hash) {
  // console.log(hash);
  bcrypt.compare(another, hash, function(err, result){
    // console.log(result)
  })
});

