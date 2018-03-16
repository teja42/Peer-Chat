// This is main controller module. It also contains code for managing in/out connections.

let app = require('express')();
let server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");

// Custom Modules
let cipher = require("./cipher");
let dbMan = require("./dbManager");

module.exports = class { // A Class to manage connections.
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

      server.listen(4250,process.$event.emit("server-online"));
   }

   sendMessage(socketId){}

};
