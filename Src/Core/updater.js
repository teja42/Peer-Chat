// This module is responsible for managing updates.

setInterval(()=>{
   // console.log("updater.js");
},1500);

module.exports = (input,done)=>{
   console.log(input);
   done({
      evtName: "evt#1",
      msg: "Msg body"
   });
};