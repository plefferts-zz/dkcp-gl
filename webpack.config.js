
var webpack = require('webpack');

var commonsPlugin =
  new webpack.optimize.CommonsChunkPlugin('../build/dkcp-gl.js');

var uglifyPlugin =
  new webpack.optimize.UglifyJsPlugin({minimize: true})
  
module.exports = {
    entry: {
      addremove : './examples/addremove/index.js',
      basic : './examples/basic/index.js',
      environment : './examples/environment/index.js',
      geodesic : './examples/geodesic/index.js',
      noise : './examples/noise/index.js',
      picking : './examples/picking/index.js',
      sprite : './examples/sprite/index.js',
      transforms : './examples/transforms/index.js'
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
    plugins: [
      commonsPlugin,
      uglifyPlugin
    ]
};
