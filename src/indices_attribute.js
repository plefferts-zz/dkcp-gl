var util      = require('util'),
    Attribute = require('./attribute')

function IndicesAttribute(name, max, verticesPerPoly, trianglesPerPoly) {
  this.verticesPerPoly = verticesPerPoly

  Attribute.call(this, name, max, 3, trianglesPerPoly, 'Uint16Array', function (index, item) {
    var cpp = 3 * trianglesPerPoly
    this.write(this.indexCoords(index * this.verticesPerPoly, item), index * cpp);
  }.bind(this));

  this.invert = false;
}
util.inherits(IndicesAttribute, Attribute)

IndicesAttribute.prototype.getAttribute = function (name, numComponents, bufferType, fn) {
  var vpp = this.verticesPerPoly
  var attr = new Attribute(name, this.max, numComponents, vpp, bufferType, function(index, item) {
    for (var i = 0; i < vpp; i ++) {
      attr.write(fn(i, item), index * vpp * numComponents + i * numComponents);
    }
  }.bind(this))
  return attr
}

IndicesAttribute.Quads = function QuadIndices(max) {
  IndicesAttribute.call(this, 'indices', max, 4, 2)
}
util.inherits(IndicesAttribute.Quads, IndicesAttribute)

IndicesAttribute.Quads.prototype.indexCoords = function (c) {
  if (this.invert)
    return [c, c+1, c+3, c, c+3, c+2];
  return [c, c+3, c+1, c, c+2, c+3];
}

IndicesAttribute.Triangles = function TriangleIndices(max) {
  IndicesAttribute.call(this, 'indices', max, 3, 1)
}
util.inherits(IndicesAttribute.Triangles, IndicesAttribute)

IndicesAttribute.Triangles.prototype.indexCoords = function (c) {
  if (this.invert)
    return [c, c+1, c+2];
  return [c, c+2, c+1];
}

module.exports = IndicesAttribute

IndicesAttribute.Geodesics = function GeodesicIndices(max, trisPerPoly, individual_faces) {
  if (individual_faces) {
    IndicesAttribute.call(this, 'indices', max, trisPerPoly * 3, trisPerPoly)
  } else {
    IndicesAttribute.call(this, 'indices', max, trisPerPoly / 2 + 2, trisPerPoly)
  }
}
util.inherits(IndicesAttribute.Geodesics, IndicesAttribute)

IndicesAttribute.Geodesics.prototype.indexCoords = function (c, item) {
  var indices = []
  for (var i = 0; i < item.tris.length; i ++) {
    var tri = item.tris[i];
    if (this.invert) {
      indices.push(c + tri[0], c + tri[2], c + tri[1])
    } else {
      indices.push(c + tri[0], c + tri[1], c + tri[2])
    }
  }
  return indices
}

module.exports = IndicesAttribute