var twgl = require('../lib/twgl')
var util = require('util')

function Texture(gl, img) {
  this.gl  = gl
  this.img = img
}
Texture.prototype.getTexture = function () {
  var gl = this.gl

  if (this.texture)
    return this.texture

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // bug workaround
  return this.texture = {
    texture : twgl.createTexture(gl, {
      target : gl.TEXTURE_2D,
      flipY  : true,
      auto   : false,
      min    : gl.LINEAR,
      src    : this.img
    })
  }
}

module.exports = Texture