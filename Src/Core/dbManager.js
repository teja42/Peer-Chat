// This Module is responsible for storing and retriving data from local DB.

const nedb = require("nedb");

module.exports = class {
   constructor(){
      this.msgDB = new nedb({filename: `${process.DATA_DIR}msg.db`});
      this.eKeysDB = new nedb({filename: `${process.DATA_DIR}eKeys.db`});
   }

   geteKeys(){
      return new Promise((resolve,reject)=>{
         this.eKeysDB.find({},(err,docs)=>{
            if(err) reject(err);
            resolve(docs);
         });
      });
   }

}
