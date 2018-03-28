let allUsers = $("#allUsers");
let sideBarView = $("#sidebar-item-view");
let main = $("#main");
let mainView = $("#main-view");
let eKeys = $("#eKeys");
let eKeyView = $("#eKey-view");
let addContact = $("#addContact");

let currentDisplayingItem = mainView;
let hideCurrentDisplayingItem = ()=>currentDisplayingItem.style.display = "none";
let displayItem = (e)=>{
   hideCurrentDisplayingItem();
   e.style.display = "block";
   currentDisplayingItem = e;
}

$("#addUser").onclick = displayItem.bind(this,addContact);

eKeys.onclick = displayItem.bind(this,eKeyView);