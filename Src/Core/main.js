const electron = require("electron");
const {app,BrowserWindow,ipcMain} = electron;

// Intitalize global variables;
let loadWindow, mainWindow;
let controller;

app.on("ready",()=>{
   loadWindow = new BrowserWindow({
      frame: false,
      width: 600,
      height:400,
      resizable: false
   });
   loadWindow.loadURL(`file://${__dirname}/../UI/mainLoad.html`);

   // Load threads module after loading loadWindow for quick startup of app.
   const threads = require("threads");
   threads.config.set({
      basepath:{
         node: __dirname,
         web: "localhost:4250"
      }
   });

   // Start loading other modules after loadWindow has rendered.
   ipcMain.on('dom-ready',()=>{

      controller = threads.spawn("./controller.js");
      controller.on("message",(msg)=>{
         if(msg=="server-online") loadWindow.webContents.send("loaded-module","Controller");
      });

   });
});

app.on("window-all-close",()=>app.exit(0));