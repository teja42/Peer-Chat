const electron = require("electron");
const {app,BrowserWindow,ipcMain} = electron;

let loadWindow, mainWindow;

let conMan/*(Short for Connection Manager)*/;

app.on("ready",()=>{
   loadWindow = new BrowserWindow({
      frame: false,
      width: 600,
      height:400,
      resizable: false
   });

   loadWindow.loadURL(`file://${__dirname}/../UI/mainLoad.html`);

   ipcMain.on('dom-ready',()=>{
      console.log("Window loaded");

      conMan = require("./controller")(()=>{
         loadWindow.webContents.send("loaded-module","Controller");
      });

   });

});

app.on("window-all-close",()=>app.exit(0));