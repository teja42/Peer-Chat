(()=>{
   let allUsers = $("#allUsers");
   let view = $("#sidebar-item-view");
   let main = $("#main");
   let mainView = $("#main-view");
   let eKeys = $("#eKeys");
   let eKeyView = $("#eKey-view");

   // Events
   let eKeyEvent = new CustomEvent("ekeyopened");

   allUsers.onclick = (e)=>{
      view.style.width = window.getComputedStyle(view).width=="200px"?(()=>{
         main.style.marginLeft = "50px";
         return "0";
      })():(()=>{
         main.style.marginLeft = "250px";
         return "200px";
      })();
   }

   eKeys.onclick = (e)=>{
      mainView.style.display == "none"?(()=>{
         mainView.style.display = "block";
         eKeyView.style.display = "none";
      })():(()=>{
         mainView.style.display = "none";
         eKeyView.style.display = "block";
         window.dispatchEvent(eKeyEvent);
      })();
   }

})();