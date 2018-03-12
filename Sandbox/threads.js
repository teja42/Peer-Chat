const threads = require("threads");

threads.config.set({
   basepath: {
      node: __dirname + "/../Src/Core/",
      web: "localhost:4250/"
   }
});

const worker = threads.spawn("updater.js");

worker.send({
   a:1,
   b:22
});

worker.on("message",(msg)=>console.log(msg));
