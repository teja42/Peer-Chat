// This is main controller module. It also contains code for managing in/out connections.

let app = require('express')();
let server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");
let event = new (require("events").EventEmitter)();

let cipher = require("./cipher");

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
         setTimeout(()=>event.emit("server-online"),300);
         // Just in case the thread.send() is not executed quick enough or server started before 
      });// thread.send() is executed. Also 300ms won't hurt and it's just one time thing.
   }

   sendMessage(socketId){}

})();

module.exports = (input,send)=>{
   event.on("server-online",()=>send({
      evt: "server-online"
   }));
}
