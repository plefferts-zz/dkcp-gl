#!/usr/bin/env node

var watchify   = require('watchify');
var browserify = require('browserify');
var fs         = require('fs');
var path       = require('path');
var xtend      = require('xtend');

var entries = ['src/dkcp-gl.js']
var outputs = ['build/empty.js']
var outfile = 'build/dkcp-gl.js'

process.argv.slice(2).forEach(function (example) {
  if (example == 'examples/img')
    return
  entries.unshift(example + '/index.js')
  outputs.unshift(example + '/bundle.js')
})

var b = browserify(xtend({
    entries: entries.map(function (entry) {return path.resolve(process.cwd(), entry) }),
    debug: true
}, watchify.args))
b.plugin('factor-bundle', { o: outputs })
b.plugin('browserify-bower', { require: ['*'] });

var w = watchify(b)
w.setMaxListeners(Infinity);

var dotfile = path.join(path.dirname(outfile), '.' + path.basename(outfile));

w.on('update', bundle);
bundle();

function bundle () {
  var wb = w.bundle();
  wb.on('error', function (err) {
    console.error(String(err));
    fs.writeFile(outfile, 'console.error('+JSON.stringify(String(err))+')', function(err) {
        if (err) console.error(err);
    })
  });
  wb.pipe(fs.createWriteStream(dotfile));
  
  wb.on('end', function () {
    fs.rename(dotfile, outfile, function (err) {
      if (err) return console.error(err);
    });
  });
}