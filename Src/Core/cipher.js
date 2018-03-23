// This module is responible for managing encryption/decryption.

const Rsa = require("node-rsa");
const threads = require("threads");

module.exports = class {
   decrypt(key,msg){
      return msg;
   }

   encrypt(key,msg){
      return msg;
   }

   generateNewRsaPair(keylength=2048){
      return new Promise((resolve,reject)=>{
         let thread = threads.spawn((x)=>{
            return new Promise((resolve,reject)=>{
               const Rsa = require("node-rsa");
               let keyPair = new Rsa({b:x});
               let pri = keyPair.exportKey("pkcs1-private-pem");
               let pub = keyPair.exportKey("pkcs1-public-pem");
               resolve({pri,pub});
            });  
         });
         thread.send(keylength);
         thread.on("message",(response)=>resolve(response));
      });
   }

}