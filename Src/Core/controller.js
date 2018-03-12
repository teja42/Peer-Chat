// This is main controller module. It also contains code for managing in/out connections.

var app = require('express')();
var server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");
const events = require("events");

let cipher = require("./cipher");

console.log(cipher.generateNewRsaPair());

let event = new events.EventEmitter();

new (class {
   constructor(){
      let io = require('socket.io')(server);
      // let ioc = new socketIOClient("http://localhost:4250",{
      //    transports: ['websocket']
      // });

      io.on('connection', (socket)=>{
         let userData;
         console.log(socket.id);
         socket.on("userData",(data)=>userData=data);

         socket.emit("userData",{});

         socket.on("message",(msg)=>{
            console.log(cipher.decrypt(userData.key,msg));
         });
         
      });

      server.listen(4250,()=>{
         event.emit("server-online");
      });
   }

   sendMessage(socketId){}

})();

module.exports = (input,send)=>{
   event.on("server-online",()=>send("server-online"));
}