const socketIOClient = require("socket.io-client");
let ioc = new socketIOClient("http://localhost:4250",{
   transports: ['websocket']
});

ioc.on("connect_error",(e)=>console.log(e));

ioc.on("event#1",(msg)=>{
   console.log(msg);
});