let allUsers = $("#allUsers");
let sideBarView = $("#sidebar-item-view");
let main = $("#main");
let mainView = $("#main-view");
let eKeys = $("#eKeys");
let eKeyView = $("#eKey-view");
let _hideSidebarView = $("#hide-sidebar-view");
let addContact = $("#addContact");

let currentDisplayingItem = mainView;
let hideCurrentDisplayingItem = ()=>currentDisplayingItem.style.display = "none";
let displayItem = (e)=>{
   hideCurrentDisplayingItem();
   e.style.display = "block";
   currentDisplayingItem = e;
}

let toogleSidebarView = ()=>{
   sideBarView.style.width = window.getComputedStyle(sideBarView).width=="200px"?(()=>{
      main.style.marginLeft = "50px";
      return "0";
   })():(()=>{
      main.style.marginLeft = "250px";
      return "200px";
   })();
}

let eKeyEvent = new CustomEvent("ekeyopened");

$("#addUser").onclick = displayItem.bind(this,addContact);

_hideSidebarView.onclick = toogleSidebarView;
document.onkeydown  = (e)=>{
   if(e.keyCode== 27) toogleSidebarView();
}

eKeys.onclick = displayItem.bind(this,eKeyView);