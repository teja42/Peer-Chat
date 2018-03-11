// This module is responible for managing encryption/decryption.

const Rsa = require("node-rsa");
const threads = require("threads");

class Cipher {
   decrypt(key,msg){
      return msg;
   }

   encrypt(key,msg){
      return msg;
   }

   generateNewRsaPair(keylength=2048){
      let thread = threads.spawn(()=>{
         let keyPair = new Rsa({b:keylength});
         console.log(keyPair);
         return keyPair;
      });
      console.log(thread);
   }

}

module.exports = new Cipher();