# React Web Application

# Getting Started
This contains the steps to go from nothing to a ready-to-develop react web application.  

## Prerequisites

1. Node.js (https://nodejs.org) of v8.16.0 or later.
2. Recommended: VSCode or other IDE.

# Create application

1. Create the directory and initialize package.json

````
mkdir react-web-app
cd react-web-app
npm init
````

2. Add .gitignore

````
node_modules
dist
````

# Add Typescript

1. Install Typescript locally and globally

````
npm install typescript --save-dev
npm install typescript --global
````

2. Create tsconfig.json

````
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist/", 
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "sourceMap": true,
    "strict": true,
    "target": "es6"
  },
  "include": [
    "./src/**/*"
  ]
}
````

# Add React

1. Install React, React DOM, and Typescript definitions for both

````
npm install --save react react-dom @types/react @types/react-dom
````

2. Update tsconfig.json to support JSX

````
{
  "compilerOptions": {
    "jsx": "react"
  }
}
````

# Add Webpack

1. Install webpack

````
npm install --save-dev webpack webpack-cli
````

2. Install webpack plugins and loaders

````
npm install --save-dev html-webpack-plugin html-webpack-template
npm install --save-dev awesome-typescript-loader 
npm install --save-dev source-map-loader
````

# Configure webpack

1. Create webpack.config.js with an empty module.exports.

````
// This is the object webpack looks at for configuration.
// Webpack doesn't  care about any other javascript in the file.
// Because this is javascript, you can write functions to help build up the configuration.
module.exports = {
  }
};
````

2. Update webpack.config.js to add entry and output to module.exports

````
const { join } = require("path");

module.exports = {

  // Tells webpack where start walking the dependencies to build a bundle.
  entry: join(__dirname, "src/index.tsx"),

  // Tells webpack where to output the bundled javascript
  output: {
    filename: "bundle.js",
    path: join(__dirname, "dist")
  }
}
````

3. Update webpack.config.js to add typescript and source-map loaders

````
module.exports = {
  
  // Tells webpack what kind of source maps to produce.
  // There are a lot of options, but I chose the standalone file option.
  devtool: "source-map",

  // Tells webpack how to run file transformation pipeline of webpack.
  // Awesome-typescript-loader will run on all typescript files.
  // Source-map-loader will run on the JS files.
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loaders: ["awesome-typescript-loader"] },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js?$/, loader: "source-map-loader" }
    ]
  },

  // Tells webpack what file extesions it should look at.
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
}
````

4. Update webpack.config.js to add the HTML plugin to module.exports

````
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTemplate = require("html-webpack-template");

// package.json contains the version number of the dependencies
// that we want to make external.  Parsing the package.json
// makes it automatic to keep the package version in sync with
// the CDN URL used in the HtmlWebpackPlugin
const packageJson = require('./package.json');

module.exports = {
  
  // Tells the HTML webpack plug-in to use a template and emit dist/index.html
  plugins: [
    new HtmlWebpackPlugin({
      title: "react-web-app",
      inject: false,
      template: HtmlWebpackTemplate,
      appMountId: "app",
      scripts: [
        `https://unpkg.com/react@${packageJson.dependencies['react']}/umd/react.production.min.js`,
        `https://unpkg.com/react-dom@${packageJson.dependencies['react-dom']}/umd/react-dom.production.min.js`
      ]
    })
  ]
}
````

5. Update webpack.config to handle React as an external library

````
module.exports = {
  
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache standard libraries like React once.
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
}
````

6. Update webpack.config.js to add development and bundling configuration

````
module.exports = {
  
  // When the env is "development", this tells webpack to provide debuggable information in the source maps and turns off some optimizations.
  mode: process.env.NODE_ENV,

  // Tells webpack not to touch __dirname and __filename.
  // If you run the bundle in node.js it falls back to these values of node.js.
  // https://github.com/webpack/webpack/issues/2010
  node: {
    __dirname: false,
    __filename: false
  },
}
````

# Update build to use  webpack

1. Update package.json with build script commands.

````
"scripts": {
    "build:dev": "webpack --config webpack.config.js --mode development",
    "build:prod": "webpack --config webpack.config.js --mode production"
}
````

# Create React Components

1. Create folder structure

````
src/
  components/    
````

2. Create src/components/Greeting.tsx

````
import * as React from "react";

export interface GreetingProps { name: string }

export class Greeting extends React.Component<GreetingProps, {}> {
    render() {
        return <h1>Hello {this.props.name}!</h1>;
    }
}
````

3. Create src/index.tsx

Note: The HTML element with id='app' is created by the HTML webpack plugin

````
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Greeting } from "./components/Greeting";

ReactDOM.render(
    <Greeting name="World" />,
    document.getElementById("app")
);
````

# Verify application works

1. Build

````
npm run build:dev
````

2. Open in a browser

````
cd dist
index.html
````

3. Verify 'Hello World!' appears

# Add web server with Hot Module Reloading (HMR)

1. Install express, middleware, and hmr

````
npm install --save-dev express webpack-dev-middleware webpack-hot-middleware
````

2. Create server.js with self-executing function

````
(function() {
})();  
````

3. Update server.js to compile using webpack

````
(function() {
  // Create & configure a webpack compiler
  var webpack = require('webpack');
  var webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config.js');

  // Configure to always run in development mode when running local server
  var appWebpackConfig = Object.assign(webpackConfig, { mode: "development"});
  var compiler = webpack(appWebpackConfig);
})();  
````

4. Update server.js to wire up the middleware

````
(function() {

  // ...

  // Attach the dev middleware to the compiler & the server
  app.use(require("webpack-dev-middleware")(compiler, {
    headers: {
        "Access-Control-Allow-Origin": "*"
    }, 
    lazy: false,
    publicPath: appWebpackConfig.output.publicPath,
    noInfo: false,
    stats: { colors: true }
  }));

  // Attach the hot middleware to the compiler & the server
  app.use(require("webpack-hot-middleware")(compiler));
})();  
````

5. Update server.js to host the application on a server and port

````
(function() {
    // ...
})();  

if (require.main === module) {
  var server = http.createServer(app);
  server.listen(process.env.PORT || 3000, function() {
    console.log("Listening on %j", server.address());
  });
}
````

6. Update webpack.config.js to add MHR middleware to the entry point.

````
module.exports = {
  
  // Tells webpack where start walking the dependencies to build a bundle.
  entry: {
    app: [
      "webpack-hot-middleware/client", 
      join(__dirname, "src/index.tsx")
    ]
  },
}
````
7. Update webpack.config.js to add HMR middleware to the plugins

````
var webpack = require('webpack');

module.exports = {
  
  // Tells the HTML webpack plug-in to use a template and emit dist/index.html
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // ...
  ],
}
````

8. Update package.json to add start:dev script

````
"scripts": {
    // ...
    "start": "node server.js"
  },
````

# Add HMR aware React Components

1. Create src/components/App.tsx

````
import * as React from "react";
import { Greeting } from "./Greeting";

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <Greeting name="World!" />
      </div>
    );
  }
}
````

2. Update index.tsx to support HMR

````
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/App";

const appElement = document.getElementById("app");

// Creates an application
const createApp = (AppComponent: typeof App) => {
  return <AppComponent />;
};

// Initial rendering of the application
ReactDOM.render(createApp(App), appElement);

// Hot Module Replacement types
interface NodeModule {
  hot: any;
}

declare var module: NodeModule;

interface NodeRequire {
  <T>(path: string): T;
}

declare var require: NodeRequire;

// Whenever the HMR indicates the source has changed,
// a new application is created and swapped with the current one.
if (module.hot) {
  module.hot.accept("./components/App", () => {
    console.log("hot module reload");
    const NextApp = require<{ App: typeof App }>("./components/App").App;
    ReactDOM.render(createApp(NextApp), appElement);
  });
}
````

# Verify HMR works

1. Build

````
npm run build:dev
````

2. Start

````
npm start
````

3. Open localhost:3000 in a browser and verify 'Hello World!' appears

4. Modify src/App.tsx and change 'World' to 'HMR'. Save the changes.

5. Verify 'Hello HMR!' appears automatically.  

> Note: Chrome will refresh automatically. Edge requires manual refresh.