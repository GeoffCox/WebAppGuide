import { App, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

export default class Main {
  static mainWindow: BrowserWindow | null;
  static application: App;
  static BrowserWindow : typeof BrowserWindow;

  private static onWindowAllClosed() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") Main.application.quit();
  }

  private static onClose() {
    Main.mainWindow = null;
  }

  private static onReady() {
    Main.mainWindow = new Main.BrowserWindow({ width: 800, height: 600 });

    var mainUrl = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "index.html"),
      slashes: true
    });
    
    if (process.env.NODE_ENV === 'development') {
      mainUrl = "http://localhost:3000";
    }

    Main.mainWindow.loadURL(mainUrl);

    Main.mainWindow.on("closed", Main.onClose);
  }

  static main(app: App, browserWindow: typeof BrowserWindow) {
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on("ready", Main.onReady);
    Main.application.on("window-all-closed", Main.onWindowAllClosed);    
  }
}