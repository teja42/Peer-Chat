// Load only absolutely required modules for loadWindow to show up for fast startup.
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

   // Load Module's after loading loadWindow for quick startup of app.
   const threads = require("threads");
   threads.config.set({
      basepath:{
         node: __dirname,
         web: "localhost:4250/"
      }
   });

   // Start loading other modules after loadWindow has rendered.
   ipcMain.on('dom-ready',()=>{

      controller = threads.spawn("./controller.js");
      controller.send();
      controller.on("message",(msg)=>{
         if(!msg.evt=="server-online") return;
         loadWindow.webContents.send("loaded-module","Done Loading Controller");
         mainWindow = new BrowserWindow({
            show: false,
            minWidth: 800,
            minHeight: 600
         });
         mainWindow.loadURL(`file://${__dirname}/../UI/index.html`);
         loadWindow.webContents.send("loaded-module","Loading app...");

         mainWindow.on('ready-to-show',()=>{
            loadWindow.webContents.send("loaded-module","Done. Launching app...");
            mainWindow.show();
            loadWindow.close();
         });
      });

      loadWindow.on("close",()=>loadWindow = null);

   });

});

app.on("window-all-close",()=>app.exit(0));