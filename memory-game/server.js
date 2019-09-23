var http = require('http');
var express = require('express');

var app = express();

(function() {
  // Create & configure a webpack compiler
  var webpack = require('webpack');
  var webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config.js');

  // Configure to always run in development mode when running local server
  var appWebpackConfig = Object.assign(webpackConfig[1], { mode: "development"});
  var compiler = webpack(appWebpackConfig);

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

if (require.main === module) {
    var server = http.createServer(app);
    server.listen(process.env.PORT || 3000, function() {
      console.log("Listening on %j", server.address());
    });
  }