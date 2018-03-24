let genBtn = $("#eKey-genBtn");
genBtn.onclick = ()=>{
   disableGenBtn();
   let x = $("#eKey-selectAlgo").value;
   let knc = $("#eKey-newKnc").value;
   let [algo,length] = x.split("_");
   console.log({algo,length});
   ipcRenderer.send("eKey:u:genNewKey",{algo,length,knc});
};

ipcRenderer.on("eKey:s:genNewKey",(evt,msg)=>{
   console.log(msg);
   enableGenBtn();
});

let disableGenBtn = ()=>{
   genBtn.setAttribute("disabled","");
   genBtn.innerHTML = "Generating...";
   genBtn.style.cursor = "wait";
}

let enableGenBtn = ()=>{
   genBtn.removeAttribute("disabled");
   genBtn.innerHTML = "Generate";
   genBtn.style.cursor = "pointer";
}

ipcRenderer.send("eKey:u:getKeys");
ipcRenderer.on("eKey:s:getKeys",(evt,docs)=>{
   console.log(docs);
   let eKeyView = $("#eKey-view");
   let template = $("#eKey-template").innerHTML;
   if(docs.length==0){
      eKeyView.insertAdjacentHTML("beforeend",
      "<h2 id='nth-to-display'>Nothing to display</h2>");
      return;
   } else {
      let x = $("#nth-to-display");
      if(x) x.parentNode.removeChild(x);
   }
   for(i=0;i<docs.length;i++){
      eKeyView.insertAdjacentHTML("beforeend",Mustache.render(
         template,
         {
            id: docs[i]._id,
            knc: docs[i].knc
         }
      ));
   }
});

// General purpose functions.

function saveKey(id){
   ipcRenderer.send("saveKey",id);
   return false;
}