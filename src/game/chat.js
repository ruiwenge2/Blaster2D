class Chatbox {
  constructor(game){
    this.socket = game.socket;
    this.on = true;
    this.chatbox = document.getElementById("chatbox");
    this.input = document.getElementById("chat-input");
    this.messages = document.getElementById("messages");
    this.chatbox.style.display = "block";
  }
  
  create(){
    
  }
  
  destroy(){
    this.on = false;
    this.chatbox.style.display = "none";
    this.messages.innerHTML = "";
    this.input.value = "";
  }
}

export default Chatbox;