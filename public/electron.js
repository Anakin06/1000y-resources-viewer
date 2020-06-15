const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// https://github.com/electron/electron/issues/22119
app.allowRendererProcessReuse = false;

process.on("uncaughtException", (error) => {
  console.error(error);
  app.exit();
});

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win = null;
function createWindow() {
  const { width, height } = { width: 800, height: 600 };
  win = new BrowserWindow({
    width,
    height,
    title: process.env.npm_package_title || "Window",
    icon: process.env.npm_package_icon,
    backgroundColor: "#414339",
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      allowRendererProcessReuse: false,
      webSecurity: false,
      enableRemoteModule: true,
    },
    frame: false,
    show: false,
  });
  win.on("ready-to-show", () => win.show());
  if (process.env.NODE_ENV === "development") {
    win.loadURL(process.argv[2]);
  } else {
    win.loadFile(path.join(__dirname, "index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const menu = Menu.buildFromTemplate([
  {
    role: "fileMenu",
    submenu: [
      {
        label: "Open",
        accelerator: "CommandOrControl+O",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Export",
        accelerator: "CmdOrCtrl+E",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      { role: "close" },
      { role: "quit" },
    ],
  },
  {
    label: "Categories",
    submenu: [
      {
        label: "Map",
        accelerator: "CmdOrCtrl+Alt+M",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Sprite",
        accelerator: "CmdOrCtrl+Alt+S",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Effect",
        accelerator: "CmdOrCtrl+Alt+T",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Audio",
        accelerator: "CmdOrCtrl+Alt+U",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Action",
        accelerator: "CmdOrCtrl+Alt+A",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Show terrain",
        checked: true,
        type: "checkbox",
        enabled: false,
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Show objects",
        checked: true,
        enabled: false,
        type: "checkbox",
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Show roof",
        type: "checkbox",
        enabled: false,
        checked: true,
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
      {
        label: "Show grid",
        type: "checkbox",
        enabled: false,
        checked: false,
        click(e) {
          win.webContents.send("menuclick", e.label);
        },
      },
    ],
  },
  {
    role: "Help",
    submenu: [
      process.env.NODE_ENV === "development" && { role: "toggledevtools" },
      {
        label: "About",
      },
    ].filter(Boolean),
  },
]);

Menu.setApplicationMenu(menu);
