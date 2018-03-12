(()=>{
   let allUsers = $("#allUsers");
   let view = $("#sidebar-item-view");
   let main = $("#main");
   let eKeys = $("#eKeys");

   allUsers.onclick = (e)=>{
      console.log("Clicked");
      view.style.width = window.getComputedStyle(view).width=="200px"?(()=>{
         main.style.marginLeft = "50px";
         return "0";
      })():(()=>{
         main.style.marginLeft = "250px";
         return "200px";
      })();
   }

   eKeys.onclick = (e)=>{
      view.style.width = "0px";
      main.style.marginLeft = "50px";
      // And then insert the content into #main
   }

})();