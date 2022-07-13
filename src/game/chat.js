class Chatbox {
  constructor(game){
    this.socket = game.socket;
    this.on = true;
    this.name = game.name;
    this.focus = false;
    this.sent = false;
    this.chatbox = document.getElementById("chatbox");
    this.input = document.getElementById("chat-input");
    this.messages = document.getElementById("messages");
    this.chatbox.style.display = "block";
    
    this.input.addEventListener("keydown", e => {
      if(!this.on) return;
      if(e.key == "Enter"){
        if(!this.validMessage(this.input.value)) return this.sent = false;
        this.socket.emit("chat message", this.name, this.input.value);
        this.input.value = "";
        this.sent = true;
      }

      if(e.key == "Tab"){
        e.preventDefault();
        this.input.blur();
      }
    });
    this.socket.on("chat message", message => {
      if(!this.on) return;
      this.messages.innerHTML += `<p>${this.encodeHTML(message)}</p>`;
      this.messages.scrollTo(0, this.messages.scrollHeight);
    });

    this.input.onfocus = () => {
      this.input.placeholder = "Press TAB to exit";
      this.focus = true;
    }

    this.input.onblur = () => {
      this.input.placeholder = "Click here or press ENTER to chat";
      this.focus = false;
    }
  }

  encodeHTML(text){
    var div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  }

  validMessage(text){
    if(!text) return false;
    for(var i of text){
      if(i != " ") return true;
    }
    return false;
  }
  
  destroy(){
    this.on = false;
    this.chatbox.style.display = "none";
    this.messages.innerHTML = "";
    this.input.value = "";
  }
}

export default Chatbox;