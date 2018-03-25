const {ipcRenderer} = require("electron");
let $ = s => document.querySelector(s);

function printFormError(placeholder,msg,hide=false){
   let x = $(placeholder);
   if(hide) return x.style.display = "none";
   x.innerHTML = null;
   x.innerHTML = msg;
   x.style.display = "block";
}
