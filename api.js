const express = require("express");
const router = express.Router();

router.get("/buy", async (req, res) => {
  try {
    var id = parseInt(req.query.id);
    if(!req.session.username){
      res.send("");
      return;
    }
    var name = req.session.username;
    if(!skins[id]){
      res.send({success:false, error:"Invalid ID."});
      return;
    }
    let skin = skins.filter(e => e.id == id)[0];
    var users = await db.get("users");
    if(users[name].s.includes(skin.id)){
      res.send({success:false, error:"You already have this skin."});
      return;
    }
    if(users[name].b < skin.cost){
      res.send({success:false, error:"You don't have enough gold."});
      return;
    }
    users[name].b -= skin.cost;
    users[name].s.push(skin.id);
    await db.player(name, users[name]);
    res.send({success:true, gold:users[name].b});
  } catch(e){
    console.log(e);
  }
});

router.get("/useskin", async (req, res) => {
  try {
    var id = parseInt(req.query.id);
    if(!req.session.username){
      res.send("");
      return;
    }
    var name = req.session.username;
    if(!skins[id]){
      res.send({success:false, error:"Invalid ID."});
      return;
    }
    let skin = skins.filter(e => e.id == id)[0];
    var users = await db.get("users");
    if(!users[name].s.includes(skin.id)){
      res.send({success:false, error:"You don't have this skin."});
      return;
    }
    users[name].c = skin.id;
    await db.player(name, users[name]);
    res.send({success:true});
  } catch(e){
    console.log(e);
  }
});

module.exports = router;