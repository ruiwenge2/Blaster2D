function embedded() {
  try {
    return window.self !== window.top;
  } catch(e) {
    return true;
  }
}

if(embedded() && location.hostname == "191bb644-256e-48ce-b188-a2dde4c165f4.id.repl.co"){
  alertmodal("", "Please open this in a new tab for best results.", ok="Open").then(() => {window.open("https://blaster2d.ruiwenge2.repl.co" + location.pathname)});
}

try {
  if(homepage && loggedIn){
    var div = document.getElementById("userActions");
    var hidden = document.getElementById("hidden");
    div.addEventListener("mouseover", function(){
      hidden.style.display = "block";
    });
    div.addEventListener("mouseleave", function(){
      hidden.style.display = "none";
    });
  }
} catch(e){}

if("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/sw.js");
  });
}

window.addEventListener("offline", function(e){
  document.body.innerHTML = "<br><br><h1>You're offline, try refreshing the page or check your Wi-Fi.</h1>";
});

window.addEventListener("online", function(e){
  location.reload();
});