// This is main controller module. It also contains code for managing in/out connections.

let app = require('express')();
let server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");
const {ipcMain,dialog} = require("electron");

// Custom Modules
let cipher = new(require("./cipher"))();
let dbMan = new(require("./dbManager"))();

let sendToMw;

class Controller {
   constructor(mainWin){

      sendToMw = (evt,obj)=>{
         mainWin.send(evt,obj);
      }

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

      ipcMain.on("eKey:u:genNewKey",this.genRsaPair);

      ipcMain.on("eKey:u:getKeys",this.sendKeys);

      ipcMain.on("saveKey",this.saveKey);
      
      ipcMain.on("addContact:u",async (evt,obj)=>{
         await this.addContact(evt,obj);
         this.sendContacts();
      });
      
      ipcMain.on("getContacts:u",this.sendContacts);
   }

   async genRsaPair(evt,key){
      console.log(key);
      if(key.algo == 'rsa'){
         console.log("Requested new rsa key gen");
         let keys = await cipher.generateNewRsaPair(key.length);
         let db = await dbMan.addDoc('eKeys',{
            keys,
            algo: `${key.algo}_${key.length}`,
            knc: key.knc
         });
         sendToMw("eKey:s:genNewKey");
         sendToMw("eKey:s:getKeys",[db]);
      }
   }

   async sendKeys(evt,none){
      let docs = await dbMan.getDocs('eKeys');
      sendToMw("eKey:s:getKeys",docs);
   }

   async saveKey(evt,msg){
      let [id,nature] = msg.split("_");
      dialog.showSaveDialog(this.mainWindow,{
         title: "Select a location to save the key to.",
         filters:[{
            name: `Cretificate`,
            extensions: ["pem"]
         }]
      },async (path)=>{
         try{
            dbMan.saveKeyToDisk(id,nature,path);
         }catch(e){
            dialog.showMessageBox(this.mainWindow,{
               type: "error",
               buttons: ["ok"],
               title: "Rigel Chat : Error Occured",
               message: "An error occured while trying to save the key to disk",
               buttons: ['Ok']
            });
         }
      });
   }

   async sendContacts(){
      try{
         let docs = await dbMan.getDocs('contacts');
         sendToMw("getContacts:s",docs);
      }catch(e){
         console.log(e);
      }
   }

   async addContact(evt,obj){
      return new Promise((resolve,reject)=>{
         try{
            dbMan.addDoc("contacts",obj);
            resolve();
         }catch(e) {
            dialog.showMessageBox(this.mainWindow,{
               type: "error",
               title: "Rigel Chat : Error",
               message: "An Error occured while trying to add Contact",
               buttons: ['Ok']
            });
            reject();
         }
      });
   }

   sendMessage(socketId){}

}

module.exports = Controller;