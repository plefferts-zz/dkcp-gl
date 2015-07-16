var util      = require('util')
var twgl      = require('../lib/twgl')
var eventify  = require('eventify')
var RenderSet = require('./render_set')

function Screen(){
  eventify.enable(this)
  RenderSet.call(this)
}
util.inherits(Screen, RenderSet)

Screen.prototype.init = function (canvas, fn) {
  this.canvas = canvas;
  var gl = this.gl = twgl.getWebGLContext(canvas, {antialias: false, premultipliedAlpha: false});
  if (!gl) throw "failed to initialize webgl";

  var options = fn && fn(gl)
  this.setOptions(options || {})
  
  return true;
}

Screen.prototype.setOptions = function (options) {
  var gl = this.gl

  if (!options.imageSmoothingEnabled) {
    gl.imageSmoothingEnabled = false;
  }
  
  if (!options.premultiply_alpha) {
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  }

  options.enable = options.enable ? (options.enable instanceof Array ? options.enable : [options.enable]) : []
  options.enable.forEach(function (v) {
    gl.enable(v)
  })
  
  options.cullFace && gl.cullFace(options.cullFace)
}

Screen.prototype.width = function () {
  return this.canvas.offsetWidth
}

Screen.prototype.height = function () {
  return this.canvas.offsetHeight
}

Screen.prototype.render = function () {
  RenderSet.prototype.render.call(this, this.gl)
}

Screen.prototype.beginFrameRendering = function (once) {
  if (this.started) return
  if (!once) this.started = true
  
  
  
  var now = new Date().getTime();
  var frame = function () {
    this.trigger('frame', new Date().getTime() - now);
    now = new Date().getTime();
    
    this.render();
    if (!once) {
      requestAnimationFrame(frame, this.canvas);
    }
  }.bind(this)

  frame();  // call the first render manually to start it off.
}

module.exports = Screen