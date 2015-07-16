
function Attribute(name, max, numComponents, elementsPerPoly, bufferType, setElements) {
  this.name            = name
  this.max             = max
  this.numComponents   = numComponents
  this.elementsPerPoly = elementsPerPoly
  this.bufferType      = bufferType
  this.dirty           = false
  this.buffer          = this.createBuffer()
  this.setElements     = setElements
}

Attribute.prototype.getBuffer = function () {
  return { data : this.buffer, numComponents : this.numComponents}
}

Attribute.prototype.createBuffer = function () {
  var type = window[this.bufferType];
  return new type(this.numComponents * this.elementsPerPoly * this.max);
}

Attribute.prototype.write = function(b, index){
  for(var i=0; i<b.length; i++){
    this.buffer[i+index] = b[i]
  }
  this.dirty = true
}

Attribute.prototype.clear = function(index, value) {
  var length = this.numComponents * this.elementsPerPoly
  for(var i=0; i<length; i++){
    this.buffer[i + index * length] = value
  }
  this.dirty = true
}

Attribute.prototype.refresh = function (gl, geometry) {
  // geometry.buffers[this.name].set(this.buffer, gl.DYNAMIC_DRAW)
  geometry.setBuffer(this.name, this.buffer, gl.DYNAMIC_DRAW)
  this.dirty = false
}

module.exports = Attribute