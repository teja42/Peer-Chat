(()=>{
   
   let genBtn = $("#eKey-genBtn");
   genBtn.onclick = ()=>{
      genBtn.setAttribute("disabled","");
      let x = $("#eKey-selectAlgo").value;
      let [algo,length] = x.split("_");
      console.log({algo,length});
      ipcRenderer.send("eKey:u:genNewKey",{algo,length});
   };


})();