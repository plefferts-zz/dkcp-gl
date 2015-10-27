var Renderable = require('./renderable')

function RenderSet(){
  this.renderables = [];
  this.renderablesDirty = false;
}

RenderSet.prototype.addRenderable = function (renderable) {
  if (!(renderable instanceof Renderable))
    renderable = new Renderable(renderable)

  this.renderables.push(renderable);
  this.renderablesDirty = true;
}

RenderSet.prototype.checkSort = function () {
  if (this.renderablesDirty) {
    this.sortRenderables();
  }
}

RenderSet.prototype.sortRenderables = function () {
  this.renderables = this.renderables.sort(function (a, b) {
    return b.shouldPrecede(a) || -a.shouldPrecede(b);
  })

  this.renderablesDirty = false;
}

RenderSet.prototype.render = function (gl) {
  this.checkSort();
  
  for (var i=0; i<this.renderables.length; i ++) {
    this.renderables[i].render(gl, this);
  }
}


module.exports = RenderSet