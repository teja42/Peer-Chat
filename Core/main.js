const electron = require("electron");
const {app,BrowserWindow} = electron;

let loadWindow, mainWindow;

app.on("ready",()=>{
   loadWindow = new BrowserWindow({
      frame: false,
      width: 700,
      height:400,
      resizable: false
   });
   loadWindow.loadURL(`file://${__dirname}/../UI/index.html`);
});

app.on("window-all-close",()=>app.exit(0));