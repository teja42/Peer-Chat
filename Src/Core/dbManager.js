// This Module is responsible for storing and retriving data from local DB.

const nedb = require("nedb");

let msgDB = new nedb({filename: `${process.DATA_DIR}msg.db`,autoload: true});
let eKeysDB = new nedb({filename: `${process.DATA_DIR}eKeys.db`,autoload:true});

module.exports = class {

   // eKeys
   geteKeys(){
      return new Promise((resolve,reject)=>{
         eKeysDB.find({},(err,docs)=>{
            if(err) reject(err);
            resolve(docs);
         });
      });
   }

   addeKey(keyObj){
      return new Promise((resolve,reject)=>{
         eKeysDB.insert(keyObj,(err,newdoc)=>{
            if(err) reject(err);
            resolve(newdoc);
         });
      });
   }

   deleteeKey(id){
      return new Promise((resolve,reject)=>{
         eKeysDB.remove({_id:id},(err,numRemoved)=>{
            if(err) reject(err);
            resolve();
         });
      });
   }

}
