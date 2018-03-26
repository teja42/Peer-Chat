// This module is responible for managing encryption/decryption.

const Rsa = require("node-rsa");
const threads = require("threads");

const crypto = require("crypto");

module.exports = class {
   decrypt(key,msg){
      return msg;
   }

   encrypt(key,msg){
      return msg;
   }

   sign(key,msg){
      let rsa = new Rsa(key);
      var buf = Buffer.from(msg, 'hex');
      let signature = rsa.sign(buf,'hex','hex');
      return signature;
   }

   verify(pubkey,signature,originalMsg){
      let buf = Buffer.from(originalMsg,'hex');
      let rsa = new Rsa(pubkey);
      return rsa.verify(buf,signature,'hex','hex');
   }

   rsaEncrypt(pubKey,msg){
      let rsa = new Rsa(pubKey);
      var buf = Buffer.from(msg, 'utf8');
      return rsa.encrypt(buf,'hex');
   }

   randomBytes(n){
      return crypto.randomBytes(n).toString("hex");
   }

   hash(msg){
      const sha256 = crypto.createHash("sha256");
      sha256.update(msg);
      return sha256.digest('hex');
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