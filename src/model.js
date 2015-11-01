var util             = require('util'),
    SlotList         = require('./slotlist'),
    twgl             = require('../lib/twgl'),
    IndicesAttribute = require('./indices_attribute')

function Model(accommodator, shader, max) {
  this.dirty  = false;
  this.slots  = new SlotList(max);

  this.allocations        = {};
  this.uniforms           = {};
  this.attributes         = {};
  this.attributes.indices = this.indicesAttribute()

  this.geometry      = null;
  this.shader        = shader;
  this.textureData   = {};
  this.shaderOptions = {};
  this.removeItem    = Model.itemRemover(this)
  this.accommodator  = accommodator
  this.id = Model.nextId ++
}
Model.nextId = 1

Model.itemRemover = function (model) {
  var a = model.attributes;

  return function (affected) {
    model.accommodator.affected[model.id] = model
    for (var name in a) {
      a[name].clear(this.index, 0);
    }
    model.dirty = true;
    model.slots.decrement(this.index);
  }
}

Model.prototype.indicesAttribute = function () {
  return new IndicesAttribute.Quads(this.slots.max)
}

Model.prototype.addAttribute = function (name, numComponents, bufferType, fn) {
  var attr = this.attributes.indices.getAttribute(name, numComponents, bufferType, fn)
  this.attributes[name] = attr
  return attr
}

Model.prototype.getAttributeBuffers = function () {
  if (this.attributeBuffers) {
    return this.attributeBuffers;
  }

  var attrs =  {};
  Object.keys(this.attributes).forEach(function(name) {
    var attribute = this.attributes[name]
    attrs[name] = attribute.getBuffer();
  }.bind(this));

  return this.attributeBuffers = attrs;
}

Model.prototype.canAccommodate = function (item) {
  if (this.slots.vacancies() == 0) {
    return false
  }
  if (!item.allocations) return true;
  var keys = Object.keys(item.allocations)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (!this.allocations[key] || !this.allocations[key].canAccommodate(item.allocations[key])) {
      return false;
    }
  }
  return true;
}

Model.prototype.add = function (item) {
  var at    = this.attributes;
  var index = this.slots.current();

  var keys = Object.keys(at)
  for (var i = 0; i < keys.length; i++) {
    at[keys[i]].setElements(index, item)
  }

  this.dirty = true;
  item.index = this.slots.current();
  this.slots.increment();
  item.remove = this.removeItem
}

Model.prototype.isUnused = function () {
  return this.slots.count == 0
}

Model.prototype.remove = function () {
  var geom = this.geometry
  if (!geom) return
  geom.deleteBuffers();
  // for (var i in geom.buffers) {
  //   var buf = geom.buffers[i]
  //   gl.deleteBuffer(buf.buf)
  // }
}

Model.prototype.drawPrep = function (geom, more_uniforms) {
  var uniforms = {}

  for(var i in this.uniforms) {
    if (this.uniforms.hasOwnProperty(i))
      uniforms[i] = this.uniforms[i]
  }

  for(var i in more_uniforms) {
    if (more_uniforms.hasOwnProperty(i))
      uniforms[i] = more_uniforms[i]
  }

  geom.drawPrep(uniforms);
}

Model.prototype.getGeometry = function (gl) {
  if (this.geometry)
    return this.geometry;

  this.bufferInfo = this.bufferInfo || twgl.createBufferInfoFromArrays(gl, this.getAttributeBuffers());
  return this.geometry = {
    drawPrep : function (uniforms) {
      var programInfo = this.shader.getProgram(gl, uniforms)
      gl.useProgram(programInfo.program);
      twgl.setUniforms(programInfo, uniforms);
      this.render_uniforms = uniforms;
    }.bind(this),
    draw : function () {
      var programInfo = this.shader.getProgram(gl, this.render_uniforms)
      twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
      twgl.drawBufferInfo(gl, gl.TRIANGLES, this.bufferInfo);
    }.bind(this),
    setBuffer : function (name, buffer, mode) {
      if (name == 'indices') {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indices)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer, mode || gl.STATIC_DRAW)
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER,this.bufferInfo.attribs[name].buffer)
        gl.bufferData(gl.ARRAY_BUFFER, buffer, mode || gl.STATIC_DRAW)
      }
    }.bind(this),
    deleteBuffers : function () {
      gl.deleteBuffer(this.bufferInfo.indices)
      for (var i in this.bufferInfo.attribs) {
        var buf = this.bufferInfo.attribs[i]
        gl.deleteBuffer(buf.buffer)
      }
    }.bind(this)
  };
}

Model.prototype.refresh = function (gl) {
  var geom = this.getGeometry(gl);
  
  for (var name in this.attributes) {
    if (this.attributes.hasOwnProperty(name)) {
      var attribute = this.attributes[name]
      if (attribute.dirty)
        attribute.refresh(gl, geom);
    }
  }

  this.dirty = false;
}

Model.Triangles = function Triangles(accommodator, shader, max) {
  Model.call(this, accommodator, shader, max)
}
util.inherits(Model.Triangles, Model)

Model.Triangles.prototype.indicesAttribute = function () {
  return new IndicesAttribute.Triangles(this.slots.max)
}

Model.Geodesics = function Geodesics(accommodator, shader, max, subdivisions, individual_faces) {
  this.trisPerPoly = 20 * subdivisions * subdivisions
  this.individual_faces = individual_faces
  Model.call(this, accommodator, shader, max)
}
util.inherits(Model.Geodesics, Model)

Model.Geodesics.prototype.indicesAttribute = function () {
  return new IndicesAttribute.Geodesics(this.slots.max, this.trisPerPoly, this.individual_faces)
}

module.exports = Model