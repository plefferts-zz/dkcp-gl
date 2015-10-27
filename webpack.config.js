
var webpack = require('webpack');

var commonsPlugin =
  new webpack.optimize.CommonsChunkPlugin('../build/dkcp-gl.js');

var uglifyPlugin =
  new webpack.optimize.UglifyJsPlugin({minimize: true})
  
module.exports = {
    entry: {
      picking : "./examples/picking/index.js",
      basic : "./examples/basic/index.js",
    },
    output: {
        path: __dirname + '/examples/',
        filename: "[name]/bundle.js"
    },
    module: {
        loaders: [
            // { test: /\.css$/, loader: "style!css" }
        ]
    },
    devtool : "source-maps",
    plugins: [commonsPlugin, uglifyPlugin]
};
