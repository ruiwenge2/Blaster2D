class Chatbox {
  constructor(game){
    this.socket = game.socket;
    this.chat = game.add.dom(150, window.innerHeight - 150).createFromCache("chat").setDepth(200);
    this.chat.scrollFactorX = 0;
    this.chat.scrollFactorY = 0;
    game.add.existing(this);
  }
  
  create(){
    
  }
  
  remove(){
    
  }
}

export default Chatbox;