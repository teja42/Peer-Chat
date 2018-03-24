// This Module is responsible for storing and retriving data from local DB.

const nedb = require("nedb");
const fs = require("fs");

let DB = {
   msg : new nedb({filename: `${process.DATA_DIR}msg.db`,autoload: true}),
   eKeys : new nedb({filename: `${process.DATA_DIR}eKeys.db`,autoload:true})
}

module.exports = class {

   // eKeys
   getDocs(db,searchObj={}){
      return new Promise((resolve,reject)=>{
         DB[db].find(searchObj,(err,docs)=>{
            if(err) reject(err);
            resolve(docs);
         });
      });
   }

   addDoc(db,keyObj){
      return new Promise((resolve,reject)=>{
         DB[db].insert(keyObj,(err,newdoc)=>{
            if(err) reject(err);
            resolve(newdoc);
         });
      });
   }

   deleteDoc(db,id){
      return new Promise((resolve,reject)=>{
         DB[db].remove({_id:id},(err,numRemoved)=>{
            if(err) reject(err);
            resolve();
         });
      });
   }

   saveKeyToDisk(id,nature,path){
      return new Promise(async (resolve,reject)=>{
         try {
            let doc = await this.getDocs('eKeys',{_id:id});
            fs.writeFile(path,doc[0].keys[nature],(err)=>{
               if(err) reject();
            });
         }catch(e){ reject(); }
      });
   }

}
