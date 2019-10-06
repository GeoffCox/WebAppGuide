# Electron React Web Application Guide

This contains the steps update the react-web-app to run within electron.

## Sequence

These instructions focus on adding electron and reconfiguring webpack and HMR to work within electron. electron has a lot of additional capability for interacting with Windows, Apple, and Linux operating systems that is not covered here.  

Here's what we'll do in this guide:

1. Add electron to the application.
2. Restructure the source to separate the electron and react pieces.
3. Update webpack to have separate bundles for electron and react.
4. Update the HMR server to use the electron entry point.

# Make a copy the react web application

1. Start with a copy of the react-web-app

2. Update package.json to rename the application.

Replace the name statement with the following.

```json
{
  "name": "electron-react-web-app",
}
```

3. Update webpack.config.js to rename the page title.

Replace the title statement within the HtmlWebpackPlugin with the following.

```js
title: "electron-react-web-app",
```

# Add electron

1. Install electron

```batchfile
npm install electron --save
```

# Separate the react application from electron main

1. Create app and main subfolders under src/

Move everything that was previously under src/ within the app/ subfolder.

```
    src/
        app/
            components/
              App.tsx
              Greeting.tsx
            index.tsx
        main/
```

2. Update webpack.config.js to create two entry points for webpack: one for electron main and one for the react application.

It is important to notice that module.exports changes from an single entry point object to an array of entry points. Move everything that was in the previous entry point into the to the react application entry point.

```js
module.exports = [
  // --- electron Main ---
  {},
  //--- react Application ---
  {
    //...
  }
];
```

# Create the electron main function

1. Create src/main/main.ts

This main function uses electron to create a browser-enabled window that will host the react application.
When running in development mode, it will use the web page from the HMR server.js.
The main function handles events to exit the application when the react application window is closed.

1. Create src/main/main.ts

```ts
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
```

2. Create src/main/index.ts to start the electron application using Main

```ts
import { app, BrowserWindow } from "electron";
import Main from "./main";
Main.main(app, BrowserWindow);
```

# Update webpack / react application export

Each of these steps targets the react application export within module.exports.  
The electron export remains empty until later.

1. Update webpack.config.js to use src/app/index.tsx

Replace the entry statement with the following:

```js
entry: {
  app: [
    "webpack-hot-middleware/client", 
    join(__dirname, "src/app/index.tsx")
  ]
},
```

2. Update webpack.config.js to bundle using the entry point name

Replace the output statement with the following.

```js
// Tells webpack where to output the bundled javascript
output: {
  filename: "[name]_bundle.js",
  path: join(__dirname, "dist")
},
```    

3. Update webpack.config.js target the electron render process

Add the following after the resolve statement.

```js
target: "electron-renderer"
```

# Update webpack / electron main export

Each of these steps targets the electron application export within module.exports

1. Update webpack.config.js to add entry and output for electron main

```js
// Tells webpack where start walking the dependencies to build a bundle.
// This can be multiple locations, but you can also have multiple module.exports.
entry: {
  main: join(__dirname, "src/main/index.ts")      
},

// Tells webpack where to output the bundled javascript.
output: {
  filename: "[name]_bundle.js",
  path: join(__dirname, "dist")
},  
```

 2. Update webpack.config.js to add typescript and source-map loaders

Add the following after the output statement.

```js
// Tells webpack what kind of source maps to produce.
// There are a lot of options, but I chose the complete separate file option.
devtool: "source-map",

// Tells webpack how to run file transformation pipeline of webpack.
// Awesome-typescript-loader will run on all typescript files.
// Source-map-loader will run on the JS files.
module: {
  rules: [
    // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
    {
      test: /\.ts$/,
      loaders: ["awesome-typescript-loader"],
      exclude: /node_modules/
    },

    // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
    {
      enforce: "pre",
      test: /\.js$/,
      loader: "source-map-loader"
    }
  ]
},
    
// Tells webpack what file extesions it should look at.
resolve: {
  extensions: [".ts", ".js", ".json"]
},  
```

 3. Update webpack.config.js to add development and bundling configuration
 
Add the following after the resolve statement.

```js
// When the env is "development", this tells webpack to provide debuggable information in the source maps and turns off some optimizations.
mode: process.env.NODE_ENV,

// Tells webpack not to touch __dirname and __filename.
// If you run the bundle in node.js it falls back to these values of node.js.
// https://github.com/webpack/webpack/issues/2010
node: {
  __dirname: false,
  __filename: false
},
```

 4. Update webpack.config.js to target electron main.

Add the following after the node statement.

```js  
// Tells webpack that we are producing a bundle intended to run as electron's main entry point.
target: "electron-main" 
```

 # Update the developer server for electron

 1. Update server.js to use the electron main entry point

Replace the assignment of appWebpackConfig with the following.

```js
var appWebpackConfig = Object.assign(webpackConfig[1], { mode: "development"});
```

 # Update the build for electron

1. Install the npm-run-all package

```batchfile
npm install --save-dev npm-run-all
```

2. Update package.json to use the main bundle.

Replace the main statement with the following.

```json
"main": "dist/main_bundle.js",
```

3. Update package.json to start electron.

Replace the scripts statement with the following.

```json
"build:dev": "webpack --config webpack.config.js --mode development",
"build:prod": "webpack --config webpack.config.js --mode production",
"start:server": "node server.js",
"start:dev": "run-p start:server start",    
"start": "electron dist/main_bundle.js"
```

# Verify the application works

1. Build

```batchfile
npm run build:dev
```

2. Run

```batchfile
npm start
```

The electron application should launch and then when bundling is finished, 'Hello World!' should appear.

If you modify any react application code and save, you should see HMR cause a recompile and the UI refresh automatically.  However, changes to the electron main function require a complete application restart as they are outside the HMR web server scope.
