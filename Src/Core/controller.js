// This is main controller module. It also contains code for managing in/out connections.

var app = require('express')();
var server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");

class controller {
   constructor(loadCallBack){
      let io = require('socket.io')(server);
      // let ioc = new socketIOClient("http://localhost:4250",{
      //    transports: ['websocket']
      // });

      io.on('connection', (socket)=>{
         let userData;
         console.log(socket.id);
         socket.on("userData",(data)=>userData=data);

         socket.on("message",(msg)=>{
            
         });

      });

      server.listen(4250,()=>{
         loadCallBack();
      });
   }
}

module.exports = (x)=>{
   return new controller(x);
}