import { size, playersize, coinsize, ratio, random, checkMovement, treesize } from "../functions.js";

function socketfunc(game){
  game.socket.on("gamedata", data => { // when game data arrives
    game.loaded = true;
    game.loadingtext.destroy();
    game.player = game.physics.add.sprite(data.players[game.socket.id].x, data.players[game.socket.id].y, "player").setScale(0.5, 0.5).setDepth(1);
    game.cameras.main.startFollow(game.player);
    game.data = {
      x: data.players[game.socket.id].x,
      y: data.players[game.socket.id].y,
      angle: 0,
      angle2:0
    };

    for(let i of data.coins){
      let coin = game.coins.create(i.x, i.y, "coin").setScale(0.75, 0.75).setDepth(1);
      coin.id = i.id;
    }

    for(let i of data.trees){
      let tree = game.trees.create(i.x, i.y, "tree").setScale(i.size / treesize).setDepth(10);
      tree.id = i.id;
    }
    
    for(let oplayer of Object.keys(data.players)){
      if(oplayer != game.socket.id){
        let otherplayer = game.otherplayers.create(data.players[oplayer].x, data.players[oplayer].y, "player").setScale(0.5, 0.5).setDepth(1);
        otherplayer.id = oplayer;
        let gun = game.otherguns.create(data.players[oplayer].x + Math.cos(data.players[oplayer].angle2) * (playersize / 2 + 28), data.players[oplayer].y + Math.sin(data.players[oplayer].angle2) * (playersize / 2 + 28), "pistol").setDepth(15);
        gun.angle = data.players[oplayer].angle;
        gun.angle2 = data.players[oplayer].angle2;
        gun.id = oplayer;
      }
    }
    game.main();
      
  });

  game.socket.on("new player", (data, id) => { // when new player joins
    let otherplayer = game.otherplayers.create(data.x, data.y, "player").setScale(0.5, 0.5).setDepth(1);
    let gun = game.otherguns.create(data.x + Math.cos(0) * (playersize / 2 + 28), data.y + Math.sin(0) * (playersize / 2 + 28), "pistol").setDepth(15);
    gun.angle = 0;
    gun.angle2 = 0;
    otherplayer.id = id;
    gun.id = id;
  });

  game.socket.on("other player move", (id, data) => { // when other player moves
    game.otherplayers.getChildren().forEach(oplayer => {
      if(oplayer.id == id){
        oplayer.setPosition(data.x, data.y);
        oplayer.angle = data.angle;
        game.otherguns.getChildren().forEach(gun => {
          if(gun.id == id){
            gun.angle = data.angle;
            gun.angle2 = data.angle2;
            gun.setPosition(data.gunx, data.guny);
          }
        });
      }
    });
  });

  game.socket.on("collected gold", id => {
    for(let coin of game.coins.children.entries){
      if(coin.id == id){
        coin.destroy();
        console.log("deleted coin");
      }
    }
  });

  game.socket.on("left", id => {
    for(let player of game.otherplayers.children.entries){
      if(player.id == id){
        player.destroy();
      }
    }

    for(let gun of game.otherguns.children.entries){
      if(gun.id == id){
        gun.destroy();
      }
    }
  });

  game.socket.on("leave", () => {
    game.scene.start("disconnect_scene");
  });
}

export default socketfunc;