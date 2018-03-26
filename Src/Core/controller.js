// This is main controller module. It also contains code for managing in/out connections.

let app = require('express')();
let server = require('http').createServer(app);
const socketIOClient = require("socket.io-client");
const {ipcMain,dialog} = require("electron");

// Custom Modules
let cipher = new(require("./cipher"))();
let dbMan = new(require("./dbManager"))();

let sendToMw;

let connectedClients = [];

class Controller {
   constructor(mainWin){

      sendToMw = (evt,obj)=>{
         mainWin.send(evt,obj);
      }

      let io = require('socket.io')(server);

      io.on('connection', async (socket)=>{

         console.log("New Connection");

         let userData;
         socket.on("handshake:challenge",(data)=>{
            this.processHandshakeRequest(data,socket);
         });

         socket.on("handshake:challenge:completed",(enc)=>{
            let x = cipher.rsaUnsign(contact.pubkey,enc);
            if(x==msgToHash){
               console.log("Handshake challenge accepted!");
               ioc.emit("handshake:challenge",)
            }
         });

         socket.on("message",(msg)=>{
            console.log(cipher.decrypt(userData.key,msg));
         });

         socket.on("error",()=>console.log("Error"));
         
      });

      server.listen(process.argv[2] || 4250,()=>process.$event.emit("server-online"));

      ipcMain.on("eKey:u:genNewKey",this.genRsaPair);

      ipcMain.on("eKey:u:getKeys",this.sendKeys);

      ipcMain.on("saveKey",this.saveKey);
      
      ipcMain.on("addContact:u",async (evt,obj)=>{
         await this.addContact(evt,obj);
         this.sendContacts();
      });
      
      ipcMain.on("getContacts:u",this.sendContacts);

      ipcMain.on("connectToAddress",this.connect);
   }

   async connect(evt,contactId){
      console.log(contactId);

      let Data = {};
      Data.aesKey = cipher.randomBytes(32);

      let contact = (await dbMan.getDocs('contacts',{_id:contactId}))[0];
      console.log(contact);
      if(!contact) return console.log("Error! Contact not found in DB.");
      let ourKeyPair = (await dbMan.getDocs('eKeys',{_id: contact.keyToUse}))[0].keys;

      let ioc = new socketIOClient("http://"+contact.con);
      let msgToSign = cipher.randomBytes(16);

      ioc.emit("handshake:challenge",{
         pub: contact.pubkey, // public key of other person
         pub2: ourKeyPair.pub, //our public key
         msgToSign,
         aesKey: cipher.rsaEncrypt(ourKeyPair.pub,Data.aesKey)
      });

      ioc.on("handshake:challenge:completed",(enc)=>{
         if(cipher.verify(contact.pubkey,enc,msgToSign)){
            console.log("Handshake challenge accepted!");
            
         } else {
            ioc = null;
            console.log("Handshake challenge rejected! Disconnecting now!");
         }
      });

      ioc.on("connect_error",(e)=>console.log(e));

      ioc.on("connect_timeout",(e)=>console.log(e));

      ioc.on("handshake:challenge",(data)=>{
         console.log("data : ",data);
         this.processHandshakeRequest(data,ioc);
      });

   }

   async processHandshakeRequest(data,socket){
      console.log("New handshake request.")
      let keyPairToUse = (await dbMan.getDocs('eKeys',{
         "keys.pub":data.pub
      }))[0];
      if(!keyPairToUse){
         socket.emit("error");
         console.log("Assumed public key by other user does not exist in our DB.");
         return socket.disconnect();
      }
      let xidDocs = await dbMan.getDocs('contacts',{
         pubkey: data.pub2
      });
      console.log(xidDocs[0].keyToUse,keyPairToUse._id);
      if(xidDocs.length==0 || xidDocs[0].keyToUse!=keyPairToUse._id){
         socket.emit("pending");
         console.log("Key to use not defined. Pending.");
         return socket.disconnect();
      }
      let enc = cipher.sign(keyPairToUse.keys.pri,data.msgToSign);
      socket.emit("handshake:challenge:completed",enc);
      console.log("Sucessfully executed handshake challange.");
   }

   async addToPendingList(data){

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