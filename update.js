const update = () => {
  setInterval(function(){
    io.emit("gamestate", rooms.main);
  }, 1000 / 60);
}

export default update;