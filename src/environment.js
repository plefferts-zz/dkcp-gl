var util        = require('util')
var RenderSet   = require('./render_set')
var BasicCamera = require('./camera').BasicCamera

function Environment(framebuffers) {

  this.framebuffers = framebuffers;
  this.cameras = [];
  this.camera = null;
  
  for (var ff = 0; ff < 6; ++ff) {
    var c;
    this.cameras.push(c = new BasicCamera(framebuffers.size, framebuffers.size, .1, 4096));
    c.setFOV(90, true);
  }
  
  this.cameras[2].rotateBy(0, Math.PI/2, 0);
  this.cameras[3].rotateBy(0, -Math.PI/2, 0);
  this.cameras[5].rotateBy(0, Math.PI, Math.PI);
  this.cameras[1].rotateBy(0, Math.PI, -Math.PI/2);
  this.cameras[4].rotateBy(0, Math.PI, 0);
  this.cameras[0].rotateBy(0, Math.PI, Math.PI/2);
  
  RenderSet.call(this)
}
util.inherits(Environment, RenderSet)

Environment.prototype.render = function (gl) {
  for (var ff = 0; ff < 6; ++ff) {
    this.framebuffers.bind(ff);
    this.camera = this.cameras[ff];
    RenderSet.prototype.render.call(this, gl);
  }
  this.framebuffers.unbind();
}
module.exports = Environment