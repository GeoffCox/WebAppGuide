# Electron React Web Application

# Getting Started
This contains the steps to go from a react web application to run within Electron.

## Prerequisites

1. Start with a copy of the react-web-application
2. Recommended: VSCode IDE.

# Update the application name

1. Update package.json

````
{
  "name": "electron-react-web-app",

  //...
}
````

2. Update webpack.config.js

````
module.exports = {
  //...

  plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        title: "electron-react-web-app",

        //...
        })
    ],
};
````

# Add Electron

1. Install Typescript locally and globally

````
npm install electron --save
````

# Separate the React application from Electron main

1. Create app and main subfolders under src/

Everything that was previously under src/ moves to be under app/

````
    src/
        app/
            components/
              App.tsx
              Greeting.tsx
            index.tsx
        main/
````

2. Update webpack.config.js to create two entry points for webpack: one for electron main and one for the react application.

Note: module.exports changes from an single entry point object to an array of entry points.
Move everything that was in the single entry point to the React application entry point.

````
module.exports = [
  // --- Electron Main ---
  {},
  //--- React Application ---
  {
    //...
  }
];
````

# Create the Electron main function

1. Create src/main/main.ts with the application, main window, and browser window properties and entry point.

````
import { App, BrowserWindow } from "electron";

export default class Main {
  static mainWindow: BrowserWindow | null;
  static application: App;
  static BrowserWindow : typeof BrowserWindow;  

  static main(app: App, browserWindow: typeof BrowserWindow) {
    Main.BrowserWindow = browserWindow;
    Main.application = app;
  }
}
````

2. Update src/main/main.ts with an onReady handler to load the react web page into the main window.

````
//...
import * as path from "path";
import * as url from "url";

export default class Main {
  //...

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
  }

  //...
}
````

3. Update src/main/main.ts with window close handlers

````
//...
import * as path from "path";
import * as url from "url";

export default class Main {
  private static onWindowAllClosed() {
    if (process.platform !== "darwin") Main.application.quit();
  }

  private static onClose() {
    Main.mainWindow = null;
  }

  private static onReady() {
    //...

    Main.mainWindow.on("closed", Main.onClose);
  }

  static main(app: App, browserWindow: typeof BrowserWindow) {
    //...
    Main.application.on("window-all-closed", Main.onWindowAllClosed);    
  }
}
````

4. Create src/main/index.ts to start the electron application using Main

````
import { app, BrowserWindow } from "electron";
import Main from "./main";
Main.main(app, BrowserWindow);
````

# Update webpack configuration for the React Application

2. Update webpack.config.js to have the React entry point match the new location of src/app/index.tsx

````
module.exports = [
  // --- Electron Main ---
  {},
  //--- React Application ---
  {
    entry: {
      app: [
        "webpack-hot-middleware/client", 
        join(__dirname, "src/app/index.tsx")
      ]
    },
    //...
  }
];
 ````

3. Update webpack.config.js to bundle based on the name of the entry point

````
module.exports = [
  // --- Electron Main ---
  {},
  //--- React Application ---
  {
    //...

    // Tells webpack where to output the bundled javascript
    output: {
      filename: "[name]_bundle.js",
      path: join(__dirname, "dist")
    },

    //...
 }
];
 ````    

3. Update webpack.config.js to mark the React entry point as an Electron render process

````
module.exports = [
  // --- Electron Main ---
  {},
  //--- React Application ---
  {      
    //...
    
    target: "electron-renderer"
  }
];
 ````

# Update webpack configuration for Electron Main

1. Update webpack.config.js to add entry and output

 ````
module.exports = [
  // --- Electron Main ---
  {
    entry: {
      main: join(__dirname, "src/main/index.ts")      
    },

    // Tells webpack where to output the bundled javascript
    output: {
      filename: "[name]_bundle.js",
      path: join(__dirname, "dist")
    }
  },
  //--- React Application ---
  {      
    //...   
  }
];
 ````

 2. Update webpack.config.js to add typescript and source-map loaders

 ````
 // --- Electron Main ---
  {
    // Tells webpack what kind of source maps to produce.
    // There are a lot of options, but I chose the complete separate file option.
    devtool: "source-map",

    //...

    // Tells webpack how to run file transformation pipeline of webpack.
    // Awesome-typescript-loader will run on all typescript files.
    // Source-map-loader will run on the JS files.
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        {
          test: /\.tsx?$/,
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

    //...

    // Tells webpack what file extesions it should look at.
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },
  },
  //--- React Application ---
  {      
    //...   
  }
];
 ````

 3. Update webpack.config.js to add development and bundling configuration
 
 ````
 // --- Electron Main ---
  {
    //...

    // When the env is "development", this tells webpack to provide debuggable information in the source maps and turns off some optimizations.
    mode: process.env.NODE_ENV,

    //...

    // Tells webpack not to touch __dirname and __filename.
    // If you run the bundle in node.js it falls back to these values of node.js.
    // https://github.com/webpack/webpack/issues/2010
    node: {
      __dirname: false,
      __filename: false
    },

    //...
  },
  //--- React Application ---
  {      
    //...   
  }
];
 ````

 4. Update webpack.config.js to mark the React entry point as an Electron main process

 ````
  // --- Electron Main ---
  {
    //...

     // Tells webpack that we are producing a bundle intended to run as electron's main entry point.
    target: "electron-main"
  },
  //--- React Application ---
  {      
    //...   
  }
];

 ````

 # Update the developer server for Electron

 1. Update server.js to use the Electron main entry point

 ````
//...

(function() {
  //...

  var appWebpackConfig = Object.assign(webpackConfig[1], { mode: "development"});

  //...
}
 ````

 # Update the build for Electron

1. Add npm-run-all

````
npm install --save-dev npm-run-all
````

2. Update package.json

````
{
  //...

  "main": "dist/main_bundle.js",
  "scripts": {
    "build:dev": "webpack --config webpack.config.js --mode development",
    "build:prod": "webpack --config webpack.config.js --mode production",
    "start:server": "node server.js",
    "start:dev": "run-p start:server start",    
    "start": "electron dist/main_bundle.js"
  },
````