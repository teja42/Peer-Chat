// This is main controller module. It also contains code for managing in/out connections.

let app = require('express')();
let server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");
const {ipcMain} = require("electron");

// Custom Modules
let cipher = new(require("./cipher"))();
let dbMan = new(require("./dbManager"))();

module.exports = class { // A Class to manage connections.
   constructor(mainWin){
      this.mainWindow = mainWin;
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

      server.listen(4250,()=>process.$event.emit("server-online"));

      ipcMain.on("eKey:u:genNewKey",async (evt,key)=>{
         console.log(key);
         if(key.algo == 'rsa'){
            console.log("Requested new rsa key gen");
            let keys = await cipher.generateNewRsaPair(key.length);
            let db = await dbMan.addeKey({
               keys,
               algo: `${key.algo}_${key.length}`,
               knc: key.knc
            });
            this.mainWindow.webContents.send("eKey:s:genNewKey");
            this.mainWindow.webContents.send("eKey:s:getKeys",[db]);
         }
      });

      ipcMain.on("eKey:u:getKeys",async (evt,none)=>{
         let docs = await dbMan.geteKeys();
         this.mainWindow.webContents.send("eKey:s:getKeys",docs);
      });

   }

   sendMessage(socketId){}

}


