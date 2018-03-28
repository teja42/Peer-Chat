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

      io.on('connection', (socket)=>{

         console.log("New Connection.");

         let Data;
         let msgToSign = cipher.randomBytes(8);

         socket.on("handshake:challenge", async (data)=>{
            try{
               Data = await Controller.getContactAndVerify("pubkey",data.pub2);
               Data.pub2 = data.pub; // overwrite pub2
               Data.aesKey = data.aesKey; //overwrite aesKey
               await Controller.processHandshakeRequest(data,socket); 

               socket.emit("handshake:challenge",{
                  pub: Data.pub,
                  pub2: Data.pub2,
                  msgToSign
               });

            }catch(e){
               // Report to UI
               console.log(e);
            }
         });

         socket.on("handshake:challenge:completed",(enc)=>{
            if(cipher.verify(Data.pub2,enc,msgToSign)){
               console.log("Handshake challenge accepted!. Listening for messages.");

               socket.on("message",(msg)=>{
                  console.log(cipher.aesDecrypt(Data.aesKey,msg));
               });

               sendToMw("connectionUpdate",{
                  _id:Data._id,
                  status:"Connected",
                  msg: "Secure Connection Established."
               });

            } else {
               sendToMw("connectionUpdate",{
                  _id:Data._id,
                  status:"Disconnected",
                  msg: "Handshake Challenge Failed."
               });
               ioc = null;
               console.log("Handshake challenge rejected! Disconnecting now!");
            }
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

   static getContactAndVerify(method,data){
      return new Promise(async (resolve,reject)=>{
         if(method=="contactId"){
            try{
               let contact = (await dbMan.getDocs('contacts',{_id:data}))[0];
               if(!contact) return reject("Contact Not found in Database.");
               let ourKeyPair = (await dbMan.getDocs('eKeys',{_id: contact.keyToUse}))[0].keys;
               resolve ({
                  pub: ourKeyPair.pub,
                  pub2: contact.pubkey,
                  pri: ourKeyPair.pri,
                  con: contact.con,
                  _id: contact._id
               });
            } catch(e){
               reject("An Error Occured.");
            }
         } else if(method=="pubkey"){
            try{
               let eKeyDoc = (await dbMan.getDocs('eKeys',{"keys.pub":data}))[0];
               let contact = (await dbMan.getDocs('contacts'),{keyToUse:eKeyDoc._id});
               resolve({
                  pub: data,
                  pub2: eKeyDoc.pub,
                  pri: eKeyDoc.pri,
                  _id: contact._id
               });
            }catch(e){
               reject("An Error Occured.");
            }
         }
      });
   }

   async connect(evt,contactId){
      let Data = {};
      try{
         Data = await Controller.getContactAndVerify("contactId",contactId);
      } catch(e){
         console.log("Error : ",e);
         sendToMw("connectionUpdate",{
            _id:Data._id,
            status:"Disconnected",
            msg: "An Error occured while fetching data from DB."
         });
      }
      Data.aesKey = cipher.randomBytes(8);

      let ioc = new socketIOClient("http://"+Data.con,{
         transports: ['websocket']
      });
      let msgToSign = cipher.randomBytes(8);

      ioc.emit("handshake:challenge",{
         pub: Data.pub,
         pub2: Data.pub2,
         msgToSign,
         aesKey: cipher.rsaEncrypt(Data.pub2,Data.aesKey) // Encrypt with other's pub key.
      });

      ioc.on("handshake:challenge", async (data)=>{
         await Controller.processHandshakeRequest(data,ioc);
      });

      ioc.on("handshake:challenge:completed",(enc)=>{
         if(cipher.verify(Data.pub2,enc,msgToSign)){
            console.log("Handshake challenge accepted!");
            sendToMw("connectionUpdate",{
               _id:Data._id,
               status:"Connecting",
               msg: "Hanshake request completed by the remote client."
            });
         } else {
            ioc = null;
            sendToMw("connectionUpdate",{
               _id:Data._id,
               status:"Disconnected",
               msg: "Handshake Challenge Failed."
            });
            console.log("Handshake challenge rejected! Disconnecting now!");
         }
      });

      ioc.on("connect_error",(e)=>{
         console.log("Connect Error : ",e);
         sendToMw("connectionUpdate",{
            _id:Data._id,
            status:"Disconnected",
            msg: "Connection lost. Disconnected."
         });
      });

      ioc.on("connect_timeout",(e)=>{
         console.log("Timeout e : ",e);
         sendToMw("connectionUpdate",{
            _id:Data._id,
            status:"Disconnected",
            msg: "Connection timedout."
         });
      });

   }

   static async processHandshakeRequest(data,socket){
      console.log("New handshake request.");
      let keyPairToUse = (await dbMan.getDocs('eKeys',{
         "keys.pub":data.pub2
      }))[0];
      if(!keyPairToUse){
         socket.emit("error");
         console.log("Assumed public key by other user does not exist in our DB.");
         return socket.disconnect();
      }
      let xidDocs = await dbMan.getDocs('contacts',{
         pubkey: data.pub
      });
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

   saveKey(evt,msg){
      let [id,nature] = msg.split("_");
      dialog.showSaveDialog(this.mainWindow,{
         title: "Select a location to save the key to.",
         filters:[{
            name: `Cretificate`,
            extensions: ["pem"]
         }]
      },async (path)=>{
         try{
            await dbMan.saveKeyToDisk(id,nature,path);
         }catch(e){
            dialog.showMessageBox(this.mainWindow,{
               type: "error",
               buttons: ["ok"],
               title: "Rigel Chat - Error Occured",
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