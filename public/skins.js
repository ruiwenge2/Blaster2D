/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
function buy(id){
  document.getElementById(`buybtn${id}`).innerHTML = "Buying...";
  fetch("/api/buy?id=" + id).then(resp => resp.json()).then(resp => {
    if(resp.success){
      document.getElementById(`buybtn${id}`).innerHTML = "Use";
      document.getElementById(`buybtn${id}`).onclick = () => {
        useskin(id);
      };
      document.getElementById("balance").innerHTML = resp.gold;
    } else {
      alertmodal("", resp.error);
      document.getElementById(`buybtn${id}`).innerHTML = "Buy";
    }
  });
}

function sell(){
  fetch("/api/sell", {
    
  }).then()
}

function useskin(id){
  document.getElementById(`buybtn${id}`).innerHTML = "Using...";
  fetch("/api/useskin?id=" + id).then(resp => resp.json()).then(resp => {
    if(resp.success){
      document.getElementById(`buybtn${id}`).innerHTML = "Current skin";
      document.getElementById(`buybtn${id}`).onclick = "";
      document.getElementById(`buybtn${current}`).innerHTML = "Use";
      previous = current;
      document.getElementById(`buybtn${current}`).onclick = () => {
        useskin(previous);
      };
      current = id;
    } else {
      alertmodal("", resp.error);
      document.getElementById(`buybtn${id}`).innerHTML = "Use";
    }
  });
}

if(!loggedIn){
  Array.from(document.getElementsByClassName("skin")).forEach(div => {
    document.getElementById(`buybtn${div.dataset.id}`).disabled = true;
  });
} else {
  Array.from(document.getElementsByClassName("skin")).forEach(div => {
    if(skins.includes(parseInt(div.dataset.id))){
      document.getElementById(`buybtn${div.dataset.id}`).innerHTML = "Use";
      document.getElementById(`buybtn${div.dataset.id}`).onclick = () => {
        useskin(div.dataset.id);
      };
    } else {
      document.getElementById(`buybtn${div.dataset.id}`).onclick = () => {
        buy(div.dataset.id);
      };
    }
    if(parseInt(div.dataset.id) == current){
      document.getElementById(`buybtn${div.dataset.id}`).innerHTML = "Current skin";
      document.getElementById(`buybtn${div.dataset.id}`).onclick = "";
    }
  });
}
/******/ })()
;