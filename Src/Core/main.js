// Load only absolutely required modules for loadWindow to show up for fast startup.
const electron = require("electron");
const {app,BrowserWindow,ipcMain} = electron;
let path;

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

   // Start loading other modules after loadWindow has rendered.
   ipcMain.on('dom-ready',()=>{

      path = require("path");
      process.DATA_DIR = path.join(__dirname,"../../Data/");
      process.$event = new (require("events").EventEmitter)();

      mainWindow = new BrowserWindow({
         minWidth: 800,
         minHeight: 600,
         show: false
      });

      new(require("./controller"))(mainWindow);
      process.$event.on("server-online",()=>{

         mainWindow.loadURL(`file://${__dirname}/../UI/index.html`);
         loadWindow.webContents.send("loaded-module","Loading app...");

         mainWindow.on('ready-to-show',()=>{
            loadWindow.webContents.send("loaded-module","Done. Launching app...");
            mainWindow.show();
            loadWindow.close();
         });
      })
   });

      loadWindow.on("close",()=>loadWindow = null);

});

app.on("window-all-close",()=>app.exit(0));