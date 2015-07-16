var Acommodator = require('./accommodator'),
    util        = require('util')

function Renderable(options) {
  this.options = options
  
  if (options.renderOrder !== false)
    this.renderOrder = options.renderOrder

  if (options.shouldPrecede)
    this.shouldPrecede = options.shouldPrecede
  
  Acommodator.call(this, options.factory)
}
util.inherits(Renderable, Acommodator)

Renderable.prototype.render = function (gl) {
  var fn

  fn = this.options.before
  fn && fn.call(this)

  fn = this.options.getUniforms
  
  var uniforms = fn ? fn.call(this) : {}
  
  fn = this.options.render || this.renderModels
  fn.call(this, gl, uniforms)
  
  fn = this.options.after
  fn && fn.call(this)
}

Renderable.prototype.renderModels = function (gl, uniforms) {
  var models = this.rooms
  for (var i = 0; i < models.length; i ++) {
    var model = models[i]
    if (model.dirty)
      model.refresh(gl);

    var geom = model.getGeometry(gl);
    model.drawPrep(geom, uniforms);
    geom.draw();
  }
}

Renderable.prototype.shouldPrecede = function (renderable) {
  return (this.renderOrder || 0) < (renderable.renderOrder || 0)
}

module.exports = Renderable