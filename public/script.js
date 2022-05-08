function embedded() {
  try {
    return window.self !== window.top;
  } catch(e) {
    return true;
  }
}

if(embedded()){
  alertmodal("", "Please open this in a new tab for best results.", ok="Open").then(() => {window.open("https://blaster2d.ruiwenge2.repl.co")})
}