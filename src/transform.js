var m4 = require('../lib/twgl').m4
var eventify = require('eventify')

function Transform() {
  eventify.enable(this)

  this.id       = Transform._nextId ++;
  this.position = new Float32Array([0, 0, 0]);
  this.rotateZ  = this.rotateX = this.rotateY = 0;
  this.matrix   = m4.identity(new Float32Array(16));
  this.setRotationOrder('y', 'x', 'z')
}
Transform._nextId = 1;

Transform.prototype.setRotationOrder = function (i, ii, iii) {
  this.rotate1 = 'rotate' + i.toUpperCase();
  this.rotate2 = 'rotate' + ii.toUpperCase();
  this.rotate3 = 'rotate' + iii.toUpperCase();
  return
}

Transform.prototype.getValue = function () {
  if (this.dirty) {
    var m = m4.identity(new Float32Array(16));

    if(this[this.rotate1])
      m4[this.rotate1](m, this[this.rotate1], m);
    if(this[this.rotate2])
      m4[this.rotate2](m, this[this.rotate2], m);
    if(this[this.rotate3])
      m4[this.rotate3](m, this[this.rotate3], m);

    m4.setTranslation(m, this.position, m);
    m4.inverse(m, this.matrix);
    // var pos = tdl.fast.mulScalarVector(new Float32Array(3), -1, this.position);
    // m4.translate(this.matrix, pos);
    this.dirty = false;
  }
  return this.matrix;
}

Transform.prototype.moveTo = function (x, y, z) {
  this.position = [x, y, z];
  this.dirty = true;
  // m4.setTranslation(this.matrix, this.position);
}

Transform.prototype.moveBy = function (x, y, z) {
  this.position[0] += x;
  this.position[1] += y;
  this.position[2] += z;
  this.dirty = true;
}

Transform.prototype.rotateBy = function(z, x, y){
  this.rotateZ += z;
  this.rotateX += x;
  this.rotateY += y;
  this.dirty = true;
}

module.exports = Transform