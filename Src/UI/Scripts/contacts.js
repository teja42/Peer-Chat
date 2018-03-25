// This module contains to code to manage contacts i.e., display and send messages, and 
// edit details or even delete the contact
// This module DOES NOT contain code to add contact ( It is in sidebar.js, I think....)

let contactTemplate = $("#contact-template").innerHTML;
let contactList = $("#contact-list");
let viewContactDiv = $("#viewContact");

ipcRenderer.on("getContacts:s",(evt,docs)=>{
   contactList.innerHTML = null;
   if(docs.length==0) return contactList.innerHTML = "Nothing to display";
   for(let i=0;i<docs.length;i++){
      contactList.insertAdjacentHTML("afterbegin",Mustache.render(contactTemplate,{
         name : docs[i].nickname,
         xid: docs[i]._id,
         lastConnected: docs[i].lastConnected,
         status : "Disconnected",
         color: status=="Connected"?"green":"red"
      }));
   }
});

ipcRenderer.on("getContact:s",(evt,docs)=>{
   let doc = docs[0];

});

sideBarView.onclick = (e)=>{
   let x = e.target;
   while(x!=null){
      if(!x.hasAttribute) return;
      if(x.hasAttribute('x-preventClick')) return;
      if(x.hasAttribute('xi-contact')) return viewContact(x.attributes['xid'].value);
      else x = x.parentNode;
   }
}

function viewContact(id){
   ipcRenderer.send("getContact:u");
   displayItem(viewContactDiv);
}

function showEditContact(id){
   console.log("showEditContact : ",id);
}

function deleteContact(id){
   console.log("deleteContact : ",id);
}

ipcRenderer.send("getContacts:u");