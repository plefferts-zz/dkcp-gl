require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({15:[function(require,module,exports){
var Screen           = require('./screen'),
    FrameRate        = require('./framerate'),
    camera           = require('./camera'),
    WasdKeyBinding   = require('./wasd_key_binding')


function DkcpGl(options) {
  this.screen = new Screen()
  
  if (options.frameRate) {
    var frameRate = FrameRate()
    var element = options.frameRate.element
    this.screen.on('frame', function (delta){
      frameRate(delta).log(options.frameRate.frequency || 120, function (rate) {
        var text = 'FPS: ' + Math.floor(rate * 100) / 100
        element.innerText = text
      });
    })
  }
  
  this.screen.init(options.canvas, options.init || function (gl) {
    return {
      enable : [gl.CULL_FACE, gl.DEPTH_TEST],
      cullFace : gl.BACK
    }
  })

  this.camera = new camera.BasicCamera(this.screen.width(), this.screen.height()).setFOV(60);

  if (options.wasd) {
    var kb = new WasdKeyBinding()
      .bindKeyEvents(options.wasd.document, false);

    var delta = options.wasd.delta || .05;
    var theta = options.wasd.theta || -Math.PI / 120;
    this.screen.on('frame', function (elapsed) {
      var f = elapsed / 1000 * 60;
      var actions = kb.getActions();
      if (actions.length) {
        kb.applyActions(this.camera, actions, delta * f, theta * f)
        this.screen.beginFrameRendering(false)
      }
    }.bind(this))
  }


}

DkcpGl.Screen            = Screen
DkcpGl.FrameRate         = FrameRate
DkcpGl.camera            = camera
DkcpGl.WasdKeyBinding    = WasdKeyBinding

DkcpGl.Allocation        = require('./allocation')
DkcpGl.Attribute         = require('./attribute')
DkcpGl.Environment       = require('./environment')
DkcpGl.IndicesAttribute  = require('./indices_attribute')
DkcpGl.Model             = require('./model')
DkcpGl.Plate             = require('./plate')
DkcpGl.Renderable        = require('./renderable')
DkcpGl.RenderSet         = require('./render_set')
DkcpGl.Shader            = require('./shader')
DkcpGl.shaders           = require('./shaders')
DkcpGl.Texture           = require('./texture')
DkcpGl.Transform         = require('./transform')
DkcpGl.geodesic          = require('./geodesic')

module.exports = DkcpGl
},{"./allocation":12,"./attribute":13,"./camera":14,"./environment":16,"./framerate":17,"./geodesic":18,"./indices_attribute":19,"./model":20,"./plate":22,"./render_set":23,"./renderable":24,"./screen":25,"./shader":26,"./shaders":27,"./texture":29,"./transform":30,"./wasd_key_binding":31}],31:[function(require,module,exports){
var eventify = require('eventify')

var WasdKeyBinding = function () {

  this.isDown = {}
  this.mapping = {
    '69': 'moveByY',
    '87': 'moveByNegZ',
    '65': 'moveByNegX',
    '68': 'moveByX',
    '83': 'moveByZ',
    '67': 'moveByNegY',
    '37': 'rotateByY',
    '38': 'rotateByX',
    '39': 'rotateByNegY',
    '40': 'rotateByNegX'
  }
}

WasdKeyBinding.prototype.getActions = function () {
  var actions = [];
  for(var k in this.mapping) {
    if (this.isDown[k]) {
      actions.push(this.mapping[k]);
    }
  }
  return actions;
}

WasdKeyBinding.prototype.bindKeyEvents = function(document, triggerEvents) {
  var me = this;
  var timeout;
  
  eventify.enable(this)
  document.addEventListener('keydown', function(e){
    if(e.keyCode >= 37 && e.keyCode <= 40)
      e.preventDefault();
    
    
    if((e.keyCode >= 37 && e.keyCode <= 40)
      || (e.keyCode >= 65 && e.keyCode <= 90)){
        var wasDown = me.isDown[e.keyCode];
        me.isDown[e.keyCode] = true;
      
      if (triggerEvents && !wasDown) {
        clearInterval(timeout);
        timeout = setInterval(function () {
          var actions = me.getActions();
          if (actions.length) {
            me.trigger('repeat', {actions: actions});
          }
        }, 50);
      }
      
    }
  });
  
  document.addEventListener('keyup', function(e){
    if(e.keyCode >= 37 && e.keyCode <= 40)
      e.preventDefault();
    if((e.keyCode >= 37 && e.keyCode <= 40)
      || (e.keyCode >= 65 && e.keyCode <= 90)){
        me.isDown[e.keyCode] = false;
    }
  });
  
  return this
}

WasdKeyBinding.prototype.applyActions = function (camera, actions, delta, theta) {
  for (var i in actions) {
    camera[actions[i]](delta, theta, -camera.getRotateY());
  }
}

module.exports = WasdKeyBinding
},{"eventify":10}],29:[function(require,module,exports){
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
},{"../lib/twgl":5,"util":9}],27:[function(require,module,exports){


module.exports.color = function (color) {
  var c = [];
  for (var i=0; i<4; i++) {
    c.push((color[i] || (i == 3 ? 1 : 0)).toFixed(2) + '');
  }
  return (
    'vec4(' + c.join(',') + ')'
  );
  
}
},{}],26:[function(require,module,exports){
var twgl = require('../lib/twgl')

function Shader (getVertexBodySource, getFragmentBodySource){
  this.getVertexBodySource   = getVertexBodySource
  this.getFragmentBodySource = getFragmentBodySource
  
  this.program         = false
  this.vertex_header   = '';
  this.fragment_header =
      '#ifdef GL_ES\n' +
      '  precision mediump float;\n' +
      '#endif\n';

  this.vertex_uniforms   = {}
  this.fragment_uniforms = {}
  this.varyings          = {}
  this.attributes        = {}
}

Shader.prototype.getVertexSource = function () {
  var src = this.vertex_header;
  for (uniform in this.vertex_uniforms) {
    src += 'uniform ' +  this.vertex_uniforms[uniform] + ' ' + uniform + ';\n';
  }
  for (attribute in this.attributes) {
    src += 'attribute ' +  this.attributes[attribute] + ' ' + attribute + ';\n';
  }
  for (varying in this.varyings) {
    src += 'varying ' +  this.varyings[varying] + ' ' + varying + ';\n';
  }
  src += '\n' +
    'void main() {\n' +
      this.getVertexBodySource() +
    '}\n';
  return src;
}

Shader.prototype.getFragmentSource = function () {
  var src = this.fragment_header;
  for (uniform in this.fragment_uniforms) {
    src += 'uniform ' +  this.fragment_uniforms[uniform] + ' ' + uniform + ';\n';
  }
  for (varying in this.varyings) {
    src += 'varying ' +  this.varyings[varying] + ' ' + varying + ';\n';
  }
  src += 'void main() {\n' +
    this.getFragmentBodySource() +
  '}\n';
  return src;
}

Shader.prototype.getProgram = function (gl) {
  if (this.program)
    return this.program
  // console.log(this.getVertexSource(), this.getFragmentSource())
  return this.program = twgl.createProgramInfo(
    gl,
    [this.getVertexSource(), this.getFragmentSource()]
  )
}

module.exports = Shader
},{"../lib/twgl":5}],25:[function(require,module,exports){
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
},{"../lib/twgl":5,"./render_set":23,"eventify":10,"util":9}],22:[function(require,module,exports){
var util  = require('util')
var Model = require('./model')
var IndicesAttribute  = require('./indices_attribute')

function Plate(shader){
  var accommodator = {affected: {}};
  Model.call(this, accommodator, shader, 1);
  
  var vertices = [
    [-1, -1],
    [-1,  1],
    [ 1, -1],
    [ 1,  1]
  ];
  
  this.addAttribute('position', 4, 'Float32Array', function (i, item) {
    vertices[i][2] = item.z
    vertices[i][3] = 1
    return vertices[i]
  });
  
}
util.inherits(Plate, Model)


module.exports = Plate
},{"./indices_attribute":19,"./model":20,"util":9}],20:[function(require,module,exports){
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

Model.prototype.drawPrep = function (geom, uniforms) {
  for(var i in uniforms) {
    if (uniforms.hasOwnProperty(i))
      this.uniforms[i] = uniforms[i]
  }
  geom.drawPrep(this.uniforms);
}

Model.prototype.getGeometry = function (gl) {
  if (this.geometry)
    return this.geometry;

  this.bufferInfo = this.bufferInfo || twgl.createBufferInfoFromArrays(gl, this.getAttributeBuffers());
  return this.geometry = {
    drawPrep : function (uniforms) {
      var programInfo = this.shader.getProgram(gl)
      gl.useProgram(programInfo.program);
      twgl.setUniforms(programInfo, uniforms);
    }.bind(this),
    draw : function () {
      var programInfo = this.shader.getProgram(gl)
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

Model.Geodesics = function Geodesics(accommodator, shader, max, subdivisions) {
  this.trisPerPoly = 20 * subdivisions * subdivisions
  Model.call(this, accommodator, shader, max)
}
util.inherits(Model.Geodesics, Model)

Model.Geodesics.prototype.indicesAttribute = function () {
  return new IndicesAttribute.Geodesics(this.slots.max, this.trisPerPoly)
}

module.exports = Model
},{"../lib/twgl":5,"./indices_attribute":19,"./slotlist":28,"util":9}],19:[function(require,module,exports){
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

IndicesAttribute.Geodesics = function GeodesicIndices(max, trisPerPoly) {
  IndicesAttribute.call(this, 'indices', max, trisPerPoly / 2 + 2, trisPerPoly)
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
},{"./attribute":13,"util":9}],18:[function(require,module,exports){
var qs  = require('../lib/quaternions')

window.points = {}
function Point(p){
  this.p = p
  this.id = Point._nextId ++

  this.lines = []
  this.tris = []
  window.points[this.id] = this
}
Point._nextId = 1

Point.prototype.copy = function (hedron) {
  if (hedron.points[this.id]) return this
  if (!hedron.points[this.id + "'"]) {
    var p = new Point()
    p.p = this.p
    hedron.points[this.id + "'"] = p
    hedron.points[p.id] = p
  }
  return hedron.points[this.id + "'"]
}

Point.prototype.getCoords = function () {
  function normalize(x, y, z, w2) {
    var w = Math.sqrt(x * x + y * y + z * z)
    return [x / w * w2, y / w * w2, z / w * w2]
  }
  var p = qs.normalize(this.p)

  var w = Math.PI * 2
  var h = Math.PI

  var u = (((Math.atan2(p[2], p[0]) / Math.PI / 2) % 1 + 1) % 1) * w 
  var v = Math.asin(p[1]) / Math.PI * h

  var x = Math.cos(u) * Math.cos(v)
  var y = Math.sin(v)
  var z = Math.sin(u) * Math.cos(v)

  return normalize(x, y, z, 2)
}

function Line(counts, a, b) {
  this.a = a
  this.b = b

  this.tris = []
  this.id = Line._nextId ++
  if (counts) {
    this.a.lines.push(this)
    this.b.lines.push(this)
  }
}
Line._nextId = 1

Line.idForPoints = function (p0, p1) {
  if (p1.id > p0.id) return p0.id + '-' + p1.id
  return p1.id + '-' + p0.id
}

Line.prototype.point = function (hedron, percent) {
  if (percent == 0) return this.a.copy(hedron)
  if (percent == 1) return this.b.copy(hedron)
  
  var perc = Math.round(percent * 1000000)
  var id = this.id + '@' + perc
  if (!hedron.points[id]) {
    var p = qs.slerp(this.a.p, this.b.p, percent)
    // console.log(Point._nextId, id)
    hedron.points[id] = new Point(p)
  }
  return hedron.points[id]
}

function Tri (name, a, b, c) {
  this.lines = [a, b, c]
  this.id = Tri._nextId ++
  this.name = name

  this.lines.forEach(function (line) {
    line.tris.push(this)
    line.a.tris.push(this)
    line.b.tris.push(this)
  }.bind(this))
  
  this.points = []
  this.points.push(a.a)
  this.points.push(a.b)
  this.points.push(b.a != a.a && b.a != a.b ? b.a : b.b)
}
Tri._nextId = 1

function Hedron(tris) {
  this.tris   = tris
  this.splits = {}
  this.points = {}
  this.linesByPoints = {}
  this._nextTri = 1
}

Hedron.prototype.line = function (p0, p1, counts, please) {
  if (counts !== false) counts = true
  
  var id = Line.idForPoints(p0, p1)
  if (!this.linesByPoints[id]) {
    this.linesByPoints[id] = new Line(counts, p0, p1)
  } else if (please) {
    if (p0.id != this.linesByPoints[id].a.id)
      console.log('<>', p0.id, this.linesByPoints[id].a.id)
  }
  return this.linesByPoints[id]
}

Hedron.prototype.tri = function (l0, l1, l2) {
  return new Tri(this._nextTri ++, l0, l1, l2)
}

Hedron.prototype.getGeometry = function () {
  var tris        = []
  var points      = []
  var points_done = {}
  
  for (var i = 0; i < this.tris.length; i ++) {
    var tri_points = this.tris[i].points
    var geom_points = []
    for (var j in tri_points) {
      var point = tri_points[j]
      if (!(point.id in points_done)) {
        points.push(point.getCoords())
        points_done[point.id] = points.length - 1
      }
      geom_points.push(points_done[point.id])
    }
    tris.push(geom_points)
  }
  return {points : points, tris: tris};
}



function build_icos() {

  var mh = Math.atan2(Math.sqrt(5) / 5, 2 * Math.sqrt(5) / 5) / Math.PI * 180;

  function point(u, v) {
    u = u / 180 * Math.PI
    v = v / 180 * Math.PI

    var x = Math.cos(u) * Math.cos(v)
    var y = -Math.sin(v)
    var z = Math.sin(u) * Math.cos(v)

    return new Point(qs.normalize([x, y, z, 0]))
  }

  var points = []
  points.push(point(180, -90))
  for (var i = 0; i < 5; i ++) {
    points.push(point(360 / 5 * i, -mh))
    points.push(point(360 / 5 * i + 360 / 10, mh))
  }
  points.push(point(180, 90))

  var hedron = new Hedron([])

  var lines = {}
  function line(name, gen, a, b) {
    lines[name] = hedron.line(a, b)
  }

  var top    = 1;
  var bottom = 2;

  for (var i = 0; i < 5; i ++) {
    line(i + ':' + 0, 1, points[0],              points[top + 2 * i])
    line(i + ':' + 1, 1, points[top    + 2 * i], points[top    + 2 * ((i + 1) % 5)])
    line(i + ':' + 2, 1, points[top    + 2 * i], points[bottom + 2 * ((i + 0) % 5)])
    line(i + ':' + 3, 1, points[bottom + 2 * i], points[top    + 2 * ((i + 1) % 5)])
    line(i + ':' + 4, 1, points[bottom + 2 * i], points[bottom + 2 * ((i + 1) % 5)])
    line(i + ':' + 5, 1, points[11],             points[bottom + 2 * i])
  }

  var tris1 = [], tris2 = [], tris3 = [], tris4 = []
  for (var i = 0; i < 5; i ++) {
    var next_i = (i + 1) % 5
    tris1.push(hedron.tri(lines[i + ':' + 0],      lines[i + ':' + 1],      lines[next_i + ':' + 0]))
    tris2.push(hedron.tri(lines[i + ':' + 2],      lines[i + ':' + 3],      lines[i + ':' + 1]))
    tris3.push(hedron.tri(lines[i + ':' + 4],      lines[next_i + ':' + 2], lines[i + ':' + 3]))
    tris4.push(hedron.tri(lines[next_i + ':' + 5], lines[i + ':' + 4],      lines[i + ':' + 5]))
  }

  hedron.tris.push.apply(hedron.tris, tris1.concat(tris2).concat(tris3).concat(tris4))

  return hedron
}

function subdivide(n, hedron) {
  var newHedron = new Hedron([])
  var tri = null

  function point(x, y) {
    if (y < 0) return tri.points[0].copy(hedron)
    if (x == 0) {
      return tri.lines[0].point(hedron, (y + 1)/ n)
    }

    if (x == y + 1) {
      return tri.lines[2].point(hedron, (y + 1)/ n)
    }

    if (y + 1 < n) {
      var p0 = tri.lines[0].point(hedron, (y + 1) / n)
      var p1 = tri.lines[2].point(hedron, (y + 1) / n)
      if (tri.lines[0].a != tri.lines[2].a)
        throw up
      var line = hedron.line(p0, p1, false, true)
      return line.point(hedron, x / (y + 1))
    } else {
      var line = tri.lines[1]
      if (tri.lines[1].a == tri.lines[0].b)
        return line.point(hedron, x / (y + 1))
      return line.point(hedron, 1 - x / (y + 1))
    }
  
  }

  function downhill(x, y, please) {
    return hedron.line(point(x, y - 1), point(x, y), true, please)
  }

  function uphill(x, y, please) {
    return hedron.line(point(x, y - 1), point(x + 1, y), true, please)
  }

  function floor(x, y, please) {
    return hedron.line(point(x, y), point(x + 1, y), true, please)
  }

  for (var i = 0; i < hedron.tris.length; i ++) {
    tri = hedron.tris[i]
    var rowLength = 1
    for (var y = 0; y < n; y ++) {
      for (var x = 0; x < rowLength; x ++) {
        var l0, l1, l2;
        var x2 = Math.floor(x / 2)
        if (x % 2 == 0) {
          l0 = downhill(x2, y, true)
          l1 = floor(x2, y)
          l2 = uphill(x2, y)
        } else {
          l0 = uphill(x2, y, true)
          l1 = floor(x2, y - 1)
          l2 = downhill(x2 + 1, y)
        }
        newHedron.tris.push(newHedron.tri(l0, l1, l2))
      }
      rowLength += 2
    }
  }

  return newHedron
}

var base;
var cache = {}
module.exports =  function (subdivisions) {
  base = base || build_icos()
  return cache[subdivisions] || (cache[subdivisions] = subdivide(subdivisions, base))
}


},{"../lib/quaternions":3}],3:[function(require,module,exports){
/*
 * Copyright 2009, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview This file contains various functions for quaternion arithmetic
 * and converting between rotation matrices and quaternions.  It adds them to
 * the "quaternions" module on the main object.  Javascript arrays with
 * four entries are used to represent quaternions, and functions are provided
 * for doing operations on those.
 *
 * Operations are done assuming quaternions are of the form:
 * `q[0] + q[1]i + q[2]j + q[3]k` and using the hamiltonian
 * rules for multiplication as described on Brougham Bridge:
 * `i^2 = j^2 = k^2 = ijk = -1`.
 *
 */

var main = {}

/**
 * A Module for quaternion math.
 * @namespace
 */
main.quaternions = main.quaternions || {};
module.exports  = main.quaternions;

module.exports.distance = require('./slerp').distance
module.exports.slerp    = require('./slerp').slerp

/**
 * A Quaternion.
 * @typedef {number[]} main.quaternions.Quaternion
 */

/**
 * Quickly determines if the object a is a scalar or a quaternion;
 * assumes that the argument is either a number (scalar), or an array of
 * numbers.
 * @param {(number|main.quaternions.Quaternion)} a A number or array the type
 *     of which is in question.
 * @return {string} Either the string 'Scalar' or 'Quaternion'.
 */
main.quaternions.mathType = function(a) {
  if (typeof(a) === 'number')
    return 'Scalar';
  return 'Quaternion';
};

/**
 * Creates an identity quaternion.
 * @return {main.quaternions.Quaternion} The identity quaternion.
 */
main.quaternions.identity = function() {
  return [ 0, 0, 0, 1 ];
};

/**
 * Copies a quaternion.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @return {main.quaternions.Quaternion} A new quaternion identical to q.
 */
main.quaternions.copy = function(q) {
  return q.slice();
};

/**
 * Negates a quaternion.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @return {main.quaternions.Quaternion} -q.
 */
main.quaternions.negative = function(q) {
  return [-q[0], -q[1], -q[2], -q[3]];
};

/**
 * Adds two Quaternions.
 * @param {main.quaternions.Quaternion} a Operand Quaternion.
 * @param {main.quaternions.Quaternion} b Operand Quaternion.
 * @return {main.quaternions.Quaternion} The sum of a and b.
 */
main.quaternions.addQuaternionQuaternion = function(a, b) {
  return [a[0] + b[0],
          a[1] + b[1],
          a[2] + b[2],
          a[3] + b[3]];
};

/**
 * Adds a quaternion to a scalar.
 * @param {main.quaternions.Quaternion} a Operand Quaternion.
 * @param {number} b Operand Scalar.
 * @return {main.quaternions.Quaternion} The sum of a and b.
 */
main.quaternions.addQuaternionScalar = function(a, b) {
  return a.slice(0, 3).concat(a[3] + b);
};

/**
 * Adds a scalar to a quaternion.
 * @param {number} a Operand scalar.
 * @param {main.quaternions.Quaternion} b Operand quaternion.
 * @return {main.quaternions.Quaternion} The sum of a and b.
 */
main.quaternions.addScalarQuaternion = function(a, b) {
  return b.slice(0, 3).concat(a + b[3]);
};

/**
 * Subtracts two quaternions.
 * @param {main.quaternions.Quaternion} a Operand quaternion.
 * @param {main.quaternions.Quaternion} b Operand quaternion.
 * @return {main.quaternions.Quaternion} The difference a - b.
 */
main.quaternions.subQuaternionQuaternion = function(a, b) {
  return [a[0] - b[0],
          a[1] - b[1],
          a[2] - b[2],
          a[3] - b[3]];
};

/**
 * Subtracts a scalar from a quaternion.
 * @param {main.quaternions.Quaternion} a Operand quaternion.
 * @param {number} b Operand scalar.
 * @return {main.quaternions.Quaternion} The difference a - b.
 */
main.quaternions.subQuaternionScalar = function(a, b) {
  return a.slice(0, 3).concat(a[3] - b);
};

/**
 * Subtracts a quaternion from a scalar.
 * @param {number} a Operand scalar.
 * @param {main.quaternions.Quaternion} b Operand quaternion.
 * @return {main.quaternions.Quaternion} The difference a - b.
 */
main.quaternions.subScalarQuaternion = function(a, b) {
  return [-b[0], -b[1], -b[2], a - b[3]];
};

/**
 * Multiplies a scalar by a quaternion.
 * @param {number} k The scalar.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @return {main.quaternions.Quaternion} The product of k and q.
 */
main.quaternions.mulScalarQuaternion = function(k, q) {
  return [k * q[0], k * q[1], k * q[2], k * q[3]];
};

/**
 * Multiplies a quaternion by a scalar.
 * @param {main.quaternions.Quaternion} q The Quaternion.
 * @param {number} k The scalar.
 * @return {main.quaternions.Quaternion} The product of k and v.
 */
main.quaternions.mulQuaternionScalar = function(q, k) {
  return [k * q[0], k * q[1], k * q[2], k * q[3]];
};

/**
 * Multiplies two quaternions.
 * @param {main.quaternions.Quaternion} a Operand quaternion.
 * @param {main.quaternions.Quaternion} b Operand quaternion.
 * @return {main.quaternions.Quaternion} The quaternion product a * b.
 */
main.quaternions.mulQuaternionQuaternion = function(a, b) {
  var aX = a[0];
  var aY = a[1];
  var aZ = a[2];
  var aW = a[3];
  var bX = b[0];
  var bY = b[1];
  var bZ = b[2];
  var bW = b[3];

  return [
      aW * bX + aX * bW + aY * bZ - aZ * bY,
      aW * bY + aY * bW + aZ * bX - aX * bZ,
      aW * bZ + aZ * bW + aX * bY - aY * bX,
      aW * bW - aX * bX - aY * bY - aZ * bZ];
};

/**
 * Divides two quaternions; assumes the convention that a/b = a*(1/b).
 * @param {main.quaternions.Quaternion} a Operand quaternion.
 * @param {main.quaternions.Quaternion} b Operand quaternion.
 * @return {main.quaternions.Quaternion} The quaternion quotient a / b.
 */
main.quaternions.divQuaternionQuaternion = function(a, b) {
  var aX = a[0];
  var aY = a[1];
  var aZ = a[2];
  var aW = a[3];
  var bX = b[0];
  var bY = b[1];
  var bZ = b[2];
  var bW = b[3];

  var d = 1 / (bW * bW + bX * bX + bY * bY + bZ * bZ);
  return [
      (aX * bW - aW * bX - aY * bZ + aZ * bY) * d,
      (aX * bZ - aW * bY + aY * bW - aZ * bX) * d,
      (aY * bX + aZ * bW - aW * bZ - aX * bY) * d,
      (aW * bW + aX * bX + aY * bY + aZ * bZ) * d];
};

/**
 * Divides a Quaternion by a scalar.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @param {number} k The scalar.
 * @return {main.quaternions.Quaternion} q The quaternion q divided by k.
 */
main.quaternions.divQuaternionScalar = function(q, k) {
  return [q[0] / k, q[1] / k, q[2] / k, q[3] / k];
};

/**
 * Divides a scalar by a quaternion.
 * @param {number} a Operand scalar.
 * @param {main.quaternions.Quaternion} b Operand quaternion.
 * @return {main.quaternions.Quaternion} The quaternion product.
 */
main.quaternions.divScalarQuaternion = function(a, b) {
  var b0 = b[0];
  var b1 = b[1];
  var b2 = b[2];
  var b3 = b[3];

  var d = 1 / (b0 * b0 + b1 * b1 + b2 * b2 + b3 * b3);
  return [-a * b0 * d, -a * b1 * d, -a * b2 * d, a * b3 * d];
};

/**
 * Computes the multiplicative inverse of a quaternion.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @return {main.quaternions.Quaternion} The multiplicative inverse of q.
 */
main.quaternions.inverse = function(q) {
  var q0 = q[0];
  var q1 = q[1];
  var q2 = q[2];
  var q3 = q[3];

  var d = 1 / (q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3);
  return [-q0 * d, -q1 * d, -q2 * d, q3 * d];
};

/**
 * Multiplies two objects which are either scalars or quaternions.
 * @param {(main.quaternions.Quaternion|number)} a Operand.
 * @param {(main.quaternions.Quaternion|number)} b Operand.
 * @return {(main.quaternions.Quaternion|number)} The product of a and b.
 */
main.quaternions.mul = function(a, b) {
  return main.quaternions['mul' + main.quaternions.mathType(a) +
      main.quaternions.mathType(b)](a, b);
};

/**
 * Divides two objects which are either scalars or quaternions.
 * @param {(main.quaternions.Quaternion|number)} a Operand.
 * @param {(main.quaternions.Quaternion|number)} b Operand.
 * @return {(main.quaternions.Quaternion|number)} The quotient of a and b.
 */
main.quaternions.div = function(a, b) {
  return main.quaternions['div' + main.quaternions.mathType(a) +
      main.quaternions.mathType(b)](a, b);
};

/**
 * Adds two objects which are either scalars or quaternions.
 * @param {(main.quaternions.Quaternion|number)} a Operand.
 * @param {(main.quaternions.Quaternion|number)} b Operand.
 * @return {(main.quaternions.Quaternion|number)} The sum of a and b.
 */
main.quaternions.add = function(a, b) {
  return main.quaternions['add' + main.quaternions.mathType(a) +
      main.quaternions.mathType(b)](a, b);
};

/**
 * Subtracts two objects which are either scalars or quaternions.
 * @param {(main.quaternions.Quaternion|number)} a Operand.
 * @param {(main.quaternions.Quaternion|number)} b Operand.
 * @return {(main.quaternions.Quaternion|number)} The difference of a and b.
 */
main.quaternions.sub = function(a, b) {
  return main.quaternions['sub' + main.quaternions.mathType(a) +
      main.quaternions.mathType(b)](a, b);
};

/**
 * Computes the length of a Quaternion, i.e. the square root of the
 * sum of the squares of the coefficients.
 * @param {main.quaternions.Quaternion} a The Quaternion.
 * @return {number} The length of a.
 */
main.quaternions.length = function(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
};

/**
 * Computes the square of the length of a quaternion, i.e. the sum of the
 * squares of the coefficients.
 * @param {main.quaternions.Quaternion} a The quaternion.
 * @return {number} The square of the length of a.
 */
main.quaternions.lengthSquared = function(a) {
  return a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
};

/**
 * Divides a Quaternion by its length and returns the quotient.
 * @param {main.quaternions.Quaternion} a The Quaternion.
 * @return {main.quaternions.Quaternion} A unit length quaternion pointing in
 *     the same direction as a.
 */
main.quaternions.normalize = function(a) {
  var d = 1 / Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
  return [a[0] * d, a[1] * d, a[2] * d, a[3] * d];
};

/**
 * Computes the conjugate of the given quaternion.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @return {main.quaternions.Quaternion} The conjugate of q.
 */
main.quaternions.conjugate = function(q) {
  return [-q[0], -q[1], -q[2], q[3]];
};


/**
 * Creates a quaternion which rotates around the x-axis by the given angle.
 * @param {number} angle The angle by which to rotate (in radians).
 * @return {main.quaternions.Quaternion} The quaternion.
 */
main.quaternions.rotationX = function(angle) {
  return [Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)];
};

/**
 * Creates a quaternion which rotates around the y-axis by the given angle.
 * @param {number} angle The angle by which to rotate (in radians).
 * @return {main.quaternions.Quaternion} The quaternion.
 */
main.quaternions.rotationY = function(angle) {
  return [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
};

/**
 * Creates a quaternion which rotates around the z-axis by the given angle.
 * @param {number} angle The angle by which to rotate (in radians).
 * @return {main.quaternions.Quaternion} The quaternion.
 */
main.quaternions.rotationZ = function(angle) {
  return [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)];
};

/**
 * Creates a quaternion which rotates around the given axis by the given
 * angle.
 * @param {main.math.Vector3} axis The axis about which to rotate.
 * @param {number} angle The angle by which to rotate (in radians).
 * @return {main.quaternions.Quaternion} A quaternion which rotates angle
 *     radians around the axis.
 */
main.quaternions.axisRotation = function(axis, angle) {
  var d = 1 / Math.sqrt(axis[0] * axis[0] +
                        axis[1] * axis[1] +
                        axis[2] * axis[2]);
  var sin = Math.sin(angle / 2);
  var cos = Math.cos(angle / 2);
  return [sin * axis[0] * d, sin * axis[1] * d, sin * axis[2] * d, cos];
};

/**
 * Computes a 4-by-4 rotation matrix (with trivial translation component)
 * given a quaternion.  We assume the convention that to rotate a vector v by
 * a quaternion r means to express that vector as a quaternion q by letting
 * `q = [v[0], v[1], v[2], 0]` and then obtain the rotated
 * vector by evaluating the expression `(r * q) / r`.
 * @param {main.quaternions.Quaternion} q The quaternion.
 * @return {main.math.Matrix4} A 4-by-4 rotation matrix.
 */
main.quaternions.quaternionToRotation = function(q) {
  var qX = q[0];
  var qY = q[1];
  var qZ = q[2];
  var qW = q[3];

  var qWqW = qW * qW;
  var qWqX = qW * qX;
  var qWqY = qW * qY;
  var qWqZ = qW * qZ;
  var qXqW = qX * qW;
  var qXqX = qX * qX;
  var qXqY = qX * qY;
  var qXqZ = qX * qZ;
  var qYqW = qY * qW;
  var qYqX = qY * qX;
  var qYqY = qY * qY;
  var qYqZ = qY * qZ;
  var qZqW = qZ * qW;
  var qZqX = qZ * qX;
  var qZqY = qZ * qY;
  var qZqZ = qZ * qZ;

  var d = qWqW + qXqX + qYqY + qZqZ;

  return [
    (qWqW + qXqX - qYqY - qZqZ) / d,
     2 * (qWqZ + qXqY) / d,
     2 * (qXqZ - qWqY) / d, 0,

     2 * (qXqY - qWqZ) / d,
     (qWqW - qXqX + qYqY - qZqZ) / d,
     2 * (qWqX + qYqZ) / d, 0,

     2 * (qWqY + qXqZ) / d,
     2 * (qYqZ - qWqX) / d,
     (qWqW - qXqX - qYqY + qZqZ) / d, 0,

     0, 0, 0, 1];
};

/**
 * Computes a quaternion whose rotation is equivalent to the given matrix.
 * @param {(main.math.Matrix4|main.math.Matrix3)} m A 3-by-3 or 4-by-4
 *     rotation matrix.
 * @return {main.quaternions.Quaternion} A quaternion q such that
 *     quaternions.quaternionToRotation(q) is m.
 */
main.quaternions.rotationToQuaternion = function(m) {
  var u;
  var v;
  var w;

  // Choose u, v, and w such that u is the index of the biggest diagonal entry
  // of m, and u v w is an even permutation of 0 1 and 2.
  if (m[0*4+0] > m[1*4+1] && m[0*4+0] > m[2*4+2]) {
    u = 0;
    v = 1;
    w = 2;
  } else if (m[1*4+1] > m[0*4+0] && m[1*4+1] > m[2*4+2]) {
    u = 1;
    v = 2;
    w = 0;
  } else {
    u = 2;
    v = 0;
    w = 1;
  }

  var r = Math.sqrt(1 + m[u*4+u] - m[v*4+v] - m[w*4+w]);
  var q = [];
  q[u] = 0.5 * r;
  q[v] = 0.5 * (m[v*4+u] + m[u*4+v]) / r;
  q[w] = 0.5 * (m[u*4+w] + m[w*4+u]) / r;
  q[3] = 0.5 * (m[v*4+w] - m[w*4+v]) / r;

  return q;
};


},{"./slerp":4}],4:[function(require,module,exports){
module.exports.distance = function (qa, qb) {
  var cosHalfTheta = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
  return Math.acos(2 * (cosHalfTheta * cosHalfTheta) - 1)
}

// https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
module.exports.slerp = function ( qa, qb, t, absolute) {

  if (!absolute) {
    if (t === 0 ) return [qa[0], qa[1], qa[2], qa[3]];
    if (t === 1 ) return [qb[0], qb[1], qb[2], qb[3]];
  }

  // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

  var cosHalfTheta = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];

  var _qa = qa
  qa = [qa[0], qa[1], qa[2], qa[3]]
  
  if ( cosHalfTheta < 0 ) {

    qa[0] = -qb[0];
    qa[1] = -qb[1];
    qa[2] = -qb[2];
    qa[3] = -qb[3];

    cosHalfTheta = -cosHalfTheta;

  } else {
    
    qa[0] = qb[0];
    qa[1] = qb[1];
    qa[2] = qb[2];
    qa[3] = qb[3];

  }

  if ( cosHalfTheta >= 1.0 ) {

    qa[0] = _qa[0];
    qa[1] = _qa[1];
    qa[2] = _qa[2];
    qa[3] = _qa[3];

    return qa;

  }

  var halfTheta = Math.acos( cosHalfTheta );
  var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

  if ( Math.abs( sinHalfTheta ) < 0.001 ) {

    qa[0] = 0.5 * ( _qa[0] + qa[0] );
    qa[1] = 0.5 * ( _qa[1] + qa[1] );
    qa[2] = 0.5 * ( _qa[2] + qa[2] );
    qa[3] = 0.5 * ( _qa[3] + qa[3] );

    return qa;

  }
  
  if (absolute) {
    var theta = Math.acos(2 * (cosHalfTheta * cosHalfTheta) - 1)
    t = t / theta
    if (t === 0 ) return [qa[0], qa[1], qa[2], qa[3]];
    if (t === 1 ) return [qb[0], qb[1], qb[2], qb[3]];
  }

  var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
  ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

  qa[0] = ( _qa[0] * ratioA + qa[0] * ratioB );
  qa[1] = ( _qa[1] * ratioA + qa[1] * ratioB );
  qa[2] = ( _qa[2] * ratioA + qa[2] * ratioB );
  qa[3] = ( _qa[3] * ratioA + qa[3] * ratioB );

  return qa;
}

},{}],17:[function(require,module,exports){
module.exports = function() {
  var j = 0;
  var frames = 1000/60;
  var rate = 0;
  var o = {
    log : function(frequency, log) {
      if(j % frequency == 0) {
        log ? log(rate) : console.log(rate);
      }
    }
  };
  return function(delta){
    j ++;
    frames += (delta - frames)/100;
    rate = 1000/frames;
    return o;
  }
}

},{}],16:[function(require,module,exports){
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
},{"./camera":14,"./render_set":23,"util":9}],23:[function(require,module,exports){
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
    this.renderables[i].render(gl);
  }
}


module.exports = RenderSet
},{"./renderable":24}],24:[function(require,module,exports){
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
},{"./accommodator":11,"util":9}],11:[function(require,module,exports){

function Accomodator(factory, maxRooms) {
  this.rooms    = []
  this.factory  = factory
  this.maxRooms = maxRooms
  this.affected = {}
}

Accomodator.prototype.add = function (guest) {
  this.getRoom(guest).add(guest)
  return guest
}

Accomodator.prototype.removeUnused = function () {
  for (var i in this.affected) {
    var room = this.affected[i]
    if (room.isUnused()) {
      room.remove()
      for (var j = this.rooms.length - 1; j >= 0; j --) {
        if (this.rooms[j] == room) {
          this.rooms.splice(j, 1)
        }
      }
    }
  }
  this.affected = {}
}

Accomodator.prototype.getRoom = function (guest) {
  var room, rooms = this.rooms
  for (var i=0; i<rooms.length; i++) {
    if (rooms[i].canAccommodate(guest)) {
      room = rooms[i]
      break
    }
  }

  if (!room) {
    if (rooms.length >= this.maxRooms) {
      throw 'Too many rooms'
    }
    console.log('new room, ', rooms.length + 1, ' total')
    rooms.unshift(room = this.factory())
    if (!room.canAccommodate(guest)) {
      throw new Error('unable to accommodate', guest)
    }
  }
  return room
}

module.exports = Accomodator
},{}],14:[function(require,module,exports){
var util      = require('util')
var m4        = require('../lib/twgl').m4
var v3        = require('../lib/twgl').v3
var Transform = require('./transform')

function degToRad(a) {
  return a / 180 * Math.PI
}

function UnriggedCamera(frameWidth, frameHeight, near, far) {
  this.frameWidth = frameWidth || 500;
  this.frameHeight = frameHeight || this.frameWidth;
  this.near = near || .1;
  this.far = far || 4096;
  this.perspective = new Float32Array(16);
  this.setFOV();

  this.matrix = new Float32Array(16);
  this.skymatrix = new Float32Array(16);
}
module.exports.UnriggedCamera = UnriggedCamera

UnriggedCamera.prototype.updateFOV = function () {
  this.setFOV(this.fov);
}
UnriggedCamera.prototype.setFOV = function(fov, leftHanded){
  this.fov = fov;
  if(!fov){
    var wh  = this.frameWidth > this.frameHeight
    var whr = wh 
      ? this.frameWidth / this.frameHeight / 2
      : this.frameHeight / this.frameWidth / 2

    m4.ortho(
      - (wh ? whr : .5),
      wh ? whr: .5,
      - (wh ? .5 : whr),
      wh ? .5 : whr,
      this.near,
      this.far,
      this.perspective
    );
  } else {
    m4.perspective(
      degToRad(fov),
      this.frameWidth / this.frameHeight,
      this.near,
      this.far,
      this.perspective
    );
    if (!leftHanded) {
      //right handed coordinate space
      this.perspective[8]  *= -1;
      this.perspective[9]  *= -1;
      this.perspective[10] *= -1;
      this.perspective[11] *= -1;
    }
  }

  
  return this;
}
UnriggedCamera.prototype.getAspect = function () {
  if (!this.aspect) {
    var larger = Math.max(this.frameHeight, this.frameWidth);
    this.aspect = [this.frameHeight / larger,  this.frameWidth / larger, 1, 0];
  }
  return this.aspect;
}
UnriggedCamera.prototype.computeMatrix = function (matrix) {
  if (matrix) {
    this.matrix = matrix;
  } else {
    m4.copy(this.perspective, this.matrix);
  }
  m4.copy(this.matrix, this.skymatrix);
  m4.setTranslation(this.skymatrix, [0, 0, 0], this.skymatrix);
  return this.matrix;
}


function BasicCamera(frameWidth, frameHeight, near, far) {
  UnriggedCamera.call(this, frameWidth, frameHeight, near, far);

  this.transform = new Transform();

  this.orientation = m4.identity(new Float32Array(16));
  this.skyorientation = new Float32Array(16);

  this.computeMatrix();
}

util.inherits(BasicCamera, UnriggedCamera)
module.exports.BasicCamera = BasicCamera

BasicCamera.prototype.computeMatrix = function(){
  require('../lib/columnMajor').mulMatrixMatrix4(this.perspective, this.orientation, this.matrix);
  return UnriggedCamera.prototype.computeMatrix.call(this, this.matrix);
}

BasicCamera.prototype.updateOrientation = function(){
  m4.identity(this.orientation);
  if(this.transform.rotateZ)
    m4.rotateZ(this.orientation, -this.transform.rotateZ, this.orientation);
  if(this.transform.rotateX)
    m4.rotateX(this.orientation, -this.transform.rotateX, this.orientation);
  if(this.transform.rotateY)
    m4.rotateY(this.orientation, -this.transform.rotateY, this.orientation);
  var pos = v3.mulScalar(this.transform.position, -1, new Float32Array(3));
  m4.copy(this.orientation, this.skyorientation);
  m4.translate(this.orientation, pos, this.orientation);
  return this;
}

BasicCamera.prototype.moveTo = function(x, y, z){
  this.transform.position[0] = x;
  this.transform.position[1] = y;
  this.transform.position[2] = z;
  this.updateOrientation();
  return this;
}

BasicCamera.prototype.moveBy = function(x, y, z){
  this.transform.position[0] += x;
  this.transform.position[1] += y;
  this.transform.position[2] += z;
  this.updateOrientation();
  return this;
}

BasicCamera.prototype.rotateTo = function(z, x, y){
  this.transform.rotateZ = z;
  this.transform.rotateX = x;
  this.transform.rotateY = y;
  this.updateOrientation();
}

BasicCamera.prototype.rotateBy = function(z, x, y){
  this.transform.rotateZ += z;
  this.transform.rotateX += x;
  this.transform.rotateY += y;
  this.updateOrientation();
}

BasicCamera.prototype.lookAt = function(target, up){
  m4.lookAt(this.transform.position, target, up, this.orientation);
  return this;
}

BasicCamera.prototype.getRotateY   = function () { return this.transform.rotateY; }
BasicCamera.prototype.moveByY      = function(d, r, a) { this.moveBy( 0,  d,  0);                         }
BasicCamera.prototype.moveByNegZ   = function(d, r, a) { this.moveBy(-d*Math.sin(a),  0,  d*Math.cos(a)); }
BasicCamera.prototype.moveByNegX   = function(d, r, a) { this.moveBy(-d*Math.cos(a),  0, -d*Math.sin(a)); }
BasicCamera.prototype.moveByX      = function(d, r, a) { this.moveBy( d*Math.cos(a),  0,  d*Math.sin(a)); }
BasicCamera.prototype.moveByZ      = function(d, r, a) { this.moveBy( d*Math.sin(a),  0, -d*Math.cos(a)); }
BasicCamera.prototype.moveByNegY   = function(d, r, a) { this.moveBy( 0, -d,  0);                         }
BasicCamera.prototype.rotateByY    = function(d, r, a) { this.rotateBy(0,  0,  r);                        }
BasicCamera.prototype.rotateByX    = function(d, r, a) { this.rotateBy(0,  r,  0);                        }
BasicCamera.prototype.rotateByNegY = function(d, r, a) { this.rotateBy(0,  0, -r);                        }
BasicCamera.prototype.rotateByNegX = function(d, r, a) { this.rotateBy(0, -r,  0);                        }

},{"../lib/columnMajor":2,"../lib/twgl":5,"./transform":30,"util":9}],30:[function(require,module,exports){
var m4 = require('../lib/twgl').m4
var eventify = require('eventify')

function Transform() {
  eventify.enable(this)

  this.id       = Transform._nextId ++;
  this.position = new Float32Array([0, 0, 0]);
  this.rotateZ  = this.rotateX = this.rotateY = 0;
  this.matrix   = m4.identity(new Float32Array(16));
}
Transform._nextId = 1;

Transform.prototype.getValue = function () {
  if (this.dirty) {
    var m = m4.identity(new Float32Array(16));

    if(this.rotateY)
      m4.rotateY(m, this.rotateY, m);
    if(this.rotateX)
      m4.rotateX(m, this.rotateX, m);
    if(this.rotateZ)
      m4.rotateZ(m, this.rotateZ, m);

    console.log(m)
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
},{"../lib/twgl":5,"eventify":10}],10:[function(require,module,exports){
// Eventify
// -----------------
// Copyright(c) 2010-2012 Jeremy Ashkenas, DocumentCloud
// Copyright(c) 2014 Bermi Ferrer <bermi@bermilabs.com>
// Copyright(c) 2013 Nicolas Perriault

// MIT Licensed


// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback functions
// to an event; trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     Eventify.enable(object);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
(function (name, global, definition) {
  if (typeof module !== 'undefined') {
    module.exports = definition(name, global);
  } else if (typeof define === 'function' && typeof define.amd === 'object') {
    define(definition);
  } else {
   //  global[name] = definition(name, global);
    var self = definition(),

    // Save the previous value of the `Eventify` variable.
    prev = global[name];

    // Run Eventify in *noConflict* mode, returning the `Eventify`
    // variable to its previous owner. Returns a reference to
    // the Eventify object.
    self.noConflict = function () {
      global[name] = prev;
      return self;
    };

    global[name] = self;
  }

}(this.localEventifyLibraryName || "Eventify", this, function () {
  'use strict';

  // Eventify, based on Backbone.Events
  // -----------------


  function uniqueId(prefix) {
    idCounter = idCounter + 1;
    var id = idCounter + '';
    return prefix ? prefix + id : id;
  }

  function once(func) {
    var ran = false,
      memo;
    return function () {
      if (ran) {
        return memo;
      }
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  }

  var EventifyInstance,
    listenMethods = {
      listenTo: 'on',
      listenToOnce: 'once'
    },
    slice = Array.prototype.slice,
    idCounter = 0,

    // Regular expression used to split event strings
    eventSplitter = /\s+/,

    // Defines the name of the local variable the Eventify library will use
    // this is specially useful if window.Eventify is already being used
    // by your application and you want a different name. For example:
    //    // Declare before including the Eventify library
    //    var localEventifyLibraryName = 'EventManager';

    // Create a safe reference to the Eventify object for use below.
    Eventify = function () {
      return this;
    };

  Eventify.prototype = {

    // Event Functions
    // -----------------

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function (name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) {
        return this;
      }
      this._events = this._events || {};
      var events = this._events[name] || (this._events[name] = []);
      events.push({
        callback: callback,
        context: context,
        ctx: context || this
      });
      return this;
    },


    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function (name, callback, context) {
      var self = this,
        onceListener;

      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) {
        return this;
      }

      onceListener = once(function () {
        self.off(name, onceListener);
        callback.apply(this, arguments);
      });

      onceListener._callback = callback;
      return this.on(name, onceListener, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function (name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) {
        return this;
      }
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : Object.keys(this._events);
      for (i = 0, l = names.length; i < l; i += 1) {
        name = names[i];
        events = this._events[name];
        if (events) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j += 1) {
              ev = events[j];
              if ((callback &&
                  callback !== ev.callback &&
                  callback !== ev.callback._callback) ||
                (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) {
            delete this._events[name];
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function (name) {
      if (!this._events) {
        return this;
      }
      var events, allEvents,
        args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) {
        return this;
      }
      events = this._events[name];
      allEvents = this._events.all;
      if (events) {
        triggerEvents(events, args);
      }
      if (allEvents) {
        triggerEvents(allEvents, arguments);
      }
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function (obj, name, callback) {
      var deleteListener, id,
        listeners = this._listeners;
      if (!listeners) {
        return this;
      }
      deleteListener = !name && !callback;
      if (typeof name === 'object') {
        callback = this;
      }
      listeners = {};
      if (obj) {
        listeners[obj._listenerId] = obj;
      }
      for (id in listeners) {
        if (listeners.hasOwnProperty(id)) {
          listeners[id].off(name, callback, this);
          if (deleteListener) {
            delete this._listeners[id];
          }
        }
      }
      return this;
    },

  };



  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  function eventsApi(obj, action, name, rest) {
    var key, i, l, names;

    if (!name) {
      return true;
    }

    // Handle event maps.
    if (typeof name === 'object') {
      for (key in name) {
        if (name.hasOwnProperty(key)) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      names = name.split(eventSplitter);
      for (i = 0, l = names.length; i < l; i += 1) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  }

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).

  function triggerEvents(events, args) {
    var ev,
      i = 0,
      l = events.length,
      a1 = args[0],
      a2 = args[1],
      a3 = args[2];
    switch (args.length) {
    case 0:
      while (i < l) {
        ev = events[i];
        ev.callback.call(ev.ctx);
        i += 1;
      }
      return;
    case 1:
      while (i < l) {
        ev = events[i];
        ev.callback.call(ev.ctx, a1);
        i += 1;
      }
      return;
    case 2:
      while (i < l) {
        ev = events[i];
        ev.callback.call(ev.ctx, a1, a2);
        i += 1;
      }
      return;
    case 3:
      while (i < l) {
        ev = events[i];
        ev.callback.call(ev.ctx, a1, a2, a3);
        i += 1;
      }
      return;
    default:
      while (i < l) {
        ev = events[i];
        ev.callback.apply(ev.ctx, args);
        i += 1;
      }
    }
  }


  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  Object.keys(listenMethods).forEach(function (method) {
    var implementation = listenMethods[method];
    Eventify.prototype[method] = function (obj, name, callback) {
      var id,
        listeners = this._listeners || (this._listeners = {});
      obj._listenerId = obj._listenerId || uniqueId('l');
      id = obj._listenerId;
      listeners[id] = obj;
      if (typeof name === 'object') {
        callback = this;
      }
      obj[implementation](name, callback, this);
      return this;
    };
  });


  // Export an Eventify instance for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `Eventify` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  EventifyInstance = new Eventify();

  EventifyInstance.version = "2.0.0";


  // Utility Functions
  // -----------------


  // Adds the methods on, off and trigger to a target Object
  EventifyInstance.enable = function enable(target) {
    var i, len,
      methods = Object.keys(Eventify.prototype);
    target = target || {};
    for (i = 0, len = methods.length; i < len; i = i + 1) {
      target[methods[i]] = this[methods[i]];
    }
    return target;
  };

  EventifyInstance.create = function () {
    return Object.create(Eventify.prototype);
  };

  // Backbone.Events drop in replacement compatibility
  EventifyInstance.mixin = EventifyInstance.enable;

  // Expose prototype so other objects can extend it
  EventifyInstance.proto = Eventify.prototype;

  // Sets Eventify on the browser window or on the process
  return EventifyInstance;

  // Establish the root object, `window` in the browser,
  // or `global` on the server.
}));

},{}],5:[function(require,module,exports){
module.exports = require('twgl.js').twgl
},{"twgl.js":"twgl.js"}],"twgl.js":[function(require,module,exports){
/**
 * @license twgl.js 0.0.25 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
 * Available via the MIT license.
 * see: http://github.com/greggman/twgl.js for details
 */
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
!function(a,b){"function"==typeof define&&define.amd?define([],b):a.twgl=b()}(this,function(){var a,b,c;return function(d){function e(a,b){return u.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=b&&b.split("/"),o=s.map,p=o&&o["*"]||{};if(a&&"."===a.charAt(0))if(b){for(a=a.split("/"),g=a.length-1,s.nodeIdCompat&&w.test(a[g])&&(a[g]=a[g].replace(w,"")),a=n.slice(0,n.length-1).concat(a),k=0;k<a.length;k+=1)if(m=a[k],"."===m)a.splice(k,1),k-=1;else if(".."===m){if(1===k&&(".."===a[2]||".."===a[0]))break;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}else 0===a.indexOf("./")&&(a=a.substring(2));if((n||p)&&o){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),n)for(l=n.length;l>0;l-=1)if(e=o[n.slice(0,l).join("/")],e&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&p&&p[d]&&(i=p[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,b){return function(){var c=v.call(arguments,0);return"string"!=typeof c[0]&&1===c.length&&c.push(null),n.apply(d,c.concat([a,b]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){q[a]=b}}function j(a){if(e(r,a)){var b=r[a];delete r[a],t[a]=!0,m.apply(d,b)}if(!e(q,a)&&!e(t,a))throw new Error("No "+a);return q[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return function(){return s&&s.config&&s.config[a]||{}}}var m,n,o,p,q={},r={},s={},t={},u=Object.prototype.hasOwnProperty,v=[].slice,w=/\.js$/;o=function(a,b){var c,d=k(a),e=d[0];return a=d[1],e&&(e=f(e,b),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(b)):f(a,b):(a=f(a,b),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},p={require:function(a){return g(a)},exports:function(a){var b=q[a];return"undefined"!=typeof b?b:q[a]={}},module:function(a){return{id:a,uri:"",exports:q[a],config:l(a)}}},m=function(a,b,c,f){var h,k,l,m,n,s,u=[],v=typeof c;if(f=f||a,"undefined"===v||"function"===v){for(b=!b.length&&c.length?["require","exports","module"]:b,n=0;n<b.length;n+=1)if(m=o(b[n],f),k=m.f,"require"===k)u[n]=p.require(a);else if("exports"===k)u[n]=p.exports(a),s=!0;else if("module"===k)h=u[n]=p.module(a);else if(e(q,k)||e(r,k)||e(t,k))u[n]=j(k);else{if(!m.p)throw new Error(a+" missing "+k);m.p.load(m.n,g(f,!0),i(k),{}),u[n]=q[k]}l=c?c.apply(q[a],u):void 0,a&&(h&&h.exports!==d&&h.exports!==q[a]?q[a]=h.exports:l===d&&s||(q[a]=l))}else a&&(q[a]=c)},a=b=n=function(a,b,c,e,f){if("string"==typeof a)return p[a]?p[a](b):j(o(a,b).f);if(!a.splice){if(s=a,s.deps&&n(s.deps,s.callback),!b)return;b.splice?(a=b,b=c,c=null):a=d}return b=b||function(){},"function"==typeof c&&(c=e,e=f),e?m(d,a,b,c):setTimeout(function(){m(d,a,b,c)},4),n},n.config=function(a){return n(a)},a._defined=q,c=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(q,a)||e(r,a)||(r[a]=[a,b,c])},c.amd={jQuery:!0}}(),c("node_modules/almond/almond.js",function(){}),c("twgl/twgl",[],function(){function a(a){ea=new Uint8Array([255*a[0],255*a[1],255*a[2],255*a[3]])}function b(a){da=a}function c(a,b){for(var c=["webgl","experimental-webgl"],d=null,e=0;e<c.length;++e){try{d=a.getContext(c[e],b)}catch(f){}if(d)break}return d}function d(a,b){var d=c(a,b);return d}function e(a){return a.split("\n").map(function(a,b){return b+1+": "+a}).join("\n")}function f(a,b,c,d){var f=d||ca,g=a.createShader(c);a.shaderSource(g,b),a.compileShader(g);var h=a.getShaderParameter(g,a.COMPILE_STATUS);if(!h){var i=a.getShaderInfoLog(g);return f(e(b)+"\n*** Error compiling shader: "+i),a.deleteShader(g),null}return g}function g(a,b,c,d,e){var f=e||ca,g=a.createProgram();b.forEach(function(b){a.attachShader(g,b)}),c&&c.forEach(function(b,c){a.bindAttribLocation(g,d?d[c]:c,b)}),a.linkProgram(g);var h=a.getProgramParameter(g,a.LINK_STATUS);if(!h){var i=a.getProgramInfoLog(g);return f("Error in program linking:"+i),a.deleteProgram(g),null}return g}function h(a,b,c,d){var e,g="",h=document.getElementById(b);if(!h)throw"*** Error: unknown script element"+b;if(g=h.text,!c)if("x-shader/x-vertex"===h.type)e=a.VERTEX_SHADER;else if("x-shader/x-fragment"===h.type)e=a.FRAGMENT_SHADER;else if(e!==a.VERTEX_SHADER&&e!==a.FRAGMENT_SHADER)throw"*** Error: unknown shader type";return f(a,g,c?c:e,d)}function i(a,b,c,d,e){for(var f=[],i=0;i<b.length;++i){var j=h(a,b[i],a[Ha[i]],e);if(!j)return null;f.push(j)}return g(a,f,c,d,e)}function j(a,b,c,d,e){for(var h=[],i=0;i<b.length;++i){var j=f(a,b[i],a[Ha[i]],e);if(!j)return null;h.push(j)}return g(a,h,c,d,e)}function k(a,b){return b===a.SAMPLER_2D?a.TEXTURE_2D:b===a.SAMPLER_CUBE?a.TEXTURE_CUBE_MAP:void 0}function l(a,b){function c(b,c){var e=a.getUniformLocation(b,c.name),f=c.type,g=c.size>1&&"[0]"===c.name.substr(-3);if(f===a.FLOAT&&g)return function(b){a.uniform1fv(e,b)};if(f===a.FLOAT)return function(b){a.uniform1f(e,b)};if(f===a.FLOAT_VEC2)return function(b){a.uniform2fv(e,b)};if(f===a.FLOAT_VEC3)return function(b){a.uniform3fv(e,b)};if(f===a.FLOAT_VEC4)return function(b){a.uniform4fv(e,b)};if(f===a.INT&&g)return function(b){a.uniform1iv(e,b)};if(f===a.INT)return function(b){a.uniform1i(e,b)};if(f===a.INT_VEC2)return function(b){a.uniform2iv(e,b)};if(f===a.INT_VEC3)return function(b){a.uniform3iv(e,b)};if(f===a.INT_VEC4)return function(b){a.uniform4iv(e,b)};if(f===a.BOOL)return function(b){a.uniform1iv(e,b)};if(f===a.BOOL_VEC2)return function(b){a.uniform2iv(e,b)};if(f===a.BOOL_VEC3)return function(b){a.uniform3iv(e,b)};if(f===a.BOOL_VEC4)return function(b){a.uniform4iv(e,b)};if(f===a.FLOAT_MAT2)return function(b){a.uniformMatrix2fv(e,!1,b)};if(f===a.FLOAT_MAT3)return function(b){a.uniformMatrix3fv(e,!1,b)};if(f===a.FLOAT_MAT4)return function(b){a.uniformMatrix4fv(e,!1,b)};if((f===a.SAMPLER_2D||f===a.SAMPLER_CUBE)&&g){for(var h=[],i=0;i<c.size;++i)h.push(d++);return function(b,c){return function(d){a.uniform1iv(e,c),d.forEach(function(d,e){a.activeTexture(a.TEXTURE0+c[e]),a.bindTexture(b,d)})}}(k(a,f),h)}if(f===a.SAMPLER_2D||f===a.SAMPLER_CUBE)return function(b,c){return function(d){a.uniform1i(e,c),a.activeTexture(a.TEXTURE0+c),a.bindTexture(b,d)}}(k(a,f),d++);throw"unknown type: 0x"+f.toString(16)}for(var d=0,e={},f=a.getProgramParameter(b,a.ACTIVE_UNIFORMS),g=0;f>g;++g){var h=a.getActiveUniform(b,g);if(!h)break;var i=h.name;"[0]"===i.substr(-3)&&(i=i.substr(0,i.length-3));var j=c(b,h);e[i]=j}return e}function m(a,b){a=a.uniformSetters||a;for(var c=arguments.length,d=1;c>d;++d){var e=arguments[d];if(Array.isArray(e))for(var f=e.length,g=0;f>g;++g)m(a,e[g]);else for(var h in e){var i=a[h];i&&i(e[h])}}}function n(a,b){function c(b){return function(c){a.bindBuffer(a.ARRAY_BUFFER,c.buffer),a.enableVertexAttribArray(b),a.vertexAttribPointer(b,c.numComponents||c.size,c.type||a.FLOAT,c.normalize||!1,c.stride||0,c.offset||0)}}for(var d={},e=a.getProgramParameter(b,a.ACTIVE_ATTRIBUTES),f=0;e>f;++f){var g=a.getActiveAttrib(b,f);if(!g)break;var h=a.getAttribLocation(b,g.name);d[g.name]=c(h)}return d}function o(a,b){for(var c in b){var d=a[c];d&&d(b[c])}}function p(a,b,c){o(b.attribSetters||b,c.attribs),c.indices&&a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,c.indices)}function q(a,b,c,d,e){b=b.map(function(a){var b=document.getElementById(a);return b?b.text:a});var f=j(a,b,c,d,e);if(!f)return null;var g=l(a,f),h=n(a,f);return{program:f,uniformSetters:g,attribSetters:h}}function r(a,b){b=b||1,b=Math.max(1,b);var c=a.clientWidth*b|0,d=a.clientHeight*b|0;return a.width!==c||a.height!==d?(a.width=c,a.height=d,!0):!1}function s(a,b,c,d){if(b instanceof WebGLBuffer)return b;c=c||a.ARRAY_BUFFER;var e=a.createBuffer();return a.bindBuffer(c,e),a.bufferData(c,b,d||a.STATIC_DRAW),e}function t(a){return"indices"===a}function u(a){if(a instanceof Int8Array)return ga;if(a instanceof Uint8Array)return ha;if(a instanceof Int16Array)return ia;if(a instanceof Uint16Array)return ja;if(a instanceof Int32Array)return ka;if(a instanceof Uint32Array)return la;if(a instanceof Float32Array)return ma;throw"unsupported typed array type"}function v(a,b){switch(b){case a.BYTE:return Int8Array;case a.UNSIGNED_BYTE:return Uint8Array;case a.SHORT:return Int16Array;case a.UNSIGNED_SHORT:return Uint16Array;case a.INT:return Int32Array;case a.UNSIGNED_INT:return Uint32Array;case a.FLOAT:return Float32Array;default:throw"unknown gl type"}}function w(a){return a instanceof Int8Array?!0:a instanceof Uint8Array?!0:!1}function x(a){return a&&a.buffer&&a.buffer instanceof ArrayBuffer}function y(a,b){var c;if(c=a.indexOf("coord")>=0?2:a.indexOf("color")>=0?4:3,b%c>0)throw"can not guess numComponents. You should specify it.";return c}function z(a,b){if(x(a))return a;if(x(a.data))return a.data;Array.isArray(a)&&(a={data:a});var c=a.type;return c||(c="indices"===b?Uint16Array:Float32Array),new c(a.data)}function A(a,b){var c={};return Object.keys(b).forEach(function(d){if(!t(d)){var e=b[d],f=e.attrib||e.name||e.attribName||da+d,g=z(e,d);c[f]={buffer:s(a,g,void 0,e.drawType),numComponents:e.numComponents||e.size||y(d),type:u(g),normalize:void 0!==e.normalize?e.normalize:w(g),stride:e.stride||0,offset:e.offset||0}}}),c}function B(a,b){var c={attribs:A(a,b)},d=b.indices;return d?(d=z(d,"indices"),c.indices=s(a,d,a.ELEMENT_ARRAY_BUFFER),c.numElements=d.length,c.elementType=d instanceof Uint32Array?a.UNSIGNED_INT:a.UNSIGNED_SHORT):c.numElements=Ia(b),c}function C(a,b){var c={};return Object.keys(b).forEach(function(d){var e="indices"===d?a.ELEMENT_ARRAY_BUFFER:a.ARRAY_BUFFER,f=z(b[d],d);c[d]=s(a,f,e)}),c}function D(a,b,c,d,e){var f=c.indices,g=void 0===d?c.numElements:d;e=void 0===e?0:e,f?a.drawElements(b,g,void 0===c.elementType?a.UNSIGNED_SHORT:c.elementType,e):a.drawArrays(b,e,g)}function E(a,b){var c=null,d=null;b.forEach(function(b){if(b.active!==!1){var e=b.programInfo,f=b.bufferInfo,g=!1;e!==c&&(c=e,a.useProgram(e.program),g=!0),(g||f!==d)&&(d=f,p(a,e,f)),m(e,b.uniforms),D(a,b.type||a.TRIANGLES,f,b.count,b.offset)}})}function F(a,b){void 0!==b.colorspaceConversion&&(Ja.colorSpaceConversion=a.getParameter(a.UNPACK_COLORSPACE_CONVERSION_WEBGL)),void 0!==b.premultiplyAlpha&&(Ja.premultiplyAlpha=a.getParameter(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL)),void 0!==b.flipY&&(Ja.flipY=a.getParameter(a.UNPACK_FLIP_Y_WEBGL))}function G(a,b){void 0!==b.colorspaceConversion&&a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ja.colorSpaceConversion),void 0!==b.premultiplyAlpha&&a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Ja.premultiplyAlpha),void 0!==b.flipY&&a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,Ja.flipY)}function H(a,b,c){var d=c.target||a.TEXTURE_2D;a.bindTexture(d,b),c.min&&a.texParameteri(d,a.TEXTURE_MIN_FILTER,c.min),c.mag&&a.texParameteri(d,a.TEXTURE_MAG_FILTER,c.mag),c.wrap&&(a.texParameteri(d,a.TEXTURE_WRAP_S,c.wrap),a.texParameteri(d,a.TEXTURE_WRAP_T,c.wrap)),c.wrapS&&a.texParameteri(d,a.TEXTURE_WRAP_S,c.wrapS),c.wrapT&&a.texParameteri(d,a.TEXTURE_WRAP_T,c.wrapT)}function I(a){return a=a||ea,x(a)?a:new Uint8Array([255*a[0],255*a[1],255*a[2],255*a[3]])}function J(a){return 0===(a&a-1)}function K(a,b,c,d,e){c=c||fa;var f=c.target||a.TEXTURE_2D;d=d||c.width,e=e||c.height,a.bindTexture(f,b),J(d)&&J(e)?a.generateMipmap(f):(a.texParameteri(f,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(f,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(f,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE))}function L(a,b){return b=b||{},b.cubeFaceOrder||[a.TEXTURE_CUBE_MAP_POSITIVE_X,a.TEXTURE_CUBE_MAP_NEGATIVE_X,a.TEXTURE_CUBE_MAP_POSITIVE_Y,a.TEXTURE_CUBE_MAP_NEGATIVE_Y,a.TEXTURE_CUBE_MAP_POSITIVE_Z,a.TEXTURE_CUBE_MAP_NEGATIVE_Z]}function M(a,b){var c=L(a,b),d=c.map(function(a,b){return{face:a,ndx:b}});return d.sort(function(a,b){return a.face-b.face}),d}function N(a){var b={};return Object.keys(a).forEach(function(c){b[c]=a[c]}),b}function O(a,b){var c=new Image;return c.onerror=function(){var d="couldn't load image: "+a;ca(d),b(d,c)},c.onload=function(){b(null,c)},c.src=a,c}function P(a,b,c){c=c||fa;var d=c.target||a.TEXTURE_2D;if(a.bindTexture(d,b),c.color!==!1){var e=I(c.color);if(d===a.TEXTURE_CUBE_MAP)for(var f=0;6>f;++f)a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+f,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,e);else a.texImage2D(d,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,e)}}function Q(a,b,c,d){c=c||fa,P(a,b,c),c=N(c);var e=O(c.src,function(e,f){e?d(e,b,f):(Ka(a,b,f,c),d(null,b,f))});return e}function R(a,b,c,d){function e(e){return function(f,m){--k,f?l.push(f):m.width!==m.height?l.push("cubemap face img is not a square: "+m.src):(F(a,c),a.bindTexture(i,b),5===k?L(a).forEach(function(b){a.texImage2D(b,0,g,g,h,m)}):a.texImage2D(e,0,g,g,h,m),G(a,c),a.generateMipmap(i)),0===k&&d&&d(l.length?l:void 0,j,b)}}var f=c.src;if(6!==f.length)throw"there must be 6 urls for a cubemap";var g=c.format||a.RGBA,h=c.type||a.UNSIGNED_BYTE,i=c.target||a.TEXTURE_2D;if(i!==a.TEXTURE_CUBE_MAP)throw"target must be TEXTURE_CUBE_MAP";P(a,b,c),c=N(c);var j,k=6,l=[],m=L(a,c);j=f.map(function(a,b){return O(a,e(m[b]))})}function S(a){switch(a){case oa:case ra:return 1;case sa:return 2;case pa:return 3;case qa:return 4;default:throw"unknown type: "+a}}function T(a,b){return x(b)?u(b):a.UNSIGNED_BYTE}function U(a,b,c,d){d=d||fa;var e=d.target||a.TEXTURE_2D,f=d.width,g=d.height,h=d.format||a.RGBA,i=d.type||T(a,c),j=S(h),k=c.length/j;if(k%1)throw"length wrong size of format: "+Ga(a,h);if(f||g){if(g){if(!f&&(f=k/g,f%1))throw"can't guess width"}else if(g=k/f,g%1)throw"can't guess height"}else{var l=Math.sqrt(k/(e===a.TEXTURE_CUBE_MAP?6:1));l%1===0?(f=l,g=l):(f=k,g=1)}if(!x(c)){var m=v(a,i);c=new m(c)}if(a.pixelStorei(a.UNPACK_ALIGNMENT,d.unpackAlignment||1),F(a,d),e===a.TEXTURE_CUBE_MAP){var n=k/6*j;M(a,d).forEach(function(b){var d=n*b.ndx,e=c.subarray(d,d+n);a.texImage2D(b.face,0,h,f,g,0,h,i,e)})}else a.texImage2D(e,0,h,f,g,0,h,i,c);return G(a,d),{width:f,height:g}}function V(a,b,c){var d=c.target||a.TEXTURE_2D;a.bindTexture(d,b);var e=c.format||a.RGBA,f=c.type||a.UNSIGNED_BYTE;if(F(a,c),d===a.TEXTURE_CUBE_MAP)for(var g=0;6>g;++g)a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+g,0,e,c.width,c.height,0,e,f,null);else a.texImage2D(d,0,e,c.width,c.height,0,e,f,null)}function W(a,b,c){b=b||fa;var d=a.createTexture(),e=b.target||a.TEXTURE_2D,f=b.width||1,g=b.height||1;a.bindTexture(e,d),e===a.TEXTURE_CUBE_MAP&&(a.texParameteri(e,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(e,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE));var h=b.src;if(h)if("function"==typeof h&&(h=h(a,b)),"string"==typeof h)Q(a,d,b,c);else if(x(h)||Array.isArray(h)&&("number"==typeof h[0]||Array.isArray(h[0])||x(h[0]))){var i=U(a,d,h,b);f=i.width,g=i.height}else if(Array.isArray(h)&&"string"==typeof h[0])R(a,d,b,c);else{if(!(h instanceof HTMLElement))throw"unsupported src type";Ka(a,d,h,b),f=h.width,g=h.height}else V(a,d,b);return b.auto!==!1&&K(a,d,b,f,g),H(a,d,b),d}function X(a,b,c,d,e){d=d||c.width,e=e||c.height;var f=c.target||a.TEXTURE_2D;a.bindTexture(f,b);var g,h=c.format||a.RGBA,i=c.src;if(g=i&&(x(i)||Array.isArray(i)&&"number"==typeof i[0])?c.type||T(a,i):c.type||a.UNSIGNED_BYTE,f===a.TEXTURE_CUBE_MAP)for(var j=0;6>j;++j)a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,h,d,e,0,h,g,null);else a.texImage2D(f,0,h,d,e,0,h,g,null)}function Y(a){return"string"==typeof a||Array.isArray(a)&&"string"==typeof a[0]}function Z(a,b,c){function d(){0===f&&c&&setTimeout(function(){c(g.length?g:void 0,b)},0)}function e(a){--f,a&&g.push(a),d()}var f=0,g=[],h={};return Object.keys(b).forEach(function(c){var d=b[c],g=void 0;Y(d.src)&&(g=e,++f),h[c]=W(a,d,g)}),d(),h}function $(a){return Ma[a]}function _(a){return Na[a]}function aa(a,b,c,d){var e=a.FRAMEBUFFER,f=a.createFramebuffer();a.bindFramebuffer(e,f),c=c||a.drawingBufferWidth,d=d||a.drawingBufferHeight,b=b||La;var g=0,h={framebuffer:f,attachments:[]};return b.forEach(function(b){var f=b.attachment,i=b.format,j=$(i);if(j||(j=Aa+g++),!f)if(_(i))f=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,f),a.renderbufferStorage(a.RENDERBUFFER,i,c,d);else{var k=N(b);k.width=c,k.height=d,k.auto=void 0===b.auto?!1:b.auto,f=W(a,k)}if(f instanceof WebGLRenderbuffer)a.framebufferRenderbuffer(e,j,a.RENDERBUFFER,f);else{if(!(f instanceof WebGLTexture))throw"unknown attachment type";a.framebufferTexture2D(e,j,b.texTarget||a.TEXTURE_2D,f,b.level||0)}h.attachments.push(f)}),h}function ba(a,b,c,d,e){d=d||a.drawingBufferWidth,e=e||a.drawingBufferHeight,c=c||La,c.forEach(function(c,f){var g=b.attachments[f],h=c.format;if(g instanceof WebGLRenderbuffer)a.bindRenderbuffer(a.RENDERBUFFER,g),a.renderbufferStorage(a.RENDERBUFFER,h,d,e);else{if(!(g instanceof WebGLTexture))throw"unknown attachment type";X(a,g,c,d,e)}})}var ca=window.console&&window.console.error?window.console.error.bind(window.console):function(){},da="",ea=new Uint8Array([128,192,255,255]),fa={},ga=5120,ha=5121,ia=5122,ja=5123,ka=5124,la=5125,ma=5126,na=6402,oa=6406,pa=6407,qa=6408,ra=6409,sa=6410,ta=32854,ua=32855,va=36194,wa=33189,xa=6401,ya=36168,za=34041,Aa=36064,Ba=36096,Ca=36128,Da=33306,Ea=33071,Fa=9729,Ga=function(){function a(a){b||(b={},Object.keys(a).forEach(function(c){"number"==typeof a[c]&&(b[a[c]]=c)}))}var b;return function(c,d){return a(),b[d]||"0x"+d.toString(16)}}(),Ha=["VERTEX_SHADER","FRAGMENT_SHADER"],Ia=function(){var a=["position","positions","a_position"];return function(b){for(var c,d=0;d<a.length&&(c=a[d],!(c in b));++d);d===a.length&&(c=Object.keys(b)[0]);var e=b[c],f=e.length||e.data.length,g=e.numComponents||y(c,f),h=f/g;if(f%g>0)throw"numComponents "+g+" not correct for length "+f;return h}}(),Ja={},Ka=function(){var a=document.createElement("canvas").getContext("2d");return function(b,c,d,e){e=e||fa;var f=e.target||b.TEXTURE_2D,g=d.width,h=d.height,i=e.format||b.RGBA,j=e.type||b.UNSIGNED_BYTE;if(F(b,e),b.bindTexture(f,c),f===b.TEXTURE_CUBE_MAP){var k,l,m=d.width,n=d.height;if(m/6===n)k=n,l=[0,0,1,0,2,0,3,0,4,0,5,0];else if(n/6===m)k=m,l=[0,0,0,1,0,2,0,3,0,4,0,5];else if(m/3===n/2)k=m/3,l=[0,0,1,0,2,0,0,1,1,1,2,1];else{if(m/2!==n/3)throw"can't figure out cube map from element: "+(d.src?d.src:d.nodeName);k=m/2,l=[0,0,1,0,0,1,1,1,0,2,1,2]}a.canvas.width=k,a.canvas.height=k,g=k,h=k,M(b,e).forEach(function(c){var e=l[2*c.ndx+0]*k,f=l[2*c.ndx+1]*k;a.drawImage(d,e,f,k,k,0,0,k,k),b.texImage2D(c.face,0,i,i,j,a.canvas)}),a.canvas.width=1,a.canvas.height=1}else b.texImage2D(f,0,i,i,j,d);G(b,e),e.auto!==!1&&K(b,c,e,g,h),H(b,c,e)}}(),La=[{format:qa,type:ha,min:Fa,wrap:Ea},{format:za}],Ma={};Ma[za]=Da,Ma[xa]=Ca,Ma[ya]=Ca,Ma[na]=Ba,Ma[wa]=Ba;var Na={};return Na[ta]=!0,Na[ua]=!0,Na[va]=!0,Na[za]=!0,Na[wa]=!0,Na[xa]=!0,Na[ya]=!0,{createAttribsFromArrays:A,createBuffersFromArrays:C,createBufferInfoFromArrays:B,createAttributeSetters:n,createProgram:g,createProgramFromScripts:i,createProgramFromSources:j,createProgramInfo:q,createUniformSetters:l,drawBufferInfo:D,drawObjectList:E,getWebGLContext:d,resizeCanvasToDisplaySize:r,setAttributes:o,setAttributePrefix:b,setBuffersAndAttributes:p,setUniforms:m,createTexture:W,setEmptyTexture:V,setTextureFromArray:U,loadTextureFromUrl:Q,setTextureFromElement:Ka,setTextureFilteringForSize:K,setTextureParameters:H,setDefaultTextureColor:a,createTextures:Z,resizeTexture:X,createFramebufferInfo:aa,resizeFramebufferInfo:ba}}),c("twgl/v3",[],function(){function a(a){q=a}function b(){return new q(3)}function c(a,b,c){return c=c||new q(3),c[0]=a[0]+b[0],c[1]=a[1]+b[1],c[2]=a[2]+b[2],c}function d(a,b,c){return c=c||new q(3),c[0]=a[0]-b[0],c[1]=a[1]-b[1],c[2]=a[2]-b[2],c}function e(a,b,c,d){return d=d||new q(3),d[0]=(1-c)*a[0]+c*b[0],d[1]=(1-c)*a[1]+c*b[1],d[2]=(1-c)*a[2]+c*b[2],d}function f(a,b,c){return c=c||new q(3),c[0]=a[0]*b,c[1]=a[1]*b,c[2]=a[2]*b,c}function g(a,b,c){return c=c||new q(3),c[0]=a[0]/b,c[1]=a[1]/b,c[2]=a[2]/b,c}function h(a,b,c){return c=c||new q(3),c[0]=a[1]*b[2]-a[2]*b[1],c[1]=a[2]*b[0]-a[0]*b[2],c[2]=a[0]*b[1]-a[1]*b[0],c}function i(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function j(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])}function k(a){return a[0]*a[0]+a[1]*a[1]+a[2]*a[2]}function l(a,b){b=b||new q(3);var c=a[0]*a[0]+a[1]*a[1]+a[2]*a[2],d=Math.sqrt(c);return d>1e-5?(b[0]=a[0]/d,b[1]=a[1]/d,b[2]=a[2]/d):(b[0]=0,b[1]=0,b[2]=0),b}function m(a,b){return b=b||new q(3),b[0]=-a[0],b[1]=-a[1],b[2]=-a[2],b}function n(a,b){return b=b||new q(3),b[0]=a[0],b[1]=a[1],b[2]=a[2],b}function o(a,b,c){return c=c||new q(3),c[0]=a[0]*b[0],c[1]=a[1]*b[1],c[2]=a[2]*b[2],c}function p(a,b,c){return c=c||new q(3),c[0]=a[0]/b[0],c[1]=a[1]/b[1],c[2]=a[2]/b[2],c}var q=Float32Array;return{add:c,copy:n,create:b,cross:h,divide:p,divScalar:g,dot:i,lerp:e,length:j,lengthSq:k,mulScalar:f,multiply:o,negate:m,normalize:l,setDefaultType:a,subtract:d}}),c("twgl/m4",["./v3"],function(a){function b(a){VecType=a}function c(a,b){return b=b||new E(16),b[0]=-a[0],b[1]=-a[1],b[2]=-a[2],b[3]=-a[3],b[4]=-a[4],b[5]=-a[5],b[6]=-a[6],b[7]=-a[7],b[8]=-a[8],b[9]=-a[9],b[10]=-a[10],b[11]=-a[11],b[12]=-a[12],b[13]=-a[13],b[14]=-a[14],b[15]=-a[15],b}function d(a,b){return b=b||new E(16),b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8],b[9]=a[9],b[10]=a[10],b[11]=a[11],b[12]=a[12],b[13]=a[13],b[14]=a[14],b[15]=a[15],b}function e(a){return a=a||new E(16),a[0]=1,a[1]=0,a[2]=0,a[3]=0,a[4]=0,a[5]=1,a[6]=0,a[7]=0,a[8]=0,a[9]=0,a[10]=1,a[11]=0,a[12]=0,a[13]=0,a[14]=0,a[15]=1,a}function f(a,b){if(b=b||new E(16),b===a){var c;return c=a[1],a[1]=a[4],a[4]=c,c=a[2],a[2]=a[8],a[8]=c,c=a[3],a[3]=a[12],a[12]=c,c=a[6],a[6]=a[9],a[9]=c,c=a[7],a[7]=a[13],a[13]=c,c=a[11],a[11]=a[14],a[14]=c,b}var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=a[9],n=a[10],o=a[11],p=a[12],q=a[13],r=a[14],s=a[15];return b[0]=d,b[1]=h,b[2]=l,b[3]=p,b[4]=e,b[5]=i,b[6]=m,b[7]=q,b[8]=f,b[9]=j,b[10]=n,b[11]=r,b[12]=g,b[13]=k,b[14]=o,b[15]=s,b}function g(a,b){b=b||new E(16);var c=a[0],d=a[1],e=a[2],f=a[3],g=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],m=a[10],n=a[11],o=a[12],p=a[13],q=a[14],r=a[15],s=m*r,t=q*n,u=i*r,v=q*j,w=i*n,x=m*j,y=e*r,z=q*f,A=e*n,B=m*f,C=e*j,D=i*f,F=k*p,G=o*l,H=g*p,I=o*h,J=g*l,K=k*h,L=c*p,M=o*d,N=c*l,O=k*d,P=c*h,Q=g*d,R=s*h+v*l+w*p-(t*h+u*l+x*p),S=t*d+y*l+B*p-(s*d+z*l+A*p),T=u*d+z*h+C*p-(v*d+y*h+D*p),U=x*d+A*h+D*l-(w*d+B*h+C*l),V=1/(c*R+g*S+k*T+o*U);return b[0]=V*R,b[1]=V*S,b[2]=V*T,b[3]=V*U,b[4]=V*(t*g+u*k+x*o-(s*g+v*k+w*o)),b[5]=V*(s*c+z*k+A*o-(t*c+y*k+B*o)),b[6]=V*(v*c+y*g+D*o-(u*c+z*g+C*o)),b[7]=V*(w*c+B*g+C*k-(x*c+A*g+D*k)),b[8]=V*(F*j+I*n+J*r-(G*j+H*n+K*r)),b[9]=V*(G*f+L*n+O*r-(F*f+M*n+N*r)),b[10]=V*(H*f+M*j+P*r-(I*f+L*j+Q*r)),b[11]=V*(K*f+N*j+Q*n-(J*f+O*j+P*n)),b[12]=V*(H*m+K*q+G*i-(J*q+F*i+I*m)),b[13]=V*(N*q+F*e+M*m-(L*m+O*q+G*e)),b[14]=V*(L*i+Q*q+I*e-(P*q+H*e+M*i)),b[15]=V*(P*m+J*e+O*i-(N*i+Q*m+K*e)),b}function h(a,b,c){c=c||new E(16);var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],m=a[9],n=a[10],o=a[11],p=a[12],q=a[13],r=a[14],s=a[15],t=b[0],u=b[1],v=b[2],w=b[3],x=b[4],y=b[5],z=b[6],A=b[7],B=b[8],C=b[9],D=b[10],F=b[11],G=b[12],H=b[13],I=b[14],J=b[15];return c[0]=d*t+e*x+f*B+g*G,c[1]=d*u+e*y+f*C+g*H,c[2]=d*v+e*z+f*D+g*I,c[3]=d*w+e*A+f*F+g*J,c[4]=h*t+i*x+j*B+k*G,c[5]=h*u+i*y+j*C+k*H,c[6]=h*v+i*z+j*D+k*I,c[7]=h*w+i*A+j*F+k*J,c[8]=l*t+m*x+n*B+o*G,c[9]=l*u+m*y+n*C+o*H,c[10]=l*v+m*z+n*D+o*I,c[11]=l*w+m*A+n*F+o*J,c[12]=p*t+q*x+r*B+s*G,c[13]=p*u+q*y+r*C+s*H,c[14]=p*v+q*z+r*D+s*I,c[15]=p*w+q*A+r*F+s*J,c}function i(a,b,c){return c=c||e(),a!==c&&(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c[4]=a[4],c[5]=a[5],c[6]=a[6],c[7]=a[7],c[8]=a[8],c[9]=a[9],c[10]=a[10],c[11]=a[11]),c[12]=b[0],c[13]=b[1],c[14]=b[2],c[15]=1,c}function j(b,c){return c=c||a.create(),c[0]=b[12],c[1]=b[13],c[2]=b[14],c}function k(b,c,d){d=d||a.create();var e=4*c;return d[0]=b[e+0],d[1]=b[e+1],d[2]=b[e+2],d}function l(a,b,c,d,e){e=e||new E(16);var f=Math.tan(.5*Math.PI-.5*a),g=1/(c-d);return e[0]=f/b,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=f,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=(c+d)*g,e[11]=-1,e[12]=0,e[13]=0,e[14]=c*d*g*2,e[15]=0,e}function m(a,b,c,d,e,f,g){return g=g||new E(16),g[0]=2/(b-a),g[1]=0,g[2]=0,g[3]=0,g[4]=0,g[5]=2/(d-c),g[6]=0,g[7]=0,g[8]=0,g[9]=0,g[10]=-1/(f-e),g[11]=0,g[12]=(b+a)/(a-b),g[13]=(d+c)/(c-d),g[14]=-e/(e-f),g[15]=1,g}function n(a,b,c,d,e,f,g){g=g||new E(16);var h=b-a,i=d-c,j=e-f;return g[0]=2*e/h,g[1]=0,g[2]=0,g[3]=0,g[4]=0,g[5]=2*e/i,g[6]=0,g[7]=0,g[8]=(a+b)/h,g[9]=(d+c)/i,g[10]=f/j,g[11]=-1,g[12]=0,g[13]=0,g[14]=e*f/j,g[15]=0,g}function o(b,c,d,e){e=e||new E(16);var f=F,g=G,h=H;return a.normalize(a.subtract(b,c,h),h),a.normalize(a.cross(d,h,f),f),a.normalize(a.cross(h,f,g),g),e[0]=f[0],e[1]=f[1],e[2]=f[2],e[3]=0,e[4]=g[0],e[5]=g[1],e[6]=g[2],e[7]=0,e[8]=h[0],e[9]=h[1],e[10]=h[2],e[11]=0,e[12]=b[0],e[13]=b[1],e[14]=b[2],e[15]=1,e}function p(a,b){return b=b||new E(16),b[0]=1,b[1]=0,b[2]=0,b[3]=0,b[4]=0,b[5]=1,b[6]=0,b[7]=0,b[8]=0,b[9]=0,b[10]=1,b[11]=0,b[12]=a[0],b[13]=a[1],b[14]=a[2],b[15]=1,b}function q(a,b,c){c=c||new E(16);var d=b[0],e=b[1],f=b[2],g=a[0],h=a[1],i=a[2],j=a[3],k=a[4],l=a[5],m=a[6],n=a[7],o=a[8],p=a[9],q=a[10],r=a[11],s=a[12],t=a[13],u=a[14],v=a[15];return a!==c&&(c[0]=g,c[1]=h,c[2]=i,c[3]=j,c[4]=k,c[5]=l,c[6]=m,c[7]=n,c[8]=o,c[9]=p,c[10]=q,c[11]=r),c[12]=g*d+k*e+o*f+s,c[13]=h*d+l*e+p*f+t,c[14]=i*d+m*e+q*f+u,c[15]=j*d+n*e+r*f+v,c}function r(a,b){b=b||new E(16);var c=Math.cos(a),d=Math.sin(a);return b[0]=1,b[1]=0,b[2]=0,b[3]=0,b[4]=0,b[5]=c,b[6]=d,b[7]=0,b[8]=0,b[9]=-d,b[10]=c,b[11]=0,b[12]=0,b[13]=0,b[14]=0,b[15]=1,b}function s(a,b,c){c=c||new E(16);var d=a[4],e=a[5],f=a[6],g=a[7],h=a[8],i=a[9],j=a[10],k=a[11],l=Math.cos(b),m=Math.sin(b);return c[4]=l*d+m*h,c[5]=l*e+m*i,c[6]=l*f+m*j,c[7]=l*g+m*k,c[8]=l*h-m*d,c[9]=l*i-m*e,c[10]=l*j-m*f,c[11]=l*k-m*g,a!==c&&(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]),c}function t(a,b){b=b||new E(16);var c=Math.cos(a),d=Math.sin(a);return b[0]=c,b[1]=0,b[2]=-d,b[3]=0,b[4]=0,b[5]=1,b[6]=0,b[7]=0,b[8]=d,b[9]=0,b[10]=c,b[11]=0,b[12]=0,b[13]=0,b[14]=0,b[15]=1,b}function u(a,b,c){c=c||new E(16);var d=a[0],e=a[1],f=a[2],g=a[3],h=a[8],i=a[9],j=a[10],k=a[11],l=Math.cos(b),m=Math.sin(b);return c[0]=l*d-m*h,c[1]=l*e-m*i,c[2]=l*f-m*j,c[3]=l*g-m*k,c[8]=l*h+m*d,c[9]=l*i+m*e,c[10]=l*j+m*f,c[11]=l*k+m*g,a!==c&&(c[4]=a[4],c[5]=a[5],c[6]=a[6],c[7]=a[7],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]),c}function v(a,b){b=b||new E(16);var c=Math.cos(a),d=Math.sin(a);return b[0]=c,b[1]=d,b[2]=0,b[3]=0,b[4]=-d,b[5]=c,b[6]=0,b[7]=0,b[8]=0,b[9]=0,b[10]=1,b[11]=0,b[12]=0,b[13]=0,b[14]=0,b[15]=1,b}function w(a,b,c){c=c||new E(16);var d=a[0],e=a[1],f=a[2],g=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=Math.cos(b),m=Math.sin(b);return c[0]=l*d+m*h,c[1]=l*e+m*i,c[2]=l*f+m*j,c[3]=l*g+m*k,c[4]=l*h-m*d,c[5]=l*i-m*e,c[6]=l*j-m*f,c[7]=l*k-m*g,a!==c&&(c[8]=a[8],c[9]=a[9],c[10]=a[10],c[11]=a[11],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]),c}function x(a,b,c){c=c||new E(16);var d=a[0],e=a[1],f=a[2],g=Math.sqrt(d*d+e*e+f*f);d/=g,e/=g,f/=g;var h=d*d,i=e*e,j=f*f,k=Math.cos(b),l=Math.sin(b),m=1-k;return c[0]=h+(1-h)*k,c[1]=d*e*m+f*l,c[2]=d*f*m-e*l,c[3]=0,c[4]=d*e*m-f*l,c[5]=i+(1-i)*k,c[6]=e*f*m+d*l,c[7]=0,c[8]=d*f*m+e*l,c[9]=e*f*m-d*l,c[10]=j+(1-j)*k,c[11]=0,c[12]=0,c[13]=0,c[14]=0,c[15]=1,c}function y(a,b,c,d){d=d||new E(16);var e=b[0],f=b[1],g=b[2],h=Math.sqrt(e*e+f*f+g*g);e/=h,f/=h,g/=h;var i=e*e,j=f*f,k=g*g,l=Math.cos(c),m=Math.sin(c),n=1-l,o=i+(1-i)*l,p=e*f*n+g*m,q=e*g*n-f*m,r=e*f*n-g*m,s=j+(1-j)*l,t=f*g*n+e*m,u=e*g*n+f*m,v=f*g*n-e*m,w=k+(1-k)*l,x=a[0],y=a[1],z=a[2],A=a[3],B=a[4],C=a[5],D=a[6],F=a[7],G=a[8],H=a[9],I=a[10],J=a[11];return d[0]=o*x+p*B+q*G,d[1]=o*y+p*C+q*H,d[2]=o*z+p*D+q*I,d[3]=o*A+p*F+q*J,d[4]=r*x+s*B+t*G,d[5]=r*y+s*C+t*H,d[6]=r*z+s*D+t*I,d[7]=r*A+s*F+t*J,d[8]=u*x+v*B+w*G,d[9]=u*y+v*C+w*H,d[10]=u*z+v*D+w*I,d[11]=u*A+v*F+w*J,a!==d&&(d[12]=a[12],d[13]=a[13],d[14]=a[14],d[15]=a[15]),d}function z(a,b){return b=b||new E(16),b[0]=a[0],b[1]=0,b[2]=0,b[3]=0,b[4]=0,b[5]=a[1],b[6]=0,b[7]=0,b[8]=0,b[9]=0,b[10]=a[2],b[11]=0,b[12]=0,b[13]=0,b[14]=0,b[15]=1,b}function A(a,b,c){c=c||new E(16);var d=b[0],e=b[1],f=b[2];return c[0]=d*a[0],c[1]=d*a[1],c[2]=d*a[2],c[3]=d*a[3],c[4]=e*a[4],c[5]=e*a[5],c[6]=e*a[6],c[7]=e*a[7],c[8]=f*a[8],c[9]=f*a[9],c[10]=f*a[10],c[11]=f*a[11],a!==c&&(c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]),a}function B(b,c,d){d=d||a.create();var e=c[0],f=c[1],g=c[2],h=e*b[3]+f*b[7]+g*b[11]+b[15];return d[0]=(e*b[0]+f*b[4]+g*b[8]+b[12])/h,d[1]=(e*b[1]+f*b[5]+g*b[9]+b[13])/h,d[2]=(e*b[2]+f*b[6]+g*b[10]+b[14])/h,d}function C(b,c,d){d=d||a.create();var e=c[0],f=c[1],g=c[2];return d[0]=e*b[0]+f*b[4]+g*b[8],d[1]=e*b[1]+f*b[5]+g*b[9],d[2]=e*b[2]+f*b[6]+g*b[10],d}function D(b,c,d){d=d||a.create();var e=g(b),f=c[0],h=c[1],i=c[2];return d[0]=f*e[0]+h*e[1]+i*e[2],d[1]=f*e[4]+h*e[5]+i*e[6],d[2]=f*e[8]+h*e[9]+i*e[10],d}var E=Float32Array,F=a.create(),G=a.create(),H=a.create();return{axisRotate:y,axisRotation:x,create:e,copy:d,frustum:n,getAxis:k,getTranslation:j,identity:e,inverse:g,lookAt:o,multiply:h,negate:c,ortho:m,perspective:l,rotateX:s,rotateY:u,rotateZ:w,rotationX:r,rotationY:t,rotationZ:v,scale:A,scaling:z,setDefaultType:b,setTranslation:i,transformDirection:C,transformNormal:D,transformPoint:B,translate:q,translation:p,transpose:f}}),c("twgl/primitives",["./twgl","./m4","./v3"],function(a,b,c){function d(a,b){var c=0;return a.push=function(){for(var b=0;b<arguments.length;++b){var d=arguments[b];if(d instanceof Array||d.buffer&&d.buffer instanceof ArrayBuffer)for(var e=0;e<d.length;++e)a[c++]=d[e];else a[c++]=d}},a.reset=function(a){c=a||0},a.numComponents=b,Object.defineProperty(a,"numElements",{get:function(){return this.length/this.numComponents|0}}),a}function e(a,b,c){var e=c||Float32Array;return d(new e(a*b),a)}function f(a){return"indices"!==a}function g(a){function b(b){for(var f=a[b],h=f.numComponents,i=e(h,g,f.constructor),j=0;g>j;++j)for(var k=c[j],l=k*h,m=0;h>m;++m)i.push(f[l+m]);d[b]=i}var c=a.indices,d={},g=c.length;return Object.keys(a).filter(f).forEach(b),d}function h(a){if(a.indices)throw"can't flatten normals of indexed vertices. deindex them first";for(var b=a.normal,c=b.length,d=0;c>d;d+=9){var e=b[d+0],f=b[d+1],g=b[d+2],h=b[d+3],i=b[d+4],j=b[d+5],k=b[d+6],l=b[d+7],m=b[d+8],n=e+h+k,o=f+i+l,p=g+j+m,q=Math.sqrt(n*n+o*o+p*p);n/=q,o/=q,p/=q,b[d+0]=n,b[d+1]=o,b[d+2]=p,b[d+3]=n,b[d+4]=o,b[d+5]=p,b[d+6]=n,b[d+7]=o,b[d+8]=p}return a}function i(a,b,c){for(var d=a.length,e=new Float32Array(3),f=0;d>f;f+=3)c(b,[a[f],a[f+1],a[f+2]],e),a[f]=e[0],a[f+1]=e[1],a[f+2]=e[2]}function j(a,b,d){d=d||c.create();var e=b[0],f=b[1],g=b[2];return d[0]=e*a[0]+f*a[1]+g*a[2],d[1]=e*a[4]+f*a[5]+g*a[6],d[2]=e*a[8]+f*a[9]+g*a[10],d}function k(a,c){return i(a,c,b.transformDirection),a}function l(a,c){return i(a,b.inverse(c),j),a}function m(a,c){return i(a,c,b.transformPoint),a}function n(a,b){return Object.keys(a).forEach(function(c){var d=a[c];c.indexOf("pos")>=0?m(d,b):c.indexOf("tan")>=0||c.indexOf("binorm")>=0?k(d,b):c.indexOf("norm")>=0&&l(d,b)}),a}function o(a,b,c){return a=a||2,b=b||0,c=c||0,a*=.5,{position:{numComponents:2,data:[b+-1*a,c+-1*a,b+1*a,c+-1*a,b+-1*a,c+1*a,b+1*a,c+1*a]},normal:[0,0,1,0,0,1,0,0,1,0,0,1],texcoord:[0,0,1,0,0,1,1,1],indices:[0,1,2,2,1,3]}}function p(a,c,d,f,g){a=a||1,c=c||1,d=d||1,f=f||1,g=g||b.identity();for(var h=(d+1)*(f+1),i=e(3,h),j=e(3,h),k=e(2,h),l=0;f>=l;l++)for(var m=0;d>=m;m++){var o=m/d,p=l/f;i.push(a*o-.5*a,0,c*p-.5*c),j.push(0,1,0),k.push(o,p)}for(var q=d+1,r=e(3,d*f*2,Uint16Array),l=0;f>l;l++)for(var m=0;d>m;m++)r.push((l+0)*q+m,(l+1)*q+m,(l+0)*q+m+1),r.push((l+1)*q+m,(l+1)*q+m+1,(l+0)*q+m+1);var s=n({position:i,normal:j,texcoord:k,indices:r},g);return s}function q(a,b,c,d,f,g,h){if(0>=b||0>=c)throw Error("subdivisionAxis and subdivisionHeight must be > 0");d=d||0,f=f||Math.PI,g=g||0,h=h||2*Math.PI;for(var i=f-d,j=h-g,k=(b+1)*(c+1),l=e(3,k),m=e(3,k),n=e(2,k),o=0;c>=o;o++)for(var p=0;b>=p;p++){var q=p/b,r=o/c,s=j*q,t=i*r,u=Math.sin(s),v=Math.cos(s),w=Math.sin(t),x=Math.cos(t),y=v*w,z=x,A=u*w;l.push(a*y,a*z,a*A),m.push(y,z,A),n.push(1-q,r)}for(var B=b+1,C=e(3,b*c*2,Uint16Array),p=0;b>p;p++)for(var o=0;c>o;o++)C.push((o+0)*B+p,(o+0)*B+p+1,(o+1)*B+p),C.push((o+1)*B+p,(o+0)*B+p+1,(o+1)*B+p+1);return{position:l,normal:m,texcoord:n,indices:C}}function r(a){a=a||1;for(var b=a/2,c=[[-b,-b,-b],[+b,-b,-b],[-b,+b,-b],[+b,+b,-b],[-b,-b,+b],[+b,-b,+b],[-b,+b,+b],[+b,+b,+b]],d=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],f=[[1,0],[0,0],[0,1],[1,1]],g=24,h=e(3,g),i=e(3,g),j=e(2,g),k=e(3,12,Uint16Array),l=0;6>l;++l){
for(var m=D[l],n=0;4>n;++n){var o=c[m[n]],p=d[l],q=f[n];h.push(o),i.push(p),j.push(q)}var r=4*l;k.push(r+0,r+1,r+2),k.push(r+0,r+2,r+3)}return{position:h,normal:i,texcoord:j,indices:k}}function s(a,b,c,d,f,g,h){if(3>d)throw Error("radialSubdivisions must be 3 or greater");if(1>f)throw Error("verticalSubdivisions must be 1 or greater");for(var i=void 0===g?!0:g,j=void 0===h?!0:h,k=(i?2:0)+(j?2:0),l=(d+1)*(f+1+k),m=e(3,l),n=e(3,l),o=e(2,l),p=e(3,d*(f+k)*2,Uint16Array),q=d+1,r=Math.atan2(a-b,c),s=Math.cos(r),t=Math.sin(r),u=i?-2:0,v=f+(j?2:0),w=u;v>=w;++w){var x,y=w/f,z=c*y;0>w?(z=0,y=1,x=a):w>f?(z=c,y=1,x=b):x=a+(b-a)*(w/f),(-2===w||w===f+2)&&(x=0,y=0),z-=c/2;for(var A=0;q>A;++A){var B=Math.sin(A*Math.PI*2/d),C=Math.cos(A*Math.PI*2/d);m.push(B*x,z,C*x),n.push(0>w||w>f?0:B*s,0>w?-1:w>f?1:t,0>w||w>f?0:C*s),o.push(A/d,1-y)}}for(var w=0;f+k>w;++w)for(var A=0;d>A;++A)p.push(q*(w+0)+0+A,q*(w+0)+1+A,q*(w+1)+1+A),p.push(q*(w+0)+0+A,q*(w+1)+1+A,q*(w+1)+0+A);return{position:m,normal:n,texcoord:o,indices:p}}function t(a,b){b=b||[];for(var c=[],d=0;d<a.length;d+=4){var e=a[d],f=a.slice(d+1,d+4);f.push.apply(f,b);for(var g=0;e>g;++g)c.push.apply(c,f)}return c}function u(){var a=[0,0,0,0,150,0,30,0,0,0,150,0,30,150,0,30,0,0,30,0,0,30,30,0,100,0,0,30,30,0,100,30,0,100,0,0,30,60,0,30,90,0,67,60,0,30,90,0,67,90,0,67,60,0,0,0,30,30,0,30,0,150,30,0,150,30,30,0,30,30,150,30,30,0,30,100,0,30,30,30,30,30,30,30,100,0,30,100,30,30,30,60,30,67,60,30,30,90,30,30,90,30,67,60,30,67,90,30,0,0,0,100,0,0,100,0,30,0,0,0,100,0,30,0,0,30,100,0,0,100,30,0,100,30,30,100,0,0,100,30,30,100,0,30,30,30,0,30,30,30,100,30,30,30,30,0,100,30,30,100,30,0,30,30,0,30,60,30,30,30,30,30,30,0,30,60,0,30,60,30,30,60,0,67,60,30,30,60,30,30,60,0,67,60,0,67,60,30,67,60,0,67,90,30,67,60,30,67,60,0,67,90,0,67,90,30,30,90,0,30,90,30,67,90,30,30,90,0,67,90,30,67,90,0,30,90,0,30,150,30,30,90,30,30,90,0,30,150,0,30,150,30,0,150,0,0,150,30,30,150,30,0,150,0,30,150,30,30,150,0,0,0,0,0,0,30,0,150,30,0,0,0,0,150,30,0,150,0],b=[.22,.19,.22,.79,.34,.19,.22,.79,.34,.79,.34,.19,.34,.19,.34,.31,.62,.19,.34,.31,.62,.31,.62,.19,.34,.43,.34,.55,.49,.43,.34,.55,.49,.55,.49,.43,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0],c=t([18,0,0,1,18,0,0,-1,6,0,1,0,6,1,0,0,6,0,-1,0,6,1,0,0,6,0,1,0,6,1,0,0,6,0,-1,0,6,1,0,0,6,0,-1,0,6,-1,0,0]),d=t([18,200,70,120,18,80,70,200,6,70,200,210,6,200,200,70,6,210,100,70,6,210,160,70,6,70,180,210,6,100,70,210,6,76,210,100,6,140,210,80,6,90,130,110,6,160,160,220],[255]),f=a.length/3,g={position:e(3,f),texcoord:e(2,f),normal:e(3,f),color:e(4,f,Uint8Array),indices:e(3,f/3,Uint16Array)};g.position.push(a),g.texcoord.push(b),g.normal.push(c),g.color.push(d);for(var h=0;f>h;++h)g.indices.push(h);return g}function v(a,b,d,f,g,h,i){function j(a,b,c){return a+(b-a)*c}function k(b,d,e,i,k,l){for(var o=0;g>=o;o++){var s=d/(m-1),t=o/g,u=2*(s-.5),v=(h+t*n)*Math.PI,w=Math.sin(v),x=Math.cos(v),y=j(a,b,w),z=u*f,A=x*a,B=w*y;p.push(z,A,B);var C=c.add(c.multiply([0,w,x],e),i);q.push(C),r.push(s*k+l,t)}}function l(a,b){for(var c=0;g>c;++c)u.push(a+c+0,a+c+1,b+c+0),u.push(a+c+1,b+c+1,b+c+0)}if(0>=g)throw Error("subdivisionDown must be > 0");h=h||0,i=i||1;for(var m=2,n=i-h,o=2*(g+1)*(2+m),p=e(3,o),q=e(3,o),r=e(2,o),s=0;m>s;s++){var t=2*(s/(m-1)-.5);k(b,s,[1,1,1],[0,0,0],1,0),k(b,s,[0,0,0],[t,0,0],0,0),k(d,s,[1,1,1],[0,0,0],1,0),k(d,s,[0,0,0],[t,0,0],0,1)}var u=e(3,2*g*(2+m),Uint16Array),v=g+1;return l(0*v,4*v),l(5*v,7*v),l(6*v,2*v),l(3*v,1*v),{position:p,normal:q,texcoord:r,indices:u}}function w(a,b,c,d,e,f){return s(a,a,b,c,d,e,f)}function x(a,b,c,d,f,g){if(3>c)throw Error("radialSubdivisions must be 3 or greater");if(3>d)throw Error("verticalSubdivisions must be 3 or greater");f=f||0,g=g||2*Math.PI,range=g-f;for(var h=c+1,i=d+1,j=h*i,k=e(3,j),l=e(3,j),m=e(2,j),n=e(3,c*d*2,Uint16Array),o=0;i>o;++o)for(var p=o/d,q=p*Math.PI*2,r=Math.sin(q),s=a+r*b,t=Math.cos(q),u=t*b,v=0;h>v;++v){var w=v/c,x=f+w*range,y=Math.sin(x),z=Math.cos(x),A=y*s,B=z*s,C=y*r,D=z*r;k.push(A,u,B),l.push(C,t,D),m.push(w,1-p)}for(var o=0;d>o;++o)for(var v=0;c>v;++v){var E=1+v,F=1+o;n.push(h*o+v,h*F+v,h*o+E),n.push(h*F+v,h*F+E,h*o+E)}return{position:k,normal:l,texcoord:m,indices:n}}function y(a,b,c,d,f){if(3>b)throw Error("divisions must be at least 3");c=c?c:1,f=f?f:1,d=d?d:0;for(var g=(b+1)*(c+1),h=e(3,g),i=e(3,g),j=e(2,g),k=e(3,c*b*2,Uint16Array),l=0,m=a-d,n=0;c>=n;++n){for(var o=d+m*Math.pow(n/c,f),p=0;b>=p;++p){var q=2*Math.PI*p/b,r=o*Math.cos(q),s=o*Math.sin(q);if(h.push(r,0,s),i.push(0,1,0),j.push(1-p/b,n/c),n>0&&p!==b){var t=l+(p+1),u=l+p,v=l+p-b,w=l+(p+1)-b;k.push(t,u,v),k.push(t,v,w)}}l+=b+1}return{position:h,normal:i,texcoord:j,indices:k}}function z(a){return Math.random()*a|0}function A(a,b){b=b||{};var c=a.position.numElements,d=e(4,c,Uint8Array),f=b.rand||function(a,b){return 3>b?z(256):255};if(a.color=d,a.indices)for(var g=0;c>g;++g)d.push(f(g,0),f(g,1),f(g,2),f(g,3));else for(var h=b.vertsPerColor||3,i=c/h,g=0;i>g;++g)for(var j=[f(g,0),f(g,1),f(g,2),f(g,3)],k=0;h>k;++k)d.push(j);return a}function B(b){return function(c){var d=b.apply(this,Array.prototype.slice.call(arguments,1));return a.createBuffersFromArrays(c,d)}}function C(b){return function(c){var d=b.apply(null,Array.prototype.slice.call(arguments,1));return a.createBufferInfoFromArrays(c,d)}}var D=[[3,7,5,1],[6,2,0,4],[6,7,3,2],[0,1,5,4],[7,6,4,5],[2,3,1,0]];return{create3DFBufferInfo:C(u),create3DFBuffers:B(u),create3DFVertices:u,createAugmentedTypedArray:e,createCubeBufferInfo:C(r),createCubeBuffers:B(r),createCubeVertices:r,createPlaneBufferInfo:C(p),createPlaneBuffers:B(p),createPlaneVertices:p,createSphereBufferInfo:C(q),createSphereBuffers:B(q),createSphereVertices:q,createTruncatedConeBufferInfo:C(s),createTruncatedConeBuffers:B(s),createTruncatedConeVertices:s,createXYQuadBufferInfo:C(o),createXYQuadBuffers:B(o),createXYQuadVertices:o,createCresentBufferInfo:C(v),createCresentBuffers:B(v),createCresentVertices:v,createCylinderBufferInfo:C(w),createCylinderBuffers:B(w),createCylinderVertices:w,createTorusBufferInfo:C(x),createTorusBuffers:B(x),createTorusVertices:x,createDiscBufferInfo:C(y),createDiscBuffers:B(y),createDiscVertices:y,deindexVertices:g,flattenNormals:h,makeRandomVertexColors:A,reorientDirections:k,reorientNormals:l,reorientPositions:m,reorientVertices:n}}),c("main",["twgl/twgl","twgl/m4","twgl/v3","twgl/primitives"],function(a,b,c,d){return a.m4=b,a.v3=c,a.primitives=d,a}),b(["main"],function(a){return a},void 0,!0),c("build/js/twgl-includer-full",function(){}),b("main")});
},{}],2:[function(require,module,exports){
module.exports.mulMatrixMatrix4 = function(a, b, dst) {
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[ 4 + 0];
  var a11 = a[ 4 + 1];
  var a12 = a[ 4 + 2];
  var a13 = a[ 4 + 3];
  var a20 = a[ 8 + 0];
  var a21 = a[ 8 + 1];
  var a22 = a[ 8 + 2];
  var a23 = a[ 8 + 3];
  var a30 = a[12 + 0];
  var a31 = a[12 + 1];
  var a32 = a[12 + 2];
  var a33 = a[12 + 3];
  var b00 = b[0];
  var b01 = b[1];
  var b02 = b[2];
  var b03 = b[3];
  var b10 = b[ 4 + 0];
  var b11 = b[ 4 + 1];
  var b12 = b[ 4 + 2];
  var b13 = b[ 4 + 3];
  var b20 = b[ 8 + 0];
  var b21 = b[ 8 + 1];
  var b22 = b[ 8 + 2];
  var b23 = b[ 8 + 3];
  var b30 = b[12 + 0];
  var b31 = b[12 + 1];
  var b32 = b[12 + 2];
  var b33 = b[12 + 3];
  dst[ 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  dst[ 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  dst[ 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  dst[ 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  dst[ 4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  dst[ 5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  dst[ 6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  dst[ 7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  dst[ 8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  dst[ 9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
  return dst;
};
},{}],13:[function(require,module,exports){

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
},{}],12:[function(require,module,exports){
var util      = require('util')
var SlotList  = require('./slotlist')
var OwnerList = require('./ownerlist')


function Allocation(max) {
  this.slots  = new SlotList(max);
  this.owners = new OwnerList();
  
  this.members  = [];
  this.indexes  = {};
  this.onChange = this.onChange.bind(this)
}
  

Allocation.nextId = 0,
Allocation.deallocate = function (o) {
  var al = o.al, 
      id = o.id, 
      items = o.items, 
      l = items.length;

  for(var i=0;i<l;i++)
    al.remove(items[i], id);
}

Allocation.prototype.maxSlots = function () {
  return this.slots.max;
}

Allocation.prototype.canAccommodate = function (items) {
  var excess = items.length - this.slots.vacancies();
  if (excess <= 0)
    return true;
  for (var i=0; i<items.length && excess > 0; i++) {
    if (this.hasItem(items[i])) {
      excess--;
    }
  }
  return excess <= 0;
}

Allocation.prototype.hasItem = function (item) {
  return item.id in this.indexes;
}

Allocation.prototype.indexFor = function(item) {
  if (!(item.id in this.indexes))
    throw item.id + " not allocated";
  return this.indexes[item.id];
}

Allocation.prototype.add = function (item, owner, fn) {
  var index;
  if (this.hasItem(item)) {
    index = this.indexFor(item);
  } else {
    index = this.slots.current();
    this.members[index] = item;
    this.indexes[item.id] = index;
    this.slots.increment();
    this.write(index, fn());
    item.on && item.on('change', this.onChange)
  }
  this.owners.add(index, owner);
  return index;
}

Allocation.prototype.onChange = function (item) {
  if (!isNaN(this.indexes[item.id]))
    this.write(this.indexes[item.id], item.getValue());
}

Allocation.prototype.remove = function (item, owner) {
  if (this.hasItem(item)) {
    var index = this.indexFor(item);
    if (this.owners.remove(index, owner)){
      delete this.members[index];
      delete this.indexes[item.id];
      item.off && item.off('change', this.onChange)
      this.slots.decrement(index);
    }
  }
}

Allocation.prototype.allocate = function (items) {
  items = items.slice();
  var me = this;
  var id = Allocation.nextId ++;
  $.each(items, function (i, item) {
    me.add(item, id);
  });
  return {
    al    : this,
    items : items,
    id    : id
  };
}

var FloatAllocation = Allocation.Float = function (max, numComponents) {
  Allocation.call(this, max)
  this.numComponents   = numComponents
  this.buffer          = new Float32Array(numComponents * max);
}
util.inherits(FloatAllocation, Allocation)


FloatAllocation.prototype.write = function(index, b){
  index = index * this.numComponents
  for(var i=0; i<b.length; i++){
    this.buffer[i + index] = b[i]
  }
}

module.exports = Allocation
},{"./ownerlist":21,"./slotlist":28,"util":9}],28:[function(require,module,exports){
function SlotList(max) {
  this.max         = max;
  this.count       = 0;
  this.next        = 0;
  this.available   = [];
}

SlotList.prototype.current = function () {
  if (this.available.length) {
    return this.available[0];
  }
  return this.next;
}

SlotList.prototype.increment = function () {
  if (this.available.length) {
    this.available.shift();
  } else {
    this.next ++;
  }
  this.count ++;
}

SlotList.prototype.decrement = function (index) {
  this.available.push(index);
  this.count --;
}

SlotList.prototype.vacancies = function () {
  return this.available.length + this.max - this.count;
}

module.exports = SlotList
},{}],21:[function(require,module,exports){
function OwnerList() {
  this.data = {};
}

OwnerList.prototype.add = function (item, owner) {
  var d = this.data;
  if(!d[item])
     d[item] = {count:0, owners:{}};
   d[item].owners[owner]=owner;
   d[item].count++;
}

OwnerList.prototype.remove = function (item, owner) {
  var d = this.data;
  if(d[item] && d[item].owners[owner]) {
    delete d[item].owners[owner];
    d[item].count --;
    return d[item].count < 1;
  }
  return true;
}

module.exports = OwnerList
},{}],9:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
},{"./support/isBuffer":8,"_process":7,"inherits":6}],8:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGtjcC1nbC5qcyIsInNyYy93YXNkX2tleV9iaW5kaW5nLmpzIiwic3JjL3RleHR1cmUuanMiLCJzcmMvc2hhZGVycy5qcyIsInNyYy9zaGFkZXIuanMiLCJzcmMvc2NyZWVuLmpzIiwic3JjL3BsYXRlLmpzIiwic3JjL21vZGVsLmpzIiwic3JjL2luZGljZXNfYXR0cmlidXRlLmpzIiwic3JjL2dlb2Rlc2ljLmpzIiwibGliL3F1YXRlcm5pb25zLmpzIiwibGliL3NsZXJwLmpzIiwic3JjL2ZyYW1lcmF0ZS5qcyIsInNyYy9lbnZpcm9ubWVudC5qcyIsInNyYy9yZW5kZXJfc2V0LmpzIiwic3JjL3JlbmRlcmFibGUuanMiLCJzcmMvYWNjb21tb2RhdG9yLmpzIiwic3JjL2NhbWVyYS5qcyIsInNyYy90cmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvZXZlbnRpZnkvbGliL2V2ZW50aWZ5LmpzIiwibGliL3R3Z2wuanMiLCJib3dlcl9jb21wb25lbnRzL3R3Z2wuanMvZGlzdC90d2dsLWZ1bGwubWluLmpzIiwibGliL2NvbHVtbk1ham9yLmpzIiwic3JjL2F0dHJpYnV0ZS5qcyIsInNyYy9hbGxvY2F0aW9uLmpzIiwic3JjL3Nsb3RsaXN0LmpzIiwic3JjL293bmVybGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9XQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFNjcmVlbiAgICAgICAgICAgPSByZXF1aXJlKCcuL3NjcmVlbicpLFxuICAgIEZyYW1lUmF0ZSAgICAgICAgPSByZXF1aXJlKCcuL2ZyYW1lcmF0ZScpLFxuICAgIGNhbWVyYSAgICAgICAgICAgPSByZXF1aXJlKCcuL2NhbWVyYScpLFxuICAgIFdhc2RLZXlCaW5kaW5nICAgPSByZXF1aXJlKCcuL3dhc2Rfa2V5X2JpbmRpbmcnKVxuXG5cbmZ1bmN0aW9uIERrY3BHbChvcHRpb25zKSB7XG4gIHRoaXMuc2NyZWVuID0gbmV3IFNjcmVlbigpXG4gIFxuICBpZiAob3B0aW9ucy5mcmFtZVJhdGUpIHtcbiAgICB2YXIgZnJhbWVSYXRlID0gRnJhbWVSYXRlKClcbiAgICB2YXIgZWxlbWVudCA9IG9wdGlvbnMuZnJhbWVSYXRlLmVsZW1lbnRcbiAgICB0aGlzLnNjcmVlbi5vbignZnJhbWUnLCBmdW5jdGlvbiAoZGVsdGEpe1xuICAgICAgZnJhbWVSYXRlKGRlbHRhKS5sb2cob3B0aW9ucy5mcmFtZVJhdGUuZnJlcXVlbmN5IHx8IDEyMCwgZnVuY3Rpb24gKHJhdGUpIHtcbiAgICAgICAgdmFyIHRleHQgPSAnRlBTOiAnICsgTWF0aC5mbG9vcihyYXRlICogMTAwKSAvIDEwMFxuICAgICAgICBlbGVtZW50LmlubmVyVGV4dCA9IHRleHRcbiAgICAgIH0pO1xuICAgIH0pXG4gIH1cbiAgXG4gIHRoaXMuc2NyZWVuLmluaXQob3B0aW9ucy5jYW52YXMsIG9wdGlvbnMuaW5pdCB8fCBmdW5jdGlvbiAoZ2wpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZW5hYmxlIDogW2dsLkNVTExfRkFDRSwgZ2wuREVQVEhfVEVTVF0sXG4gICAgICBjdWxsRmFjZSA6IGdsLkJBQ0tcbiAgICB9XG4gIH0pXG5cbiAgdGhpcy5jYW1lcmEgPSBuZXcgY2FtZXJhLkJhc2ljQ2FtZXJhKHRoaXMuc2NyZWVuLndpZHRoKCksIHRoaXMuc2NyZWVuLmhlaWdodCgpKS5zZXRGT1YoNjApO1xuXG4gIGlmIChvcHRpb25zLndhc2QpIHtcbiAgICB2YXIga2IgPSBuZXcgV2FzZEtleUJpbmRpbmcoKVxuICAgICAgLmJpbmRLZXlFdmVudHMob3B0aW9ucy53YXNkLmRvY3VtZW50LCBmYWxzZSk7XG5cbiAgICB2YXIgZGVsdGEgPSBvcHRpb25zLndhc2QuZGVsdGEgfHwgLjA1O1xuICAgIHZhciB0aGV0YSA9IG9wdGlvbnMud2FzZC50aGV0YSB8fCAtTWF0aC5QSSAvIDEyMDtcbiAgICB0aGlzLnNjcmVlbi5vbignZnJhbWUnLCBmdW5jdGlvbiAoZWxhcHNlZCkge1xuICAgICAgdmFyIGYgPSBlbGFwc2VkIC8gMTAwMCAqIDYwO1xuICAgICAgdmFyIGFjdGlvbnMgPSBrYi5nZXRBY3Rpb25zKCk7XG4gICAgICBpZiAoYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAga2IuYXBwbHlBY3Rpb25zKHRoaXMuY2FtZXJhLCBhY3Rpb25zLCBkZWx0YSAqIGYsIHRoZXRhICogZilcbiAgICAgICAgdGhpcy5zY3JlZW4uYmVnaW5GcmFtZVJlbmRlcmluZyhmYWxzZSlcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpXG4gIH1cblxuXG59XG5cbkRrY3BHbC5TY3JlZW4gICAgICAgICAgICA9IFNjcmVlblxuRGtjcEdsLkZyYW1lUmF0ZSAgICAgICAgID0gRnJhbWVSYXRlXG5Ea2NwR2wuY2FtZXJhICAgICAgICAgICAgPSBjYW1lcmFcbkRrY3BHbC5XYXNkS2V5QmluZGluZyAgICA9IFdhc2RLZXlCaW5kaW5nXG5cbkRrY3BHbC5BbGxvY2F0aW9uICAgICAgICA9IHJlcXVpcmUoJy4vYWxsb2NhdGlvbicpXG5Ea2NwR2wuQXR0cmlidXRlICAgICAgICAgPSByZXF1aXJlKCcuL2F0dHJpYnV0ZScpXG5Ea2NwR2wuRW52aXJvbm1lbnQgICAgICAgPSByZXF1aXJlKCcuL2Vudmlyb25tZW50JylcbkRrY3BHbC5JbmRpY2VzQXR0cmlidXRlICA9IHJlcXVpcmUoJy4vaW5kaWNlc19hdHRyaWJ1dGUnKVxuRGtjcEdsLk1vZGVsICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9tb2RlbCcpXG5Ea2NwR2wuUGxhdGUgICAgICAgICAgICAgPSByZXF1aXJlKCcuL3BsYXRlJylcbkRrY3BHbC5SZW5kZXJhYmxlICAgICAgICA9IHJlcXVpcmUoJy4vcmVuZGVyYWJsZScpXG5Ea2NwR2wuUmVuZGVyU2V0ICAgICAgICAgPSByZXF1aXJlKCcuL3JlbmRlcl9zZXQnKVxuRGtjcEdsLlNoYWRlciAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFkZXInKVxuRGtjcEdsLnNoYWRlcnMgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFkZXJzJylcbkRrY3BHbC5UZXh0dXJlICAgICAgICAgICA9IHJlcXVpcmUoJy4vdGV4dHVyZScpXG5Ea2NwR2wuVHJhbnNmb3JtICAgICAgICAgPSByZXF1aXJlKCcuL3RyYW5zZm9ybScpXG5Ea2NwR2wuZ2VvZGVzaWMgICAgICAgICAgPSByZXF1aXJlKCcuL2dlb2Rlc2ljJylcblxubW9kdWxlLmV4cG9ydHMgPSBEa2NwR2wiLCJ2YXIgZXZlbnRpZnkgPSByZXF1aXJlKCdldmVudGlmeScpXG5cbnZhciBXYXNkS2V5QmluZGluZyA9IGZ1bmN0aW9uICgpIHtcblxuICB0aGlzLmlzRG93biA9IHt9XG4gIHRoaXMubWFwcGluZyA9IHtcbiAgICAnNjknOiAnbW92ZUJ5WScsXG4gICAgJzg3JzogJ21vdmVCeU5lZ1onLFxuICAgICc2NSc6ICdtb3ZlQnlOZWdYJyxcbiAgICAnNjgnOiAnbW92ZUJ5WCcsXG4gICAgJzgzJzogJ21vdmVCeVonLFxuICAgICc2Nyc6ICdtb3ZlQnlOZWdZJyxcbiAgICAnMzcnOiAncm90YXRlQnlZJyxcbiAgICAnMzgnOiAncm90YXRlQnlYJyxcbiAgICAnMzknOiAncm90YXRlQnlOZWdZJyxcbiAgICAnNDAnOiAncm90YXRlQnlOZWdYJ1xuICB9XG59XG5cbldhc2RLZXlCaW5kaW5nLnByb3RvdHlwZS5nZXRBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYWN0aW9ucyA9IFtdO1xuICBmb3IodmFyIGsgaW4gdGhpcy5tYXBwaW5nKSB7XG4gICAgaWYgKHRoaXMuaXNEb3duW2tdKSB7XG4gICAgICBhY3Rpb25zLnB1c2godGhpcy5tYXBwaW5nW2tdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFjdGlvbnM7XG59XG5cbldhc2RLZXlCaW5kaW5nLnByb3RvdHlwZS5iaW5kS2V5RXZlbnRzID0gZnVuY3Rpb24oZG9jdW1lbnQsIHRyaWdnZXJFdmVudHMpIHtcbiAgdmFyIG1lID0gdGhpcztcbiAgdmFyIHRpbWVvdXQ7XG4gIFxuICBldmVudGlmeS5lbmFibGUodGhpcylcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgIGlmKGUua2V5Q29kZSA+PSAzNyAmJiBlLmtleUNvZGUgPD0gNDApXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXG4gICAgXG4gICAgaWYoKGUua2V5Q29kZSA+PSAzNyAmJiBlLmtleUNvZGUgPD0gNDApXG4gICAgICB8fCAoZS5rZXlDb2RlID49IDY1ICYmIGUua2V5Q29kZSA8PSA5MCkpe1xuICAgICAgICB2YXIgd2FzRG93biA9IG1lLmlzRG93bltlLmtleUNvZGVdO1xuICAgICAgICBtZS5pc0Rvd25bZS5rZXlDb2RlXSA9IHRydWU7XG4gICAgICBcbiAgICAgIGlmICh0cmlnZ2VyRXZlbnRzICYmICF3YXNEb3duKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGFjdGlvbnMgPSBtZS5nZXRBY3Rpb25zKCk7XG4gICAgICAgICAgaWYgKGFjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBtZS50cmlnZ2VyKCdyZXBlYXQnLCB7YWN0aW9uczogYWN0aW9uc30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApO1xuICAgICAgfVxuICAgICAgXG4gICAgfVxuICB9KTtcbiAgXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSl7XG4gICAgaWYoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MClcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZigoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MClcbiAgICAgIHx8IChlLmtleUNvZGUgPj0gNjUgJiYgZS5rZXlDb2RlIDw9IDkwKSl7XG4gICAgICAgIG1lLmlzRG93bltlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfVxuICB9KTtcbiAgXG4gIHJldHVybiB0aGlzXG59XG5cbldhc2RLZXlCaW5kaW5nLnByb3RvdHlwZS5hcHBseUFjdGlvbnMgPSBmdW5jdGlvbiAoY2FtZXJhLCBhY3Rpb25zLCBkZWx0YSwgdGhldGEpIHtcbiAgZm9yICh2YXIgaSBpbiBhY3Rpb25zKSB7XG4gICAgY2FtZXJhW2FjdGlvbnNbaV1dKGRlbHRhLCB0aGV0YSwgLWNhbWVyYS5nZXRSb3RhdGVZKCkpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2FzZEtleUJpbmRpbmciLCJ2YXIgdHdnbCA9IHJlcXVpcmUoJy4uL2xpYi90d2dsJylcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpXG5cbmZ1bmN0aW9uIFRleHR1cmUoZ2wsIGltZykge1xuICB0aGlzLmdsICA9IGdsXG4gIHRoaXMuaW1nID0gaW1nXG59XG5UZXh0dXJlLnByb3RvdHlwZS5nZXRUZXh0dXJlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZ2wgPSB0aGlzLmdsXG5cbiAgaWYgKHRoaXMudGV4dHVyZSlcbiAgICByZXR1cm4gdGhpcy50ZXh0dXJlXG5cbiAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7IC8vIGJ1ZyB3b3JrYXJvdW5kXG4gIHJldHVybiB0aGlzLnRleHR1cmUgPSB7XG4gICAgdGV4dHVyZSA6IHR3Z2wuY3JlYXRlVGV4dHVyZShnbCwge1xuICAgICAgdGFyZ2V0IDogZ2wuVEVYVFVSRV8yRCxcbiAgICAgIGZsaXBZICA6IHRydWUsXG4gICAgICBhdXRvICAgOiBmYWxzZSxcbiAgICAgIG1pbiAgICA6IGdsLkxJTkVBUixcbiAgICAgIHNyYyAgICA6IHRoaXMuaW1nXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmUiLCJcblxubW9kdWxlLmV4cG9ydHMuY29sb3IgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgdmFyIGMgPSBbXTtcbiAgZm9yICh2YXIgaT0wOyBpPDQ7IGkrKykge1xuICAgIGMucHVzaCgoY29sb3JbaV0gfHwgKGkgPT0gMyA/IDEgOiAwKSkudG9GaXhlZCgyKSArICcnKTtcbiAgfVxuICByZXR1cm4gKFxuICAgICd2ZWM0KCcgKyBjLmpvaW4oJywnKSArICcpJ1xuICApO1xuICBcbn0iLCJ2YXIgdHdnbCA9IHJlcXVpcmUoJy4uL2xpYi90d2dsJylcblxuZnVuY3Rpb24gU2hhZGVyIChnZXRWZXJ0ZXhCb2R5U291cmNlLCBnZXRGcmFnbWVudEJvZHlTb3VyY2Upe1xuICB0aGlzLmdldFZlcnRleEJvZHlTb3VyY2UgICA9IGdldFZlcnRleEJvZHlTb3VyY2VcbiAgdGhpcy5nZXRGcmFnbWVudEJvZHlTb3VyY2UgPSBnZXRGcmFnbWVudEJvZHlTb3VyY2VcbiAgXG4gIHRoaXMucHJvZ3JhbSAgICAgICAgID0gZmFsc2VcbiAgdGhpcy52ZXJ0ZXhfaGVhZGVyICAgPSAnJztcbiAgdGhpcy5mcmFnbWVudF9oZWFkZXIgPVxuICAgICAgJyNpZmRlZiBHTF9FU1xcbicgK1xuICAgICAgJyAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuJyArXG4gICAgICAnI2VuZGlmXFxuJztcblxuICB0aGlzLnZlcnRleF91bmlmb3JtcyAgID0ge31cbiAgdGhpcy5mcmFnbWVudF91bmlmb3JtcyA9IHt9XG4gIHRoaXMudmFyeWluZ3MgICAgICAgICAgPSB7fVxuICB0aGlzLmF0dHJpYnV0ZXMgICAgICAgID0ge31cbn1cblxuU2hhZGVyLnByb3RvdHlwZS5nZXRWZXJ0ZXhTb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzcmMgPSB0aGlzLnZlcnRleF9oZWFkZXI7XG4gIGZvciAodW5pZm9ybSBpbiB0aGlzLnZlcnRleF91bmlmb3Jtcykge1xuICAgIHNyYyArPSAndW5pZm9ybSAnICsgIHRoaXMudmVydGV4X3VuaWZvcm1zW3VuaWZvcm1dICsgJyAnICsgdW5pZm9ybSArICc7XFxuJztcbiAgfVxuICBmb3IgKGF0dHJpYnV0ZSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICBzcmMgKz0gJ2F0dHJpYnV0ZSAnICsgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVdICsgJyAnICsgYXR0cmlidXRlICsgJztcXG4nO1xuICB9XG4gIGZvciAodmFyeWluZyBpbiB0aGlzLnZhcnlpbmdzKSB7XG4gICAgc3JjICs9ICd2YXJ5aW5nICcgKyAgdGhpcy52YXJ5aW5nc1t2YXJ5aW5nXSArICcgJyArIHZhcnlpbmcgKyAnO1xcbic7XG4gIH1cbiAgc3JjICs9ICdcXG4nICtcbiAgICAndm9pZCBtYWluKCkge1xcbicgK1xuICAgICAgdGhpcy5nZXRWZXJ0ZXhCb2R5U291cmNlKCkgK1xuICAgICd9XFxuJztcbiAgcmV0dXJuIHNyYztcbn1cblxuU2hhZGVyLnByb3RvdHlwZS5nZXRGcmFnbWVudFNvdXJjZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNyYyA9IHRoaXMuZnJhZ21lbnRfaGVhZGVyO1xuICBmb3IgKHVuaWZvcm0gaW4gdGhpcy5mcmFnbWVudF91bmlmb3Jtcykge1xuICAgIHNyYyArPSAndW5pZm9ybSAnICsgIHRoaXMuZnJhZ21lbnRfdW5pZm9ybXNbdW5pZm9ybV0gKyAnICcgKyB1bmlmb3JtICsgJztcXG4nO1xuICB9XG4gIGZvciAodmFyeWluZyBpbiB0aGlzLnZhcnlpbmdzKSB7XG4gICAgc3JjICs9ICd2YXJ5aW5nICcgKyAgdGhpcy52YXJ5aW5nc1t2YXJ5aW5nXSArICcgJyArIHZhcnlpbmcgKyAnO1xcbic7XG4gIH1cbiAgc3JjICs9ICd2b2lkIG1haW4oKSB7XFxuJyArXG4gICAgdGhpcy5nZXRGcmFnbWVudEJvZHlTb3VyY2UoKSArXG4gICd9XFxuJztcbiAgcmV0dXJuIHNyYztcbn1cblxuU2hhZGVyLnByb3RvdHlwZS5nZXRQcm9ncmFtID0gZnVuY3Rpb24gKGdsKSB7XG4gIGlmICh0aGlzLnByb2dyYW0pXG4gICAgcmV0dXJuIHRoaXMucHJvZ3JhbVxuICAvLyBjb25zb2xlLmxvZyh0aGlzLmdldFZlcnRleFNvdXJjZSgpLCB0aGlzLmdldEZyYWdtZW50U291cmNlKCkpXG4gIHJldHVybiB0aGlzLnByb2dyYW0gPSB0d2dsLmNyZWF0ZVByb2dyYW1JbmZvKFxuICAgIGdsLFxuICAgIFt0aGlzLmdldFZlcnRleFNvdXJjZSgpLCB0aGlzLmdldEZyYWdtZW50U291cmNlKCldXG4gIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaGFkZXIiLCJ2YXIgdXRpbCAgICAgID0gcmVxdWlyZSgndXRpbCcpXG52YXIgdHdnbCAgICAgID0gcmVxdWlyZSgnLi4vbGliL3R3Z2wnKVxudmFyIGV2ZW50aWZ5ICA9IHJlcXVpcmUoJ2V2ZW50aWZ5JylcbnZhciBSZW5kZXJTZXQgPSByZXF1aXJlKCcuL3JlbmRlcl9zZXQnKVxuXG5mdW5jdGlvbiBTY3JlZW4oKXtcbiAgZXZlbnRpZnkuZW5hYmxlKHRoaXMpXG4gIFJlbmRlclNldC5jYWxsKHRoaXMpXG59XG51dGlsLmluaGVyaXRzKFNjcmVlbiwgUmVuZGVyU2V0KVxuXG5TY3JlZW4ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY2FudmFzLCBmbikge1xuICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgdmFyIGdsID0gdGhpcy5nbCA9IHR3Z2wuZ2V0V2ViR0xDb250ZXh0KGNhbnZhcywge2FudGlhbGlhczogZmFsc2UsIHByZW11bHRpcGxpZWRBbHBoYTogZmFsc2V9KTtcbiAgaWYgKCFnbCkgdGhyb3cgXCJmYWlsZWQgdG8gaW5pdGlhbGl6ZSB3ZWJnbFwiO1xuXG4gIHZhciBvcHRpb25zID0gZm4gJiYgZm4oZ2wpXG4gIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zIHx8IHt9KVxuICBcbiAgcmV0dXJuIHRydWU7XG59XG5cblNjcmVlbi5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBnbCA9IHRoaXMuZ2xcblxuICBpZiAoIW9wdGlvbnMuaW1hZ2VTbW9vdGhpbmdFbmFibGVkKSB7XG4gICAgZ2wuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gIH1cbiAgXG4gIGlmICghb3B0aW9ucy5wcmVtdWx0aXBseV9hbHBoYSkge1xuICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCwgZmFsc2UpO1xuICB9XG5cbiAgb3B0aW9ucy5lbmFibGUgPSBvcHRpb25zLmVuYWJsZSA/IChvcHRpb25zLmVuYWJsZSBpbnN0YW5jZW9mIEFycmF5ID8gb3B0aW9ucy5lbmFibGUgOiBbb3B0aW9ucy5lbmFibGVdKSA6IFtdXG4gIG9wdGlvbnMuZW5hYmxlLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICBnbC5lbmFibGUodilcbiAgfSlcbiAgXG4gIG9wdGlvbnMuY3VsbEZhY2UgJiYgZ2wuY3VsbEZhY2Uob3B0aW9ucy5jdWxsRmFjZSlcbn1cblxuU2NyZWVuLnByb3RvdHlwZS53aWR0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY2FudmFzLm9mZnNldFdpZHRoXG59XG5cblNjcmVlbi5wcm90b3R5cGUuaGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0XG59XG5cblNjcmVlbi5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICBSZW5kZXJTZXQucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMsIHRoaXMuZ2wpXG59XG5cblNjcmVlbi5wcm90b3R5cGUuYmVnaW5GcmFtZVJlbmRlcmluZyA9IGZ1bmN0aW9uIChvbmNlKSB7XG4gIGlmICh0aGlzLnN0YXJ0ZWQpIHJldHVyblxuICBpZiAoIW9uY2UpIHRoaXMuc3RhcnRlZCA9IHRydWVcbiAgXG4gIFxuICBcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB2YXIgZnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50cmlnZ2VyKCdmcmFtZScsIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbm93KTtcbiAgICBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIGlmICghb25jZSkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lLCB0aGlzLmNhbnZhcyk7XG4gICAgfVxuICB9LmJpbmQodGhpcylcblxuICBmcmFtZSgpOyAgLy8gY2FsbCB0aGUgZmlyc3QgcmVuZGVyIG1hbnVhbGx5IHRvIHN0YXJ0IGl0IG9mZi5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY3JlZW4iLCJ2YXIgdXRpbCAgPSByZXF1aXJlKCd1dGlsJylcbnZhciBNb2RlbCA9IHJlcXVpcmUoJy4vbW9kZWwnKVxudmFyIEluZGljZXNBdHRyaWJ1dGUgID0gcmVxdWlyZSgnLi9pbmRpY2VzX2F0dHJpYnV0ZScpXG5cbmZ1bmN0aW9uIFBsYXRlKHNoYWRlcil7XG4gIHZhciBhY2NvbW1vZGF0b3IgPSB7YWZmZWN0ZWQ6IHt9fTtcbiAgTW9kZWwuY2FsbCh0aGlzLCBhY2NvbW1vZGF0b3IsIHNoYWRlciwgMSk7XG4gIFxuICB2YXIgdmVydGljZXMgPSBbXG4gICAgWy0xLCAtMV0sXG4gICAgWy0xLCAgMV0sXG4gICAgWyAxLCAtMV0sXG4gICAgWyAxLCAgMV1cbiAgXTtcbiAgXG4gIHRoaXMuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIDQsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgIHZlcnRpY2VzW2ldWzJdID0gaXRlbS56XG4gICAgdmVydGljZXNbaV1bM10gPSAxXG4gICAgcmV0dXJuIHZlcnRpY2VzW2ldXG4gIH0pO1xuICBcbn1cbnV0aWwuaW5oZXJpdHMoUGxhdGUsIE1vZGVsKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhdGUiLCJ2YXIgdXRpbCAgICAgICAgICAgICA9IHJlcXVpcmUoJ3V0aWwnKSxcbiAgICBTbG90TGlzdCAgICAgICAgID0gcmVxdWlyZSgnLi9zbG90bGlzdCcpLFxuICAgIHR3Z2wgICAgICAgICAgICAgPSByZXF1aXJlKCcuLi9saWIvdHdnbCcpLFxuICAgIEluZGljZXNBdHRyaWJ1dGUgPSByZXF1aXJlKCcuL2luZGljZXNfYXR0cmlidXRlJylcblxuZnVuY3Rpb24gTW9kZWwoYWNjb21tb2RhdG9yLCBzaGFkZXIsIG1heCkge1xuICB0aGlzLmRpcnR5ICA9IGZhbHNlO1xuICB0aGlzLnNsb3RzICA9IG5ldyBTbG90TGlzdChtYXgpO1xuXG4gIHRoaXMuYWxsb2NhdGlvbnMgICAgICAgID0ge307XG4gIHRoaXMudW5pZm9ybXMgICAgICAgICAgID0ge307XG4gIHRoaXMuYXR0cmlidXRlcyAgICAgICAgID0ge307XG4gIHRoaXMuYXR0cmlidXRlcy5pbmRpY2VzID0gdGhpcy5pbmRpY2VzQXR0cmlidXRlKClcblxuICB0aGlzLmdlb21ldHJ5ICAgICAgPSBudWxsO1xuICB0aGlzLnNoYWRlciAgICAgICAgPSBzaGFkZXI7XG4gIHRoaXMudGV4dHVyZURhdGEgICA9IHt9O1xuICB0aGlzLnNoYWRlck9wdGlvbnMgPSB7fTtcbiAgdGhpcy5yZW1vdmVJdGVtICAgID0gTW9kZWwuaXRlbVJlbW92ZXIodGhpcylcbiAgdGhpcy5hY2NvbW1vZGF0b3IgID0gYWNjb21tb2RhdG9yXG4gIHRoaXMuaWQgPSBNb2RlbC5uZXh0SWQgKytcbn1cbk1vZGVsLm5leHRJZCA9IDFcblxuTW9kZWwuaXRlbVJlbW92ZXIgPSBmdW5jdGlvbiAobW9kZWwpIHtcbiAgdmFyIGEgPSBtb2RlbC5hdHRyaWJ1dGVzO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoYWZmZWN0ZWQpIHtcbiAgICBtb2RlbC5hY2NvbW1vZGF0b3IuYWZmZWN0ZWRbbW9kZWwuaWRdID0gbW9kZWxcbiAgICBmb3IgKHZhciBuYW1lIGluIGEpIHtcbiAgICAgIGFbbmFtZV0uY2xlYXIodGhpcy5pbmRleCwgMCk7XG4gICAgfVxuICAgIG1vZGVsLmRpcnR5ID0gdHJ1ZTtcbiAgICBtb2RlbC5zbG90cy5kZWNyZW1lbnQodGhpcy5pbmRleCk7XG4gIH1cbn1cblxuTW9kZWwucHJvdG90eXBlLmluZGljZXNBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgSW5kaWNlc0F0dHJpYnV0ZS5RdWFkcyh0aGlzLnNsb3RzLm1heClcbn1cblxuTW9kZWwucHJvdG90eXBlLmFkZEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lLCBudW1Db21wb25lbnRzLCBidWZmZXJUeXBlLCBmbikge1xuICB2YXIgYXR0ciA9IHRoaXMuYXR0cmlidXRlcy5pbmRpY2VzLmdldEF0dHJpYnV0ZShuYW1lLCBudW1Db21wb25lbnRzLCBidWZmZXJUeXBlLCBmbilcbiAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gYXR0clxuICByZXR1cm4gYXR0clxufVxuXG5Nb2RlbC5wcm90b3R5cGUuZ2V0QXR0cmlidXRlQnVmZmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXR0cmlidXRlQnVmZmVycykge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZUJ1ZmZlcnM7XG4gIH1cblxuICB2YXIgYXR0cnMgPSAge307XG4gIE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGF0dHJpYnV0ZSA9IHRoaXMuYXR0cmlidXRlc1tuYW1lXVxuICAgIGF0dHJzW25hbWVdID0gYXR0cmlidXRlLmdldEJ1ZmZlcigpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHJldHVybiB0aGlzLmF0dHJpYnV0ZUJ1ZmZlcnMgPSBhdHRycztcbn1cblxuTW9kZWwucHJvdG90eXBlLmNhbkFjY29tbW9kYXRlID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgaWYgKHRoaXMuc2xvdHMudmFjYW5jaWVzKCkgPT0gMCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmICghaXRlbS5hbGxvY2F0aW9ucykgcmV0dXJuIHRydWU7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoaXRlbS5hbGxvY2F0aW9ucylcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICBpZiAoIXRoaXMuYWxsb2NhdGlvbnNba2V5XSB8fCAhdGhpcy5hbGxvY2F0aW9uc1trZXldLmNhbkFjY29tbW9kYXRlKGl0ZW0uYWxsb2NhdGlvbnNba2V5XSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbk1vZGVsLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgYXQgICAgPSB0aGlzLmF0dHJpYnV0ZXM7XG4gIHZhciBpbmRleCA9IHRoaXMuc2xvdHMuY3VycmVudCgpO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYXQpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGF0W2tleXNbaV1dLnNldEVsZW1lbnRzKGluZGV4LCBpdGVtKVxuICB9XG5cbiAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gIGl0ZW0uaW5kZXggPSB0aGlzLnNsb3RzLmN1cnJlbnQoKTtcbiAgdGhpcy5zbG90cy5pbmNyZW1lbnQoKTtcbiAgaXRlbS5yZW1vdmUgPSB0aGlzLnJlbW92ZUl0ZW1cbn1cblxuTW9kZWwucHJvdG90eXBlLmlzVW51c2VkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zbG90cy5jb3VudCA9PSAwXG59XG5cbk1vZGVsLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBnZW9tID0gdGhpcy5nZW9tZXRyeVxuICBpZiAoIWdlb20pIHJldHVyblxuICBnZW9tLmRlbGV0ZUJ1ZmZlcnMoKTtcbiAgLy8gZm9yICh2YXIgaSBpbiBnZW9tLmJ1ZmZlcnMpIHtcbiAgLy8gICB2YXIgYnVmID0gZ2VvbS5idWZmZXJzW2ldXG4gIC8vICAgZ2wuZGVsZXRlQnVmZmVyKGJ1Zi5idWYpXG4gIC8vIH1cbn1cblxuTW9kZWwucHJvdG90eXBlLmRyYXdQcmVwID0gZnVuY3Rpb24gKGdlb20sIHVuaWZvcm1zKSB7XG4gIGZvcih2YXIgaSBpbiB1bmlmb3Jtcykge1xuICAgIGlmICh1bmlmb3Jtcy5oYXNPd25Qcm9wZXJ0eShpKSlcbiAgICAgIHRoaXMudW5pZm9ybXNbaV0gPSB1bmlmb3Jtc1tpXVxuICB9XG4gIGdlb20uZHJhd1ByZXAodGhpcy51bmlmb3Jtcyk7XG59XG5cbk1vZGVsLnByb3RvdHlwZS5nZXRHZW9tZXRyeSA9IGZ1bmN0aW9uIChnbCkge1xuICBpZiAodGhpcy5nZW9tZXRyeSlcbiAgICByZXR1cm4gdGhpcy5nZW9tZXRyeTtcblxuICB0aGlzLmJ1ZmZlckluZm8gPSB0aGlzLmJ1ZmZlckluZm8gfHwgdHdnbC5jcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhnbCwgdGhpcy5nZXRBdHRyaWJ1dGVCdWZmZXJzKCkpO1xuICByZXR1cm4gdGhpcy5nZW9tZXRyeSA9IHtcbiAgICBkcmF3UHJlcCA6IGZ1bmN0aW9uICh1bmlmb3Jtcykge1xuICAgICAgdmFyIHByb2dyYW1JbmZvID0gdGhpcy5zaGFkZXIuZ2V0UHJvZ3JhbShnbClcbiAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbUluZm8ucHJvZ3JhbSk7XG4gICAgICB0d2dsLnNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCB1bmlmb3Jtcyk7XG4gICAgfS5iaW5kKHRoaXMpLFxuICAgIGRyYXcgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcHJvZ3JhbUluZm8gPSB0aGlzLnNoYWRlci5nZXRQcm9ncmFtKGdsKVxuICAgICAgdHdnbC5zZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhnbCwgcHJvZ3JhbUluZm8sIHRoaXMuYnVmZmVySW5mbyk7XG4gICAgICB0d2dsLmRyYXdCdWZmZXJJbmZvKGdsLCBnbC5UUklBTkdMRVMsIHRoaXMuYnVmZmVySW5mbyk7XG4gICAgfS5iaW5kKHRoaXMpLFxuICAgIHNldEJ1ZmZlciA6IGZ1bmN0aW9uIChuYW1lLCBidWZmZXIsIG1vZGUpIHtcbiAgICAgIGlmIChuYW1lID09ICdpbmRpY2VzJykge1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlckluZm8uaW5kaWNlcylcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVyLCBtb2RlIHx8IGdsLlNUQVRJQ19EUkFXKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsdGhpcy5idWZmZXJJbmZvLmF0dHJpYnNbbmFtZV0uYnVmZmVyKVxuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyLCBtb2RlIHx8IGdsLlNUQVRJQ19EUkFXKVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSxcbiAgICBkZWxldGVCdWZmZXJzIDogZnVuY3Rpb24gKCkge1xuICAgICAgZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYnVmZmVySW5mby5pbmRpY2VzKVxuICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLmJ1ZmZlckluZm8uYXR0cmlicykge1xuICAgICAgICB2YXIgYnVmID0gdGhpcy5idWZmZXJJbmZvLmF0dHJpYnNbaV1cbiAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKGJ1Zi5idWZmZXIpXG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpXG4gIH07XG59XG5cbk1vZGVsLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKGdsKSB7XG4gIHZhciBnZW9tID0gdGhpcy5nZXRHZW9tZXRyeShnbCk7XG4gIFxuICBmb3IgKHZhciBuYW1lIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHZhciBhdHRyaWJ1dGUgPSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV1cbiAgICAgIGlmIChhdHRyaWJ1dGUuZGlydHkpXG4gICAgICAgIGF0dHJpYnV0ZS5yZWZyZXNoKGdsLCBnZW9tKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmRpcnR5ID0gZmFsc2U7XG59XG5cbk1vZGVsLlRyaWFuZ2xlcyA9IGZ1bmN0aW9uIFRyaWFuZ2xlcyhhY2NvbW1vZGF0b3IsIHNoYWRlciwgbWF4KSB7XG4gIE1vZGVsLmNhbGwodGhpcywgYWNjb21tb2RhdG9yLCBzaGFkZXIsIG1heClcbn1cbnV0aWwuaW5oZXJpdHMoTW9kZWwuVHJpYW5nbGVzLCBNb2RlbClcblxuTW9kZWwuVHJpYW5nbGVzLnByb3RvdHlwZS5pbmRpY2VzQXR0cmlidXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IEluZGljZXNBdHRyaWJ1dGUuVHJpYW5nbGVzKHRoaXMuc2xvdHMubWF4KVxufVxuXG5Nb2RlbC5HZW9kZXNpY3MgPSBmdW5jdGlvbiBHZW9kZXNpY3MoYWNjb21tb2RhdG9yLCBzaGFkZXIsIG1heCwgc3ViZGl2aXNpb25zKSB7XG4gIHRoaXMudHJpc1BlclBvbHkgPSAyMCAqIHN1YmRpdmlzaW9ucyAqIHN1YmRpdmlzaW9uc1xuICBNb2RlbC5jYWxsKHRoaXMsIGFjY29tbW9kYXRvciwgc2hhZGVyLCBtYXgpXG59XG51dGlsLmluaGVyaXRzKE1vZGVsLkdlb2Rlc2ljcywgTW9kZWwpXG5cbk1vZGVsLkdlb2Rlc2ljcy5wcm90b3R5cGUuaW5kaWNlc0F0dHJpYnV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBJbmRpY2VzQXR0cmlidXRlLkdlb2Rlc2ljcyh0aGlzLnNsb3RzLm1heCwgdGhpcy50cmlzUGVyUG9seSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbCIsInZhciB1dGlsICAgICAgPSByZXF1aXJlKCd1dGlsJyksXG4gICAgQXR0cmlidXRlID0gcmVxdWlyZSgnLi9hdHRyaWJ1dGUnKVxuXG5mdW5jdGlvbiBJbmRpY2VzQXR0cmlidXRlKG5hbWUsIG1heCwgdmVydGljZXNQZXJQb2x5LCB0cmlhbmdsZXNQZXJQb2x5KSB7XG4gIHRoaXMudmVydGljZXNQZXJQb2x5ID0gdmVydGljZXNQZXJQb2x5XG5cbiAgQXR0cmlidXRlLmNhbGwodGhpcywgbmFtZSwgbWF4LCAzLCB0cmlhbmdsZXNQZXJQb2x5LCAnVWludDE2QXJyYXknLCBmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICB2YXIgY3BwID0gMyAqIHRyaWFuZ2xlc1BlclBvbHlcbiAgICB0aGlzLndyaXRlKHRoaXMuaW5kZXhDb29yZHMoaW5kZXggKiB0aGlzLnZlcnRpY2VzUGVyUG9seSwgaXRlbSksIGluZGV4ICogY3BwKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLmludmVydCA9IGZhbHNlO1xufVxudXRpbC5pbmhlcml0cyhJbmRpY2VzQXR0cmlidXRlLCBBdHRyaWJ1dGUpXG5cbkluZGljZXNBdHRyaWJ1dGUucHJvdG90eXBlLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lLCBudW1Db21wb25lbnRzLCBidWZmZXJUeXBlLCBmbikge1xuICB2YXIgdnBwID0gdGhpcy52ZXJ0aWNlc1BlclBvbHlcbiAgdmFyIGF0dHIgPSBuZXcgQXR0cmlidXRlKG5hbWUsIHRoaXMubWF4LCBudW1Db21wb25lbnRzLCB2cHAsIGJ1ZmZlclR5cGUsIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2cHA7IGkgKyspIHtcbiAgICAgIGF0dHIud3JpdGUoZm4oaSwgaXRlbSksIGluZGV4ICogdnBwICogbnVtQ29tcG9uZW50cyArIGkgKiBudW1Db21wb25lbnRzKTtcbiAgICB9XG4gIH0uYmluZCh0aGlzKSlcbiAgcmV0dXJuIGF0dHJcbn1cblxuSW5kaWNlc0F0dHJpYnV0ZS5RdWFkcyA9IGZ1bmN0aW9uIFF1YWRJbmRpY2VzKG1heCkge1xuICBJbmRpY2VzQXR0cmlidXRlLmNhbGwodGhpcywgJ2luZGljZXMnLCBtYXgsIDQsIDIpXG59XG51dGlsLmluaGVyaXRzKEluZGljZXNBdHRyaWJ1dGUuUXVhZHMsIEluZGljZXNBdHRyaWJ1dGUpXG5cbkluZGljZXNBdHRyaWJ1dGUuUXVhZHMucHJvdG90eXBlLmluZGV4Q29vcmRzID0gZnVuY3Rpb24gKGMpIHtcbiAgaWYgKHRoaXMuaW52ZXJ0KVxuICAgIHJldHVybiBbYywgYysxLCBjKzMsIGMsIGMrMywgYysyXTtcbiAgcmV0dXJuIFtjLCBjKzMsIGMrMSwgYywgYysyLCBjKzNdO1xufVxuXG5JbmRpY2VzQXR0cmlidXRlLlRyaWFuZ2xlcyA9IGZ1bmN0aW9uIFRyaWFuZ2xlSW5kaWNlcyhtYXgpIHtcbiAgSW5kaWNlc0F0dHJpYnV0ZS5jYWxsKHRoaXMsICdpbmRpY2VzJywgbWF4LCAzLCAxKVxufVxudXRpbC5pbmhlcml0cyhJbmRpY2VzQXR0cmlidXRlLlRyaWFuZ2xlcywgSW5kaWNlc0F0dHJpYnV0ZSlcblxuSW5kaWNlc0F0dHJpYnV0ZS5UcmlhbmdsZXMucHJvdG90eXBlLmluZGV4Q29vcmRzID0gZnVuY3Rpb24gKGMpIHtcbiAgaWYgKHRoaXMuaW52ZXJ0KVxuICAgIHJldHVybiBbYywgYysxLCBjKzJdO1xuICByZXR1cm4gW2MsIGMrMiwgYysxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpY2VzQXR0cmlidXRlXG5cbkluZGljZXNBdHRyaWJ1dGUuR2VvZGVzaWNzID0gZnVuY3Rpb24gR2VvZGVzaWNJbmRpY2VzKG1heCwgdHJpc1BlclBvbHkpIHtcbiAgSW5kaWNlc0F0dHJpYnV0ZS5jYWxsKHRoaXMsICdpbmRpY2VzJywgbWF4LCB0cmlzUGVyUG9seSAvIDIgKyAyLCB0cmlzUGVyUG9seSlcbn1cbnV0aWwuaW5oZXJpdHMoSW5kaWNlc0F0dHJpYnV0ZS5HZW9kZXNpY3MsIEluZGljZXNBdHRyaWJ1dGUpXG5cbkluZGljZXNBdHRyaWJ1dGUuR2VvZGVzaWNzLnByb3RvdHlwZS5pbmRleENvb3JkcyA9IGZ1bmN0aW9uIChjLCBpdGVtKSB7XG4gIHZhciBpbmRpY2VzID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtLnRyaXMubGVuZ3RoOyBpICsrKSB7XG4gICAgdmFyIHRyaSA9IGl0ZW0udHJpc1tpXTtcbiAgICBpZiAodGhpcy5pbnZlcnQpIHtcbiAgICAgIGluZGljZXMucHVzaChjICsgdHJpWzBdLCBjICsgdHJpWzJdLCBjICsgdHJpWzFdKVxuICAgIH0gZWxzZSB7XG4gICAgICBpbmRpY2VzLnB1c2goYyArIHRyaVswXSwgYyArIHRyaVsxXSwgYyArIHRyaVsyXSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGluZGljZXNcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpY2VzQXR0cmlidXRlIiwidmFyIHFzICA9IHJlcXVpcmUoJy4uL2xpYi9xdWF0ZXJuaW9ucycpXG5cbndpbmRvdy5wb2ludHMgPSB7fVxuZnVuY3Rpb24gUG9pbnQocCl7XG4gIHRoaXMucCA9IHBcbiAgdGhpcy5pZCA9IFBvaW50Ll9uZXh0SWQgKytcblxuICB0aGlzLmxpbmVzID0gW11cbiAgdGhpcy50cmlzID0gW11cbiAgd2luZG93LnBvaW50c1t0aGlzLmlkXSA9IHRoaXNcbn1cblBvaW50Ll9uZXh0SWQgPSAxXG5cblBvaW50LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKGhlZHJvbikge1xuICBpZiAoaGVkcm9uLnBvaW50c1t0aGlzLmlkXSkgcmV0dXJuIHRoaXNcbiAgaWYgKCFoZWRyb24ucG9pbnRzW3RoaXMuaWQgKyBcIidcIl0pIHtcbiAgICB2YXIgcCA9IG5ldyBQb2ludCgpXG4gICAgcC5wID0gdGhpcy5wXG4gICAgaGVkcm9uLnBvaW50c1t0aGlzLmlkICsgXCInXCJdID0gcFxuICAgIGhlZHJvbi5wb2ludHNbcC5pZF0gPSBwXG4gIH1cbiAgcmV0dXJuIGhlZHJvbi5wb2ludHNbdGhpcy5pZCArIFwiJ1wiXVxufVxuXG5Qb2ludC5wcm90b3R5cGUuZ2V0Q29vcmRzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBub3JtYWxpemUoeCwgeSwgeiwgdzIpIHtcbiAgICB2YXIgdyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopXG4gICAgcmV0dXJuIFt4IC8gdyAqIHcyLCB5IC8gdyAqIHcyLCB6IC8gdyAqIHcyXVxuICB9XG4gIHZhciBwID0gcXMubm9ybWFsaXplKHRoaXMucClcblxuICB2YXIgdyA9IE1hdGguUEkgKiAyXG4gIHZhciBoID0gTWF0aC5QSVxuXG4gIHZhciB1ID0gKCgoTWF0aC5hdGFuMihwWzJdLCBwWzBdKSAvIE1hdGguUEkgLyAyKSAlIDEgKyAxKSAlIDEpICogdyBcbiAgdmFyIHYgPSBNYXRoLmFzaW4ocFsxXSkgLyBNYXRoLlBJICogaFxuXG4gIHZhciB4ID0gTWF0aC5jb3ModSkgKiBNYXRoLmNvcyh2KVxuICB2YXIgeSA9IE1hdGguc2luKHYpXG4gIHZhciB6ID0gTWF0aC5zaW4odSkgKiBNYXRoLmNvcyh2KVxuXG4gIHJldHVybiBub3JtYWxpemUoeCwgeSwgeiwgMilcbn1cblxuZnVuY3Rpb24gTGluZShjb3VudHMsIGEsIGIpIHtcbiAgdGhpcy5hID0gYVxuICB0aGlzLmIgPSBiXG5cbiAgdGhpcy50cmlzID0gW11cbiAgdGhpcy5pZCA9IExpbmUuX25leHRJZCArK1xuICBpZiAoY291bnRzKSB7XG4gICAgdGhpcy5hLmxpbmVzLnB1c2godGhpcylcbiAgICB0aGlzLmIubGluZXMucHVzaCh0aGlzKVxuICB9XG59XG5MaW5lLl9uZXh0SWQgPSAxXG5cbkxpbmUuaWRGb3JQb2ludHMgPSBmdW5jdGlvbiAocDAsIHAxKSB7XG4gIGlmIChwMS5pZCA+IHAwLmlkKSByZXR1cm4gcDAuaWQgKyAnLScgKyBwMS5pZFxuICByZXR1cm4gcDEuaWQgKyAnLScgKyBwMC5pZFxufVxuXG5MaW5lLnByb3RvdHlwZS5wb2ludCA9IGZ1bmN0aW9uIChoZWRyb24sIHBlcmNlbnQpIHtcbiAgaWYgKHBlcmNlbnQgPT0gMCkgcmV0dXJuIHRoaXMuYS5jb3B5KGhlZHJvbilcbiAgaWYgKHBlcmNlbnQgPT0gMSkgcmV0dXJuIHRoaXMuYi5jb3B5KGhlZHJvbilcbiAgXG4gIHZhciBwZXJjID0gTWF0aC5yb3VuZChwZXJjZW50ICogMTAwMDAwMClcbiAgdmFyIGlkID0gdGhpcy5pZCArICdAJyArIHBlcmNcbiAgaWYgKCFoZWRyb24ucG9pbnRzW2lkXSkge1xuICAgIHZhciBwID0gcXMuc2xlcnAodGhpcy5hLnAsIHRoaXMuYi5wLCBwZXJjZW50KVxuICAgIC8vIGNvbnNvbGUubG9nKFBvaW50Ll9uZXh0SWQsIGlkKVxuICAgIGhlZHJvbi5wb2ludHNbaWRdID0gbmV3IFBvaW50KHApXG4gIH1cbiAgcmV0dXJuIGhlZHJvbi5wb2ludHNbaWRdXG59XG5cbmZ1bmN0aW9uIFRyaSAobmFtZSwgYSwgYiwgYykge1xuICB0aGlzLmxpbmVzID0gW2EsIGIsIGNdXG4gIHRoaXMuaWQgPSBUcmkuX25leHRJZCArK1xuICB0aGlzLm5hbWUgPSBuYW1lXG5cbiAgdGhpcy5saW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgbGluZS50cmlzLnB1c2godGhpcylcbiAgICBsaW5lLmEudHJpcy5wdXNoKHRoaXMpXG4gICAgbGluZS5iLnRyaXMucHVzaCh0aGlzKVxuICB9LmJpbmQodGhpcykpXG4gIFxuICB0aGlzLnBvaW50cyA9IFtdXG4gIHRoaXMucG9pbnRzLnB1c2goYS5hKVxuICB0aGlzLnBvaW50cy5wdXNoKGEuYilcbiAgdGhpcy5wb2ludHMucHVzaChiLmEgIT0gYS5hICYmIGIuYSAhPSBhLmIgPyBiLmEgOiBiLmIpXG59XG5UcmkuX25leHRJZCA9IDFcblxuZnVuY3Rpb24gSGVkcm9uKHRyaXMpIHtcbiAgdGhpcy50cmlzICAgPSB0cmlzXG4gIHRoaXMuc3BsaXRzID0ge31cbiAgdGhpcy5wb2ludHMgPSB7fVxuICB0aGlzLmxpbmVzQnlQb2ludHMgPSB7fVxuICB0aGlzLl9uZXh0VHJpID0gMVxufVxuXG5IZWRyb24ucHJvdG90eXBlLmxpbmUgPSBmdW5jdGlvbiAocDAsIHAxLCBjb3VudHMsIHBsZWFzZSkge1xuICBpZiAoY291bnRzICE9PSBmYWxzZSkgY291bnRzID0gdHJ1ZVxuICBcbiAgdmFyIGlkID0gTGluZS5pZEZvclBvaW50cyhwMCwgcDEpXG4gIGlmICghdGhpcy5saW5lc0J5UG9pbnRzW2lkXSkge1xuICAgIHRoaXMubGluZXNCeVBvaW50c1tpZF0gPSBuZXcgTGluZShjb3VudHMsIHAwLCBwMSlcbiAgfSBlbHNlIGlmIChwbGVhc2UpIHtcbiAgICBpZiAocDAuaWQgIT0gdGhpcy5saW5lc0J5UG9pbnRzW2lkXS5hLmlkKVxuICAgICAgY29uc29sZS5sb2coJzw+JywgcDAuaWQsIHRoaXMubGluZXNCeVBvaW50c1tpZF0uYS5pZClcbiAgfVxuICByZXR1cm4gdGhpcy5saW5lc0J5UG9pbnRzW2lkXVxufVxuXG5IZWRyb24ucHJvdG90eXBlLnRyaSA9IGZ1bmN0aW9uIChsMCwgbDEsIGwyKSB7XG4gIHJldHVybiBuZXcgVHJpKHRoaXMuX25leHRUcmkgKyssIGwwLCBsMSwgbDIpXG59XG5cbkhlZHJvbi5wcm90b3R5cGUuZ2V0R2VvbWV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0cmlzICAgICAgICA9IFtdXG4gIHZhciBwb2ludHMgICAgICA9IFtdXG4gIHZhciBwb2ludHNfZG9uZSA9IHt9XG4gIFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJpcy5sZW5ndGg7IGkgKyspIHtcbiAgICB2YXIgdHJpX3BvaW50cyA9IHRoaXMudHJpc1tpXS5wb2ludHNcbiAgICB2YXIgZ2VvbV9wb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGogaW4gdHJpX3BvaW50cykge1xuICAgICAgdmFyIHBvaW50ID0gdHJpX3BvaW50c1tqXVxuICAgICAgaWYgKCEocG9pbnQuaWQgaW4gcG9pbnRzX2RvbmUpKSB7XG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50LmdldENvb3JkcygpKVxuICAgICAgICBwb2ludHNfZG9uZVtwb2ludC5pZF0gPSBwb2ludHMubGVuZ3RoIC0gMVxuICAgICAgfVxuICAgICAgZ2VvbV9wb2ludHMucHVzaChwb2ludHNfZG9uZVtwb2ludC5pZF0pXG4gICAgfVxuICAgIHRyaXMucHVzaChnZW9tX3BvaW50cylcbiAgfVxuICByZXR1cm4ge3BvaW50cyA6IHBvaW50cywgdHJpczogdHJpc307XG59XG5cblxuXG5mdW5jdGlvbiBidWlsZF9pY29zKCkge1xuXG4gIHZhciBtaCA9IE1hdGguYXRhbjIoTWF0aC5zcXJ0KDUpIC8gNSwgMiAqIE1hdGguc3FydCg1KSAvIDUpIC8gTWF0aC5QSSAqIDE4MDtcblxuICBmdW5jdGlvbiBwb2ludCh1LCB2KSB7XG4gICAgdSA9IHUgLyAxODAgKiBNYXRoLlBJXG4gICAgdiA9IHYgLyAxODAgKiBNYXRoLlBJXG5cbiAgICB2YXIgeCA9IE1hdGguY29zKHUpICogTWF0aC5jb3ModilcbiAgICB2YXIgeSA9IC1NYXRoLnNpbih2KVxuICAgIHZhciB6ID0gTWF0aC5zaW4odSkgKiBNYXRoLmNvcyh2KVxuXG4gICAgcmV0dXJuIG5ldyBQb2ludChxcy5ub3JtYWxpemUoW3gsIHksIHosIDBdKSlcbiAgfVxuXG4gIHZhciBwb2ludHMgPSBbXVxuICBwb2ludHMucHVzaChwb2ludCgxODAsIC05MCkpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSArKykge1xuICAgIHBvaW50cy5wdXNoKHBvaW50KDM2MCAvIDUgKiBpLCAtbWgpKVxuICAgIHBvaW50cy5wdXNoKHBvaW50KDM2MCAvIDUgKiBpICsgMzYwIC8gMTAsIG1oKSlcbiAgfVxuICBwb2ludHMucHVzaChwb2ludCgxODAsIDkwKSlcblxuICB2YXIgaGVkcm9uID0gbmV3IEhlZHJvbihbXSlcblxuICB2YXIgbGluZXMgPSB7fVxuICBmdW5jdGlvbiBsaW5lKG5hbWUsIGdlbiwgYSwgYikge1xuICAgIGxpbmVzW25hbWVdID0gaGVkcm9uLmxpbmUoYSwgYilcbiAgfVxuXG4gIHZhciB0b3AgICAgPSAxO1xuICB2YXIgYm90dG9tID0gMjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkgKyspIHtcbiAgICBsaW5lKGkgKyAnOicgKyAwLCAxLCBwb2ludHNbMF0sICAgICAgICAgICAgICBwb2ludHNbdG9wICsgMiAqIGldKVxuICAgIGxpbmUoaSArICc6JyArIDEsIDEsIHBvaW50c1t0b3AgICAgKyAyICogaV0sIHBvaW50c1t0b3AgICAgKyAyICogKChpICsgMSkgJSA1KV0pXG4gICAgbGluZShpICsgJzonICsgMiwgMSwgcG9pbnRzW3RvcCAgICArIDIgKiBpXSwgcG9pbnRzW2JvdHRvbSArIDIgKiAoKGkgKyAwKSAlIDUpXSlcbiAgICBsaW5lKGkgKyAnOicgKyAzLCAxLCBwb2ludHNbYm90dG9tICsgMiAqIGldLCBwb2ludHNbdG9wICAgICsgMiAqICgoaSArIDEpICUgNSldKVxuICAgIGxpbmUoaSArICc6JyArIDQsIDEsIHBvaW50c1tib3R0b20gKyAyICogaV0sIHBvaW50c1tib3R0b20gKyAyICogKChpICsgMSkgJSA1KV0pXG4gICAgbGluZShpICsgJzonICsgNSwgMSwgcG9pbnRzWzExXSwgICAgICAgICAgICAgcG9pbnRzW2JvdHRvbSArIDIgKiBpXSlcbiAgfVxuXG4gIHZhciB0cmlzMSA9IFtdLCB0cmlzMiA9IFtdLCB0cmlzMyA9IFtdLCB0cmlzNCA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSArKykge1xuICAgIHZhciBuZXh0X2kgPSAoaSArIDEpICUgNVxuICAgIHRyaXMxLnB1c2goaGVkcm9uLnRyaShsaW5lc1tpICsgJzonICsgMF0sICAgICAgbGluZXNbaSArICc6JyArIDFdLCAgICAgIGxpbmVzW25leHRfaSArICc6JyArIDBdKSlcbiAgICB0cmlzMi5wdXNoKGhlZHJvbi50cmkobGluZXNbaSArICc6JyArIDJdLCAgICAgIGxpbmVzW2kgKyAnOicgKyAzXSwgICAgICBsaW5lc1tpICsgJzonICsgMV0pKVxuICAgIHRyaXMzLnB1c2goaGVkcm9uLnRyaShsaW5lc1tpICsgJzonICsgNF0sICAgICAgbGluZXNbbmV4dF9pICsgJzonICsgMl0sIGxpbmVzW2kgKyAnOicgKyAzXSkpXG4gICAgdHJpczQucHVzaChoZWRyb24udHJpKGxpbmVzW25leHRfaSArICc6JyArIDVdLCBsaW5lc1tpICsgJzonICsgNF0sICAgICAgbGluZXNbaSArICc6JyArIDVdKSlcbiAgfVxuXG4gIGhlZHJvbi50cmlzLnB1c2guYXBwbHkoaGVkcm9uLnRyaXMsIHRyaXMxLmNvbmNhdCh0cmlzMikuY29uY2F0KHRyaXMzKS5jb25jYXQodHJpczQpKVxuXG4gIHJldHVybiBoZWRyb25cbn1cblxuZnVuY3Rpb24gc3ViZGl2aWRlKG4sIGhlZHJvbikge1xuICB2YXIgbmV3SGVkcm9uID0gbmV3IEhlZHJvbihbXSlcbiAgdmFyIHRyaSA9IG51bGxcblxuICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgaWYgKHkgPCAwKSByZXR1cm4gdHJpLnBvaW50c1swXS5jb3B5KGhlZHJvbilcbiAgICBpZiAoeCA9PSAwKSB7XG4gICAgICByZXR1cm4gdHJpLmxpbmVzWzBdLnBvaW50KGhlZHJvbiwgKHkgKyAxKS8gbilcbiAgICB9XG5cbiAgICBpZiAoeCA9PSB5ICsgMSkge1xuICAgICAgcmV0dXJuIHRyaS5saW5lc1syXS5wb2ludChoZWRyb24sICh5ICsgMSkvIG4pXG4gICAgfVxuXG4gICAgaWYgKHkgKyAxIDwgbikge1xuICAgICAgdmFyIHAwID0gdHJpLmxpbmVzWzBdLnBvaW50KGhlZHJvbiwgKHkgKyAxKSAvIG4pXG4gICAgICB2YXIgcDEgPSB0cmkubGluZXNbMl0ucG9pbnQoaGVkcm9uLCAoeSArIDEpIC8gbilcbiAgICAgIGlmICh0cmkubGluZXNbMF0uYSAhPSB0cmkubGluZXNbMl0uYSlcbiAgICAgICAgdGhyb3cgdXBcbiAgICAgIHZhciBsaW5lID0gaGVkcm9uLmxpbmUocDAsIHAxLCBmYWxzZSwgdHJ1ZSlcbiAgICAgIHJldHVybiBsaW5lLnBvaW50KGhlZHJvbiwgeCAvICh5ICsgMSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsaW5lID0gdHJpLmxpbmVzWzFdXG4gICAgICBpZiAodHJpLmxpbmVzWzFdLmEgPT0gdHJpLmxpbmVzWzBdLmIpXG4gICAgICAgIHJldHVybiBsaW5lLnBvaW50KGhlZHJvbiwgeCAvICh5ICsgMSkpXG4gICAgICByZXR1cm4gbGluZS5wb2ludChoZWRyb24sIDEgLSB4IC8gKHkgKyAxKSlcbiAgICB9XG4gIFxuICB9XG5cbiAgZnVuY3Rpb24gZG93bmhpbGwoeCwgeSwgcGxlYXNlKSB7XG4gICAgcmV0dXJuIGhlZHJvbi5saW5lKHBvaW50KHgsIHkgLSAxKSwgcG9pbnQoeCwgeSksIHRydWUsIHBsZWFzZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwaGlsbCh4LCB5LCBwbGVhc2UpIHtcbiAgICByZXR1cm4gaGVkcm9uLmxpbmUocG9pbnQoeCwgeSAtIDEpLCBwb2ludCh4ICsgMSwgeSksIHRydWUsIHBsZWFzZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsb29yKHgsIHksIHBsZWFzZSkge1xuICAgIHJldHVybiBoZWRyb24ubGluZShwb2ludCh4LCB5KSwgcG9pbnQoeCArIDEsIHkpLCB0cnVlLCBwbGVhc2UpXG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGhlZHJvbi50cmlzLmxlbmd0aDsgaSArKykge1xuICAgIHRyaSA9IGhlZHJvbi50cmlzW2ldXG4gICAgdmFyIHJvd0xlbmd0aCA9IDFcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG47IHkgKyspIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgcm93TGVuZ3RoOyB4ICsrKSB7XG4gICAgICAgIHZhciBsMCwgbDEsIGwyO1xuICAgICAgICB2YXIgeDIgPSBNYXRoLmZsb29yKHggLyAyKVxuICAgICAgICBpZiAoeCAlIDIgPT0gMCkge1xuICAgICAgICAgIGwwID0gZG93bmhpbGwoeDIsIHksIHRydWUpXG4gICAgICAgICAgbDEgPSBmbG9vcih4MiwgeSlcbiAgICAgICAgICBsMiA9IHVwaGlsbCh4MiwgeSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsMCA9IHVwaGlsbCh4MiwgeSwgdHJ1ZSlcbiAgICAgICAgICBsMSA9IGZsb29yKHgyLCB5IC0gMSlcbiAgICAgICAgICBsMiA9IGRvd25oaWxsKHgyICsgMSwgeSlcbiAgICAgICAgfVxuICAgICAgICBuZXdIZWRyb24udHJpcy5wdXNoKG5ld0hlZHJvbi50cmkobDAsIGwxLCBsMikpXG4gICAgICB9XG4gICAgICByb3dMZW5ndGggKz0gMlxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdIZWRyb25cbn1cblxudmFyIGJhc2U7XG52YXIgY2FjaGUgPSB7fVxubW9kdWxlLmV4cG9ydHMgPSAgZnVuY3Rpb24gKHN1YmRpdmlzaW9ucykge1xuICBiYXNlID0gYmFzZSB8fCBidWlsZF9pY29zKClcbiAgcmV0dXJuIGNhY2hlW3N1YmRpdmlzaW9uc10gfHwgKGNhY2hlW3N1YmRpdmlzaW9uc10gPSBzdWJkaXZpZGUoc3ViZGl2aXNpb25zLCBiYXNlKSlcbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAyMDA5LCBHb29nbGUgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHb29nbGUgSW5jLiBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgY29udGFpbnMgdmFyaW91cyBmdW5jdGlvbnMgZm9yIHF1YXRlcm5pb24gYXJpdGhtZXRpY1xuICogYW5kIGNvbnZlcnRpbmcgYmV0d2VlbiByb3RhdGlvbiBtYXRyaWNlcyBhbmQgcXVhdGVybmlvbnMuICBJdCBhZGRzIHRoZW0gdG9cbiAqIHRoZSBcInF1YXRlcm5pb25zXCIgbW9kdWxlIG9uIHRoZSBtYWluIG9iamVjdC4gIEphdmFzY3JpcHQgYXJyYXlzIHdpdGhcbiAqIGZvdXIgZW50cmllcyBhcmUgdXNlZCB0byByZXByZXNlbnQgcXVhdGVybmlvbnMsIGFuZCBmdW5jdGlvbnMgYXJlIHByb3ZpZGVkXG4gKiBmb3IgZG9pbmcgb3BlcmF0aW9ucyBvbiB0aG9zZS5cbiAqXG4gKiBPcGVyYXRpb25zIGFyZSBkb25lIGFzc3VtaW5nIHF1YXRlcm5pb25zIGFyZSBvZiB0aGUgZm9ybTpcbiAqIGBxWzBdICsgcVsxXWkgKyBxWzJdaiArIHFbM11rYCBhbmQgdXNpbmcgdGhlIGhhbWlsdG9uaWFuXG4gKiBydWxlcyBmb3IgbXVsdGlwbGljYXRpb24gYXMgZGVzY3JpYmVkIG9uIEJyb3VnaGFtIEJyaWRnZTpcbiAqIGBpXjIgPSBqXjIgPSBrXjIgPSBpamsgPSAtMWAuXG4gKlxuICovXG5cbnZhciBtYWluID0ge31cblxuLyoqXG4gKiBBIE1vZHVsZSBmb3IgcXVhdGVybmlvbiBtYXRoLlxuICogQG5hbWVzcGFjZVxuICovXG5tYWluLnF1YXRlcm5pb25zID0gbWFpbi5xdWF0ZXJuaW9ucyB8fCB7fTtcbm1vZHVsZS5leHBvcnRzICA9IG1haW4ucXVhdGVybmlvbnM7XG5cbm1vZHVsZS5leHBvcnRzLmRpc3RhbmNlID0gcmVxdWlyZSgnLi9zbGVycCcpLmRpc3RhbmNlXG5tb2R1bGUuZXhwb3J0cy5zbGVycCAgICA9IHJlcXVpcmUoJy4vc2xlcnAnKS5zbGVycFxuXG4vKipcbiAqIEEgUXVhdGVybmlvbi5cbiAqIEB0eXBlZGVmIHtudW1iZXJbXX0gbWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9uXG4gKi9cblxuLyoqXG4gKiBRdWlja2x5IGRldGVybWluZXMgaWYgdGhlIG9iamVjdCBhIGlzIGEgc2NhbGFyIG9yIGEgcXVhdGVybmlvbjtcbiAqIGFzc3VtZXMgdGhhdCB0aGUgYXJndW1lbnQgaXMgZWl0aGVyIGEgbnVtYmVyIChzY2FsYXIpLCBvciBhbiBhcnJheSBvZlxuICogbnVtYmVycy5cbiAqIEBwYXJhbSB7KG51bWJlcnxtYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb24pfSBhIEEgbnVtYmVyIG9yIGFycmF5IHRoZSB0eXBlXG4gKiAgICAgb2Ygd2hpY2ggaXMgaW4gcXVlc3Rpb24uXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEVpdGhlciB0aGUgc3RyaW5nICdTY2FsYXInIG9yICdRdWF0ZXJuaW9uJy5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5tYXRoVHlwZSA9IGZ1bmN0aW9uKGEpIHtcbiAgaWYgKHR5cGVvZihhKSA9PT0gJ251bWJlcicpXG4gICAgcmV0dXJuICdTY2FsYXInO1xuICByZXR1cm4gJ1F1YXRlcm5pb24nO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGlkZW50aXR5IHF1YXRlcm5pb24uXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uLlxuICovXG5tYWluLnF1YXRlcm5pb25zLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBbIDAsIDAsIDAsIDEgXTtcbn07XG5cbi8qKlxuICogQ29waWVzIGEgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBxIFRoZSBxdWF0ZXJuaW9uLlxuICogQHJldHVybiB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBBIG5ldyBxdWF0ZXJuaW9uIGlkZW50aWNhbCB0byBxLlxuICovXG5tYWluLnF1YXRlcm5pb25zLmNvcHkgPSBmdW5jdGlvbihxKSB7XG4gIHJldHVybiBxLnNsaWNlKCk7XG59O1xuXG4vKipcbiAqIE5lZ2F0ZXMgYSBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IHEgVGhlIHF1YXRlcm5pb24uXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IC1xLlxuICovXG5tYWluLnF1YXRlcm5pb25zLm5lZ2F0aXZlID0gZnVuY3Rpb24ocSkge1xuICByZXR1cm4gWy1xWzBdLCAtcVsxXSwgLXFbMl0sIC1xWzNdXTtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gUXVhdGVybmlvbnMuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gYSBPcGVyYW5kIFF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gYiBPcGVyYW5kIFF1YXRlcm5pb24uXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBzdW0gb2YgYSBhbmQgYi5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5hZGRRdWF0ZXJuaW9uUXVhdGVybmlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIFthWzBdICsgYlswXSxcbiAgICAgICAgICBhWzFdICsgYlsxXSxcbiAgICAgICAgICBhWzJdICsgYlsyXSxcbiAgICAgICAgICBhWzNdICsgYlszXV07XG59O1xuXG4vKipcbiAqIEFkZHMgYSBxdWF0ZXJuaW9uIHRvIGEgc2NhbGFyLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGEgT3BlcmFuZCBRdWF0ZXJuaW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGIgT3BlcmFuZCBTY2FsYXIuXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBzdW0gb2YgYSBhbmQgYi5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5hZGRRdWF0ZXJuaW9uU2NhbGFyID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYS5zbGljZSgwLCAzKS5jb25jYXQoYVszXSArIGIpO1xufTtcblxuLyoqXG4gKiBBZGRzIGEgc2NhbGFyIHRvIGEgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhIE9wZXJhbmQgc2NhbGFyLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGIgT3BlcmFuZCBxdWF0ZXJuaW9uLlxuICogQHJldHVybiB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBUaGUgc3VtIG9mIGEgYW5kIGIuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuYWRkU2NhbGFyUXVhdGVybmlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGIuc2xpY2UoMCwgMykuY29uY2F0KGEgKyBiWzNdKTtcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHR3byBxdWF0ZXJuaW9ucy5cbiAqIEBwYXJhbSB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBhIE9wZXJhbmQgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBiIE9wZXJhbmQgcXVhdGVybmlvbi5cbiAqIEByZXR1cm4ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gVGhlIGRpZmZlcmVuY2UgYSAtIGIuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuc3ViUXVhdGVybmlvblF1YXRlcm5pb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBbYVswXSAtIGJbMF0sXG4gICAgICAgICAgYVsxXSAtIGJbMV0sXG4gICAgICAgICAgYVsyXSAtIGJbMl0sXG4gICAgICAgICAgYVszXSAtIGJbM11dO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgYSBzY2FsYXIgZnJvbSBhIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gYSBPcGVyYW5kIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYiBPcGVyYW5kIHNjYWxhci5cbiAqIEByZXR1cm4ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gVGhlIGRpZmZlcmVuY2UgYSAtIGIuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuc3ViUXVhdGVybmlvblNjYWxhciA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEuc2xpY2UoMCwgMykuY29uY2F0KGFbM10gLSBiKTtcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIGEgcXVhdGVybmlvbiBmcm9tIGEgc2NhbGFyLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgT3BlcmFuZCBzY2FsYXIuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gYiBPcGVyYW5kIHF1YXRlcm5pb24uXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBkaWZmZXJlbmNlIGEgLSBiLlxuICovXG5tYWluLnF1YXRlcm5pb25zLnN1YlNjYWxhclF1YXRlcm5pb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBbLWJbMF0sIC1iWzFdLCAtYlsyXSwgYSAtIGJbM11dO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIGEgc2NhbGFyIGJ5IGEgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBrIFRoZSBzY2FsYXIuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gcSBUaGUgcXVhdGVybmlvbi5cbiAqIEByZXR1cm4ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gVGhlIHByb2R1Y3Qgb2YgayBhbmQgcS5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5tdWxTY2FsYXJRdWF0ZXJuaW9uID0gZnVuY3Rpb24oaywgcSkge1xuICByZXR1cm4gW2sgKiBxWzBdLCBrICogcVsxXSwgayAqIHFbMl0sIGsgKiBxWzNdXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyBhIHF1YXRlcm5pb24gYnkgYSBzY2FsYXIuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gcSBUaGUgUXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBrIFRoZSBzY2FsYXIuXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBwcm9kdWN0IG9mIGsgYW5kIHYuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMubXVsUXVhdGVybmlvblNjYWxhciA9IGZ1bmN0aW9uKHEsIGspIHtcbiAgcmV0dXJuIFtrICogcVswXSwgayAqIHFbMV0sIGsgKiBxWzJdLCBrICogcVszXV07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXRlcm5pb25zLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGEgT3BlcmFuZCBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGIgT3BlcmFuZCBxdWF0ZXJuaW9uLlxuICogQHJldHVybiB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbiBwcm9kdWN0IGEgKiBiLlxuICovXG5tYWluLnF1YXRlcm5pb25zLm11bFF1YXRlcm5pb25RdWF0ZXJuaW9uID0gZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYVggPSBhWzBdO1xuICB2YXIgYVkgPSBhWzFdO1xuICB2YXIgYVogPSBhWzJdO1xuICB2YXIgYVcgPSBhWzNdO1xuICB2YXIgYlggPSBiWzBdO1xuICB2YXIgYlkgPSBiWzFdO1xuICB2YXIgYlogPSBiWzJdO1xuICB2YXIgYlcgPSBiWzNdO1xuXG4gIHJldHVybiBbXG4gICAgICBhVyAqIGJYICsgYVggKiBiVyArIGFZICogYlogLSBhWiAqIGJZLFxuICAgICAgYVcgKiBiWSArIGFZICogYlcgKyBhWiAqIGJYIC0gYVggKiBiWixcbiAgICAgIGFXICogYlogKyBhWiAqIGJXICsgYVggKiBiWSAtIGFZICogYlgsXG4gICAgICBhVyAqIGJXIC0gYVggKiBiWCAtIGFZICogYlkgLSBhWiAqIGJaXTtcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0d28gcXVhdGVybmlvbnM7IGFzc3VtZXMgdGhlIGNvbnZlbnRpb24gdGhhdCBhL2IgPSBhKigxL2IpLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGEgT3BlcmFuZCBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGIgT3BlcmFuZCBxdWF0ZXJuaW9uLlxuICogQHJldHVybiB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbiBxdW90aWVudCBhIC8gYi5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5kaXZRdWF0ZXJuaW9uUXVhdGVybmlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGFYID0gYVswXTtcbiAgdmFyIGFZID0gYVsxXTtcbiAgdmFyIGFaID0gYVsyXTtcbiAgdmFyIGFXID0gYVszXTtcbiAgdmFyIGJYID0gYlswXTtcbiAgdmFyIGJZID0gYlsxXTtcbiAgdmFyIGJaID0gYlsyXTtcbiAgdmFyIGJXID0gYlszXTtcblxuICB2YXIgZCA9IDEgLyAoYlcgKiBiVyArIGJYICogYlggKyBiWSAqIGJZICsgYlogKiBiWik7XG4gIHJldHVybiBbXG4gICAgICAoYVggKiBiVyAtIGFXICogYlggLSBhWSAqIGJaICsgYVogKiBiWSkgKiBkLFxuICAgICAgKGFYICogYlogLSBhVyAqIGJZICsgYVkgKiBiVyAtIGFaICogYlgpICogZCxcbiAgICAgIChhWSAqIGJYICsgYVogKiBiVyAtIGFXICogYlogLSBhWCAqIGJZKSAqIGQsXG4gICAgICAoYVcgKiBiVyArIGFYICogYlggKyBhWSAqIGJZICsgYVogKiBiWikgKiBkXTtcbn07XG5cbi8qKlxuICogRGl2aWRlcyBhIFF1YXRlcm5pb24gYnkgYSBzY2FsYXIuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gcSBUaGUgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBrIFRoZSBzY2FsYXIuXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IHEgVGhlIHF1YXRlcm5pb24gcSBkaXZpZGVkIGJ5IGsuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuZGl2UXVhdGVybmlvblNjYWxhciA9IGZ1bmN0aW9uKHEsIGspIHtcbiAgcmV0dXJuIFtxWzBdIC8gaywgcVsxXSAvIGssIHFbMl0gLyBrLCBxWzNdIC8ga107XG59O1xuXG4vKipcbiAqIERpdmlkZXMgYSBzY2FsYXIgYnkgYSBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGEgT3BlcmFuZCBzY2FsYXIuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gYiBPcGVyYW5kIHF1YXRlcm5pb24uXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBxdWF0ZXJuaW9uIHByb2R1Y3QuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuZGl2U2NhbGFyUXVhdGVybmlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGIwID0gYlswXTtcbiAgdmFyIGIxID0gYlsxXTtcbiAgdmFyIGIyID0gYlsyXTtcbiAgdmFyIGIzID0gYlszXTtcblxuICB2YXIgZCA9IDEgLyAoYjAgKiBiMCArIGIxICogYjEgKyBiMiAqIGIyICsgYjMgKiBiMyk7XG4gIHJldHVybiBbLWEgKiBiMCAqIGQsIC1hICogYjEgKiBkLCAtYSAqIGIyICogZCwgYSAqIGIzICogZF07XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBtdWx0aXBsaWNhdGl2ZSBpbnZlcnNlIG9mIGEgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBxIFRoZSBxdWF0ZXJuaW9uLlxuICogQHJldHVybiB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBUaGUgbXVsdGlwbGljYXRpdmUgaW52ZXJzZSBvZiBxLlxuICovXG5tYWluLnF1YXRlcm5pb25zLmludmVyc2UgPSBmdW5jdGlvbihxKSB7XG4gIHZhciBxMCA9IHFbMF07XG4gIHZhciBxMSA9IHFbMV07XG4gIHZhciBxMiA9IHFbMl07XG4gIHZhciBxMyA9IHFbM107XG5cbiAgdmFyIGQgPSAxIC8gKHEwICogcTAgKyBxMSAqIHExICsgcTIgKiBxMiArIHEzICogcTMpO1xuICByZXR1cm4gWy1xMCAqIGQsIC1xMSAqIGQsIC1xMiAqIGQsIHEzICogZF07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG9iamVjdHMgd2hpY2ggYXJlIGVpdGhlciBzY2FsYXJzIG9yIHF1YXRlcm5pb25zLlxuICogQHBhcmFtIHsobWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufG51bWJlcil9IGEgT3BlcmFuZC5cbiAqIEBwYXJhbSB7KG1haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbnxudW1iZXIpfSBiIE9wZXJhbmQuXG4gKiBAcmV0dXJuIHsobWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufG51bWJlcil9IFRoZSBwcm9kdWN0IG9mIGEgYW5kIGIuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMubXVsID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gbWFpbi5xdWF0ZXJuaW9uc1snbXVsJyArIG1haW4ucXVhdGVybmlvbnMubWF0aFR5cGUoYSkgK1xuICAgICAgbWFpbi5xdWF0ZXJuaW9ucy5tYXRoVHlwZShiKV0oYSwgYik7XG59O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIG9iamVjdHMgd2hpY2ggYXJlIGVpdGhlciBzY2FsYXJzIG9yIHF1YXRlcm5pb25zLlxuICogQHBhcmFtIHsobWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufG51bWJlcil9IGEgT3BlcmFuZC5cbiAqIEBwYXJhbSB7KG1haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbnxudW1iZXIpfSBiIE9wZXJhbmQuXG4gKiBAcmV0dXJuIHsobWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufG51bWJlcil9IFRoZSBxdW90aWVudCBvZiBhIGFuZCBiLlxuICovXG5tYWluLnF1YXRlcm5pb25zLmRpdiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG1haW4ucXVhdGVybmlvbnNbJ2RpdicgKyBtYWluLnF1YXRlcm5pb25zLm1hdGhUeXBlKGEpICtcbiAgICAgIG1haW4ucXVhdGVybmlvbnMubWF0aFR5cGUoYildKGEsIGIpO1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byBvYmplY3RzIHdoaWNoIGFyZSBlaXRoZXIgc2NhbGFycyBvciBxdWF0ZXJuaW9ucy5cbiAqIEBwYXJhbSB7KG1haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbnxudW1iZXIpfSBhIE9wZXJhbmQuXG4gKiBAcGFyYW0geyhtYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb258bnVtYmVyKX0gYiBPcGVyYW5kLlxuICogQHJldHVybiB7KG1haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbnxudW1iZXIpfSBUaGUgc3VtIG9mIGEgYW5kIGIuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuYWRkID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gbWFpbi5xdWF0ZXJuaW9uc1snYWRkJyArIG1haW4ucXVhdGVybmlvbnMubWF0aFR5cGUoYSkgK1xuICAgICAgbWFpbi5xdWF0ZXJuaW9ucy5tYXRoVHlwZShiKV0oYSwgYik7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gb2JqZWN0cyB3aGljaCBhcmUgZWl0aGVyIHNjYWxhcnMgb3IgcXVhdGVybmlvbnMuXG4gKiBAcGFyYW0geyhtYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb258bnVtYmVyKX0gYSBPcGVyYW5kLlxuICogQHBhcmFtIHsobWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufG51bWJlcil9IGIgT3BlcmFuZC5cbiAqIEByZXR1cm4geyhtYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb258bnVtYmVyKX0gVGhlIGRpZmZlcmVuY2Ugb2YgYSBhbmQgYi5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5zdWIgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBtYWluLnF1YXRlcm5pb25zWydzdWInICsgbWFpbi5xdWF0ZXJuaW9ucy5tYXRoVHlwZShhKSArXG4gICAgICBtYWluLnF1YXRlcm5pb25zLm1hdGhUeXBlKGIpXShhLCBiKTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGxlbmd0aCBvZiBhIFF1YXRlcm5pb24sIGkuZS4gdGhlIHNxdWFyZSByb290IG9mIHRoZVxuICogc3VtIG9mIHRoZSBzcXVhcmVzIG9mIHRoZSBjb2VmZmljaWVudHMuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gYSBUaGUgUXVhdGVybmlvbi5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIGxlbmd0aCBvZiBhLlxuICovXG5tYWluLnF1YXRlcm5pb25zLmxlbmd0aCA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIE1hdGguc3FydChhWzBdICogYVswXSArIGFbMV0gKiBhWzFdICsgYVsyXSAqIGFbMl0gKyBhWzNdICogYVszXSk7XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBzcXVhcmUgb2YgdGhlIGxlbmd0aCBvZiBhIHF1YXRlcm5pb24sIGkuZS4gdGhlIHN1bSBvZiB0aGVcbiAqIHNxdWFyZXMgb2YgdGhlIGNvZWZmaWNpZW50cy5cbiAqIEBwYXJhbSB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBhIFRoZSBxdWF0ZXJuaW9uLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgc3F1YXJlIG9mIHRoZSBsZW5ndGggb2YgYS5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5sZW5ndGhTcXVhcmVkID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYVswXSAqIGFbMF0gKyBhWzFdICogYVsxXSArIGFbMl0gKiBhWzJdICsgYVszXSAqIGFbM107XG59O1xuXG4vKipcbiAqIERpdmlkZXMgYSBRdWF0ZXJuaW9uIGJ5IGl0cyBsZW5ndGggYW5kIHJldHVybnMgdGhlIHF1b3RpZW50LlxuICogQHBhcmFtIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IGEgVGhlIFF1YXRlcm5pb24uXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IEEgdW5pdCBsZW5ndGggcXVhdGVybmlvbiBwb2ludGluZyBpblxuICogICAgIHRoZSBzYW1lIGRpcmVjdGlvbiBhcyBhLlxuICovXG5tYWluLnF1YXRlcm5pb25zLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKGEpIHtcbiAgdmFyIGQgPSAxIC8gTWF0aC5zcXJ0KGFbMF0gKiBhWzBdICsgYVsxXSAqIGFbMV0gKyBhWzJdICogYVsyXSArIGFbM10gKiBhWzNdKTtcbiAgcmV0dXJuIFthWzBdICogZCwgYVsxXSAqIGQsIGFbMl0gKiBkLCBhWzNdICogZF07XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjb25qdWdhdGUgb2YgdGhlIGdpdmVuIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gcSBUaGUgcXVhdGVybmlvbi5cbiAqIEByZXR1cm4ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gVGhlIGNvbmp1Z2F0ZSBvZiBxLlxuICovXG5tYWluLnF1YXRlcm5pb25zLmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKHEpIHtcbiAgcmV0dXJuIFstcVswXSwgLXFbMV0sIC1xWzJdLCBxWzNdXTtcbn07XG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiB3aGljaCByb3RhdGVzIGFyb3VuZCB0aGUgeC1heGlzIGJ5IHRoZSBnaXZlbiBhbmdsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSBUaGUgYW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlIChpbiByYWRpYW5zKS5cbiAqIEByZXR1cm4ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24uXG4gKi9cbm1haW4ucXVhdGVybmlvbnMucm90YXRpb25YID0gZnVuY3Rpb24oYW5nbGUpIHtcbiAgcmV0dXJuIFtNYXRoLnNpbihhbmdsZSAvIDIpLCAwLCAwLCBNYXRoLmNvcyhhbmdsZSAvIDIpXTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gd2hpY2ggcm90YXRlcyBhcm91bmQgdGhlIHktYXhpcyBieSB0aGUgZ2l2ZW4gYW5nbGUuXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IFRoZSBxdWF0ZXJuaW9uLlxuICovXG5tYWluLnF1YXRlcm5pb25zLnJvdGF0aW9uWSA9IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gIHJldHVybiBbMCwgTWF0aC5zaW4oYW5nbGUgLyAyKSwgMCwgTWF0aC5jb3MoYW5nbGUgLyAyKV07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIHdoaWNoIHJvdGF0ZXMgYXJvdW5kIHRoZSB6LWF4aXMgYnkgdGhlIGdpdmVuIGFuZ2xlLlxuICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICogQHJldHVybiB7bWFpbi5xdWF0ZXJuaW9ucy5RdWF0ZXJuaW9ufSBUaGUgcXVhdGVybmlvbi5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5yb3RhdGlvblogPSBmdW5jdGlvbihhbmdsZSkge1xuICByZXR1cm4gWzAsIDAsIE1hdGguc2luKGFuZ2xlIC8gMiksIE1hdGguY29zKGFuZ2xlIC8gMildO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiB3aGljaCByb3RhdGVzIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpcyBieSB0aGUgZ2l2ZW5cbiAqIGFuZ2xlLlxuICogQHBhcmFtIHttYWluLm1hdGguVmVjdG9yM30gYXhpcyBUaGUgYXhpcyBhYm91dCB3aGljaCB0byByb3RhdGUuXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gKiBAcmV0dXJuIHttYWluLnF1YXRlcm5pb25zLlF1YXRlcm5pb259IEEgcXVhdGVybmlvbiB3aGljaCByb3RhdGVzIGFuZ2xlXG4gKiAgICAgcmFkaWFucyBhcm91bmQgdGhlIGF4aXMuXG4gKi9cbm1haW4ucXVhdGVybmlvbnMuYXhpc1JvdGF0aW9uID0gZnVuY3Rpb24oYXhpcywgYW5nbGUpIHtcbiAgdmFyIGQgPSAxIC8gTWF0aC5zcXJ0KGF4aXNbMF0gKiBheGlzWzBdICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF4aXNbMV0gKiBheGlzWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF4aXNbMl0gKiBheGlzWzJdKTtcbiAgdmFyIHNpbiA9IE1hdGguc2luKGFuZ2xlIC8gMik7XG4gIHZhciBjb3MgPSBNYXRoLmNvcyhhbmdsZSAvIDIpO1xuICByZXR1cm4gW3NpbiAqIGF4aXNbMF0gKiBkLCBzaW4gKiBheGlzWzFdICogZCwgc2luICogYXhpc1syXSAqIGQsIGNvc107XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIGEgNC1ieS00IHJvdGF0aW9uIG1hdHJpeCAod2l0aCB0cml2aWFsIHRyYW5zbGF0aW9uIGNvbXBvbmVudClcbiAqIGdpdmVuIGEgcXVhdGVybmlvbi4gIFdlIGFzc3VtZSB0aGUgY29udmVudGlvbiB0aGF0IHRvIHJvdGF0ZSBhIHZlY3RvciB2IGJ5XG4gKiBhIHF1YXRlcm5pb24gciBtZWFucyB0byBleHByZXNzIHRoYXQgdmVjdG9yIGFzIGEgcXVhdGVybmlvbiBxIGJ5IGxldHRpbmdcbiAqIGBxID0gW3ZbMF0sIHZbMV0sIHZbMl0sIDBdYCBhbmQgdGhlbiBvYnRhaW4gdGhlIHJvdGF0ZWRcbiAqIHZlY3RvciBieSBldmFsdWF0aW5nIHRoZSBleHByZXNzaW9uIGAociAqIHEpIC8gcmAuXG4gKiBAcGFyYW0ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gcSBUaGUgcXVhdGVybmlvbi5cbiAqIEByZXR1cm4ge21haW4ubWF0aC5NYXRyaXg0fSBBIDQtYnktNCByb3RhdGlvbiBtYXRyaXguXG4gKi9cbm1haW4ucXVhdGVybmlvbnMucXVhdGVybmlvblRvUm90YXRpb24gPSBmdW5jdGlvbihxKSB7XG4gIHZhciBxWCA9IHFbMF07XG4gIHZhciBxWSA9IHFbMV07XG4gIHZhciBxWiA9IHFbMl07XG4gIHZhciBxVyA9IHFbM107XG5cbiAgdmFyIHFXcVcgPSBxVyAqIHFXO1xuICB2YXIgcVdxWCA9IHFXICogcVg7XG4gIHZhciBxV3FZID0gcVcgKiBxWTtcbiAgdmFyIHFXcVogPSBxVyAqIHFaO1xuICB2YXIgcVhxVyA9IHFYICogcVc7XG4gIHZhciBxWHFYID0gcVggKiBxWDtcbiAgdmFyIHFYcVkgPSBxWCAqIHFZO1xuICB2YXIgcVhxWiA9IHFYICogcVo7XG4gIHZhciBxWXFXID0gcVkgKiBxVztcbiAgdmFyIHFZcVggPSBxWSAqIHFYO1xuICB2YXIgcVlxWSA9IHFZICogcVk7XG4gIHZhciBxWXFaID0gcVkgKiBxWjtcbiAgdmFyIHFacVcgPSBxWiAqIHFXO1xuICB2YXIgcVpxWCA9IHFaICogcVg7XG4gIHZhciBxWnFZID0gcVogKiBxWTtcbiAgdmFyIHFacVogPSBxWiAqIHFaO1xuXG4gIHZhciBkID0gcVdxVyArIHFYcVggKyBxWXFZICsgcVpxWjtcblxuICByZXR1cm4gW1xuICAgIChxV3FXICsgcVhxWCAtIHFZcVkgLSBxWnFaKSAvIGQsXG4gICAgIDIgKiAocVdxWiArIHFYcVkpIC8gZCxcbiAgICAgMiAqIChxWHFaIC0gcVdxWSkgLyBkLCAwLFxuXG4gICAgIDIgKiAocVhxWSAtIHFXcVopIC8gZCxcbiAgICAgKHFXcVcgLSBxWHFYICsgcVlxWSAtIHFacVopIC8gZCxcbiAgICAgMiAqIChxV3FYICsgcVlxWikgLyBkLCAwLFxuXG4gICAgIDIgKiAocVdxWSArIHFYcVopIC8gZCxcbiAgICAgMiAqIChxWXFaIC0gcVdxWCkgLyBkLFxuICAgICAocVdxVyAtIHFYcVggLSBxWXFZICsgcVpxWikgLyBkLCAwLFxuXG4gICAgIDAsIDAsIDAsIDFdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyBhIHF1YXRlcm5pb24gd2hvc2Ugcm90YXRpb24gaXMgZXF1aXZhbGVudCB0byB0aGUgZ2l2ZW4gbWF0cml4LlxuICogQHBhcmFtIHsobWFpbi5tYXRoLk1hdHJpeDR8bWFpbi5tYXRoLk1hdHJpeDMpfSBtIEEgMy1ieS0zIG9yIDQtYnktNFxuICogICAgIHJvdGF0aW9uIG1hdHJpeC5cbiAqIEByZXR1cm4ge21haW4ucXVhdGVybmlvbnMuUXVhdGVybmlvbn0gQSBxdWF0ZXJuaW9uIHEgc3VjaCB0aGF0XG4gKiAgICAgcXVhdGVybmlvbnMucXVhdGVybmlvblRvUm90YXRpb24ocSkgaXMgbS5cbiAqL1xubWFpbi5xdWF0ZXJuaW9ucy5yb3RhdGlvblRvUXVhdGVybmlvbiA9IGZ1bmN0aW9uKG0pIHtcbiAgdmFyIHU7XG4gIHZhciB2O1xuICB2YXIgdztcblxuICAvLyBDaG9vc2UgdSwgdiwgYW5kIHcgc3VjaCB0aGF0IHUgaXMgdGhlIGluZGV4IG9mIHRoZSBiaWdnZXN0IGRpYWdvbmFsIGVudHJ5XG4gIC8vIG9mIG0sIGFuZCB1IHYgdyBpcyBhbiBldmVuIHBlcm11dGF0aW9uIG9mIDAgMSBhbmQgMi5cbiAgaWYgKG1bMCo0KzBdID4gbVsxKjQrMV0gJiYgbVswKjQrMF0gPiBtWzIqNCsyXSkge1xuICAgIHUgPSAwO1xuICAgIHYgPSAxO1xuICAgIHcgPSAyO1xuICB9IGVsc2UgaWYgKG1bMSo0KzFdID4gbVswKjQrMF0gJiYgbVsxKjQrMV0gPiBtWzIqNCsyXSkge1xuICAgIHUgPSAxO1xuICAgIHYgPSAyO1xuICAgIHcgPSAwO1xuICB9IGVsc2Uge1xuICAgIHUgPSAyO1xuICAgIHYgPSAwO1xuICAgIHcgPSAxO1xuICB9XG5cbiAgdmFyIHIgPSBNYXRoLnNxcnQoMSArIG1bdSo0K3VdIC0gbVt2KjQrdl0gLSBtW3cqNCt3XSk7XG4gIHZhciBxID0gW107XG4gIHFbdV0gPSAwLjUgKiByO1xuICBxW3ZdID0gMC41ICogKG1bdio0K3VdICsgbVt1KjQrdl0pIC8gcjtcbiAgcVt3XSA9IDAuNSAqIChtW3UqNCt3XSArIG1bdyo0K3VdKSAvIHI7XG4gIHFbM10gPSAwLjUgKiAobVt2KjQrd10gLSBtW3cqNCt2XSkgLyByO1xuXG4gIHJldHVybiBxO1xufTtcblxuIiwibW9kdWxlLmV4cG9ydHMuZGlzdGFuY2UgPSBmdW5jdGlvbiAocWEsIHFiKSB7XG4gIHZhciBjb3NIYWxmVGhldGEgPSBxYVswXSAqIHFiWzBdICsgcWFbMV0gKiBxYlsxXSArIHFhWzJdICogcWJbMl0gKyBxYVszXSAqIHFiWzNdO1xuICByZXR1cm4gTWF0aC5hY29zKDIgKiAoY29zSGFsZlRoZXRhICogY29zSGFsZlRoZXRhKSAtIDEpXG59XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL21hdGgvUXVhdGVybmlvbi5qc1xubW9kdWxlLmV4cG9ydHMuc2xlcnAgPSBmdW5jdGlvbiAoIHFhLCBxYiwgdCwgYWJzb2x1dGUpIHtcblxuICBpZiAoIWFic29sdXRlKSB7XG4gICAgaWYgKHQgPT09IDAgKSByZXR1cm4gW3FhWzBdLCBxYVsxXSwgcWFbMl0sIHFhWzNdXTtcbiAgICBpZiAodCA9PT0gMSApIHJldHVybiBbcWJbMF0sIHFiWzFdLCBxYlsyXSwgcWJbM11dO1xuICB9XG5cbiAgLy8gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvYWxnZWJyYS9yZWFsTm9ybWVkQWxnZWJyYS9xdWF0ZXJuaW9ucy9zbGVycC9cblxuICB2YXIgY29zSGFsZlRoZXRhID0gcWFbMF0gKiBxYlswXSArIHFhWzFdICogcWJbMV0gKyBxYVsyXSAqIHFiWzJdICsgcWFbM10gKiBxYlszXTtcblxuICB2YXIgX3FhID0gcWFcbiAgcWEgPSBbcWFbMF0sIHFhWzFdLCBxYVsyXSwgcWFbM11dXG4gIFxuICBpZiAoIGNvc0hhbGZUaGV0YSA8IDAgKSB7XG5cbiAgICBxYVswXSA9IC1xYlswXTtcbiAgICBxYVsxXSA9IC1xYlsxXTtcbiAgICBxYVsyXSA9IC1xYlsyXTtcbiAgICBxYVszXSA9IC1xYlszXTtcblxuICAgIGNvc0hhbGZUaGV0YSA9IC1jb3NIYWxmVGhldGE7XG5cbiAgfSBlbHNlIHtcbiAgICBcbiAgICBxYVswXSA9IHFiWzBdO1xuICAgIHFhWzFdID0gcWJbMV07XG4gICAgcWFbMl0gPSBxYlsyXTtcbiAgICBxYVszXSA9IHFiWzNdO1xuXG4gIH1cblxuICBpZiAoIGNvc0hhbGZUaGV0YSA+PSAxLjAgKSB7XG5cbiAgICBxYVswXSA9IF9xYVswXTtcbiAgICBxYVsxXSA9IF9xYVsxXTtcbiAgICBxYVsyXSA9IF9xYVsyXTtcbiAgICBxYVszXSA9IF9xYVszXTtcblxuICAgIHJldHVybiBxYTtcblxuICB9XG5cbiAgdmFyIGhhbGZUaGV0YSA9IE1hdGguYWNvcyggY29zSGFsZlRoZXRhICk7XG4gIHZhciBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoIDEuMCAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YSApO1xuXG4gIGlmICggTWF0aC5hYnMoIHNpbkhhbGZUaGV0YSApIDwgMC4wMDEgKSB7XG5cbiAgICBxYVswXSA9IDAuNSAqICggX3FhWzBdICsgcWFbMF0gKTtcbiAgICBxYVsxXSA9IDAuNSAqICggX3FhWzFdICsgcWFbMV0gKTtcbiAgICBxYVsyXSA9IDAuNSAqICggX3FhWzJdICsgcWFbMl0gKTtcbiAgICBxYVszXSA9IDAuNSAqICggX3FhWzNdICsgcWFbM10gKTtcblxuICAgIHJldHVybiBxYTtcblxuICB9XG4gIFxuICBpZiAoYWJzb2x1dGUpIHtcbiAgICB2YXIgdGhldGEgPSBNYXRoLmFjb3MoMiAqIChjb3NIYWxmVGhldGEgKiBjb3NIYWxmVGhldGEpIC0gMSlcbiAgICB0ID0gdCAvIHRoZXRhXG4gICAgaWYgKHQgPT09IDAgKSByZXR1cm4gW3FhWzBdLCBxYVsxXSwgcWFbMl0sIHFhWzNdXTtcbiAgICBpZiAodCA9PT0gMSApIHJldHVybiBbcWJbMF0sIHFiWzFdLCBxYlsyXSwgcWJbM11dO1xuICB9XG5cbiAgdmFyIHJhdGlvQSA9IE1hdGguc2luKCAoIDEgLSB0ICkgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YSxcbiAgcmF0aW9CID0gTWF0aC5zaW4oIHQgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YTtcblxuICBxYVswXSA9ICggX3FhWzBdICogcmF0aW9BICsgcWFbMF0gKiByYXRpb0IgKTtcbiAgcWFbMV0gPSAoIF9xYVsxXSAqIHJhdGlvQSArIHFhWzFdICogcmF0aW9CICk7XG4gIHFhWzJdID0gKCBfcWFbMl0gKiByYXRpb0EgKyBxYVsyXSAqIHJhdGlvQiApO1xuICBxYVszXSA9ICggX3FhWzNdICogcmF0aW9BICsgcWFbM10gKiByYXRpb0IgKTtcblxuICByZXR1cm4gcWE7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaiA9IDA7XG4gIHZhciBmcmFtZXMgPSAxMDAwLzYwO1xuICB2YXIgcmF0ZSA9IDA7XG4gIHZhciBvID0ge1xuICAgIGxvZyA6IGZ1bmN0aW9uKGZyZXF1ZW5jeSwgbG9nKSB7XG4gICAgICBpZihqICUgZnJlcXVlbmN5ID09IDApIHtcbiAgICAgICAgbG9nID8gbG9nKHJhdGUpIDogY29uc29sZS5sb2cocmF0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICByZXR1cm4gZnVuY3Rpb24oZGVsdGEpe1xuICAgIGogKys7XG4gICAgZnJhbWVzICs9IChkZWx0YSAtIGZyYW1lcykvMTAwO1xuICAgIHJhdGUgPSAxMDAwL2ZyYW1lcztcbiAgICByZXR1cm4gbztcbiAgfVxufVxuIiwidmFyIHV0aWwgICAgICAgID0gcmVxdWlyZSgndXRpbCcpXG52YXIgUmVuZGVyU2V0ICAgPSByZXF1aXJlKCcuL3JlbmRlcl9zZXQnKVxudmFyIEJhc2ljQ2FtZXJhID0gcmVxdWlyZSgnLi9jYW1lcmEnKS5CYXNpY0NhbWVyYVxuXG5mdW5jdGlvbiBFbnZpcm9ubWVudChmcmFtZWJ1ZmZlcnMpIHtcblxuICB0aGlzLmZyYW1lYnVmZmVycyA9IGZyYW1lYnVmZmVycztcbiAgdGhpcy5jYW1lcmFzID0gW107XG4gIHRoaXMuY2FtZXJhID0gbnVsbDtcbiAgXG4gIGZvciAodmFyIGZmID0gMDsgZmYgPCA2OyArK2ZmKSB7XG4gICAgdmFyIGM7XG4gICAgdGhpcy5jYW1lcmFzLnB1c2goYyA9IG5ldyBCYXNpY0NhbWVyYShmcmFtZWJ1ZmZlcnMuc2l6ZSwgZnJhbWVidWZmZXJzLnNpemUsIC4xLCA0MDk2KSk7XG4gICAgYy5zZXRGT1YoOTAsIHRydWUpO1xuICB9XG4gIFxuICB0aGlzLmNhbWVyYXNbMl0ucm90YXRlQnkoMCwgTWF0aC5QSS8yLCAwKTtcbiAgdGhpcy5jYW1lcmFzWzNdLnJvdGF0ZUJ5KDAsIC1NYXRoLlBJLzIsIDApO1xuICB0aGlzLmNhbWVyYXNbNV0ucm90YXRlQnkoMCwgTWF0aC5QSSwgTWF0aC5QSSk7XG4gIHRoaXMuY2FtZXJhc1sxXS5yb3RhdGVCeSgwLCBNYXRoLlBJLCAtTWF0aC5QSS8yKTtcbiAgdGhpcy5jYW1lcmFzWzRdLnJvdGF0ZUJ5KDAsIE1hdGguUEksIDApO1xuICB0aGlzLmNhbWVyYXNbMF0ucm90YXRlQnkoMCwgTWF0aC5QSSwgTWF0aC5QSS8yKTtcbiAgXG4gIFJlbmRlclNldC5jYWxsKHRoaXMpXG59XG51dGlsLmluaGVyaXRzKEVudmlyb25tZW50LCBSZW5kZXJTZXQpXG5cbkVudmlyb25tZW50LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoZ2wpIHtcbiAgZm9yICh2YXIgZmYgPSAwOyBmZiA8IDY7ICsrZmYpIHtcbiAgICB0aGlzLmZyYW1lYnVmZmVycy5iaW5kKGZmKTtcbiAgICB0aGlzLmNhbWVyYSA9IHRoaXMuY2FtZXJhc1tmZl07XG4gICAgUmVuZGVyU2V0LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzLCBnbCk7XG4gIH1cbiAgdGhpcy5mcmFtZWJ1ZmZlcnMudW5iaW5kKCk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEVudmlyb25tZW50IiwidmFyIFJlbmRlcmFibGUgPSByZXF1aXJlKCcuL3JlbmRlcmFibGUnKVxuXG5mdW5jdGlvbiBSZW5kZXJTZXQoKXtcbiAgdGhpcy5yZW5kZXJhYmxlcyA9IFtdO1xuICB0aGlzLnJlbmRlcmFibGVzRGlydHkgPSBmYWxzZTtcbn1cblxuUmVuZGVyU2V0LnByb3RvdHlwZS5hZGRSZW5kZXJhYmxlID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgaWYgKCEocmVuZGVyYWJsZSBpbnN0YW5jZW9mIFJlbmRlcmFibGUpKVxuICAgIHJlbmRlcmFibGUgPSBuZXcgUmVuZGVyYWJsZShyZW5kZXJhYmxlKVxuXG4gIHRoaXMucmVuZGVyYWJsZXMucHVzaChyZW5kZXJhYmxlKTtcbiAgdGhpcy5yZW5kZXJhYmxlc0RpcnR5ID0gdHJ1ZTtcbn1cblxuUmVuZGVyU2V0LnByb3RvdHlwZS5jaGVja1NvcnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnJlbmRlcmFibGVzRGlydHkpIHtcbiAgICB0aGlzLnNvcnRSZW5kZXJhYmxlcygpO1xuICB9XG59XG5cblJlbmRlclNldC5wcm90b3R5cGUuc29ydFJlbmRlcmFibGVzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJlbmRlcmFibGVzID0gdGhpcy5yZW5kZXJhYmxlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGIuc2hvdWxkUHJlY2VkZShhKSB8fCAtYS5zaG91bGRQcmVjZWRlKGIpO1xuICB9KVxuXG4gIHRoaXMucmVuZGVyYWJsZXNEaXJ0eSA9IGZhbHNlO1xufVxuXG5SZW5kZXJTZXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChnbCkge1xuICB0aGlzLmNoZWNrU29ydCgpO1xuICBcbiAgZm9yICh2YXIgaT0wOyBpPHRoaXMucmVuZGVyYWJsZXMubGVuZ3RoOyBpICsrKSB7XG4gICAgdGhpcy5yZW5kZXJhYmxlc1tpXS5yZW5kZXIoZ2wpO1xuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJTZXQiLCJ2YXIgQWNvbW1vZGF0b3IgPSByZXF1aXJlKCcuL2FjY29tbW9kYXRvcicpLFxuICAgIHV0aWwgICAgICAgID0gcmVxdWlyZSgndXRpbCcpXG5cbmZ1bmN0aW9uIFJlbmRlcmFibGUob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gIFxuICBpZiAob3B0aW9ucy5yZW5kZXJPcmRlciAhPT0gZmFsc2UpXG4gICAgdGhpcy5yZW5kZXJPcmRlciA9IG9wdGlvbnMucmVuZGVyT3JkZXJcblxuICBpZiAob3B0aW9ucy5zaG91bGRQcmVjZWRlKVxuICAgIHRoaXMuc2hvdWxkUHJlY2VkZSA9IG9wdGlvbnMuc2hvdWxkUHJlY2VkZVxuICBcbiAgQWNvbW1vZGF0b3IuY2FsbCh0aGlzLCBvcHRpb25zLmZhY3RvcnkpXG59XG51dGlsLmluaGVyaXRzKFJlbmRlcmFibGUsIEFjb21tb2RhdG9yKVxuXG5SZW5kZXJhYmxlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoZ2wpIHtcbiAgdmFyIGZuXG5cbiAgZm4gPSB0aGlzLm9wdGlvbnMuYmVmb3JlXG4gIGZuICYmIGZuLmNhbGwodGhpcylcblxuICBmbiA9IHRoaXMub3B0aW9ucy5nZXRVbmlmb3Jtc1xuICBcbiAgdmFyIHVuaWZvcm1zID0gZm4gPyBmbi5jYWxsKHRoaXMpIDoge31cbiAgXG4gIGZuID0gdGhpcy5vcHRpb25zLnJlbmRlciB8fCB0aGlzLnJlbmRlck1vZGVsc1xuICBmbi5jYWxsKHRoaXMsIGdsLCB1bmlmb3JtcylcbiAgXG4gIGZuID0gdGhpcy5vcHRpb25zLmFmdGVyXG4gIGZuICYmIGZuLmNhbGwodGhpcylcbn1cblxuUmVuZGVyYWJsZS5wcm90b3R5cGUucmVuZGVyTW9kZWxzID0gZnVuY3Rpb24gKGdsLCB1bmlmb3Jtcykge1xuICB2YXIgbW9kZWxzID0gdGhpcy5yb29tc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVscy5sZW5ndGg7IGkgKyspIHtcbiAgICB2YXIgbW9kZWwgPSBtb2RlbHNbaV1cbiAgICBpZiAobW9kZWwuZGlydHkpXG4gICAgICBtb2RlbC5yZWZyZXNoKGdsKTtcblxuICAgIHZhciBnZW9tID0gbW9kZWwuZ2V0R2VvbWV0cnkoZ2wpO1xuICAgIG1vZGVsLmRyYXdQcmVwKGdlb20sIHVuaWZvcm1zKTtcbiAgICBnZW9tLmRyYXcoKTtcbiAgfVxufVxuXG5SZW5kZXJhYmxlLnByb3RvdHlwZS5zaG91bGRQcmVjZWRlID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgcmV0dXJuICh0aGlzLnJlbmRlck9yZGVyIHx8IDApIDwgKHJlbmRlcmFibGUucmVuZGVyT3JkZXIgfHwgMClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJhYmxlIiwiXG5mdW5jdGlvbiBBY2NvbW9kYXRvcihmYWN0b3J5LCBtYXhSb29tcykge1xuICB0aGlzLnJvb21zICAgID0gW11cbiAgdGhpcy5mYWN0b3J5ICA9IGZhY3RvcnlcbiAgdGhpcy5tYXhSb29tcyA9IG1heFJvb21zXG4gIHRoaXMuYWZmZWN0ZWQgPSB7fVxufVxuXG5BY2NvbW9kYXRvci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGd1ZXN0KSB7XG4gIHRoaXMuZ2V0Um9vbShndWVzdCkuYWRkKGd1ZXN0KVxuICByZXR1cm4gZ3Vlc3Rcbn1cblxuQWNjb21vZGF0b3IucHJvdG90eXBlLnJlbW92ZVVudXNlZCA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgaSBpbiB0aGlzLmFmZmVjdGVkKSB7XG4gICAgdmFyIHJvb20gPSB0aGlzLmFmZmVjdGVkW2ldXG4gICAgaWYgKHJvb20uaXNVbnVzZWQoKSkge1xuICAgICAgcm9vbS5yZW1vdmUoKVxuICAgICAgZm9yICh2YXIgaiA9IHRoaXMucm9vbXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqIC0tKSB7XG4gICAgICAgIGlmICh0aGlzLnJvb21zW2pdID09IHJvb20pIHtcbiAgICAgICAgICB0aGlzLnJvb21zLnNwbGljZShqLCAxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRoaXMuYWZmZWN0ZWQgPSB7fVxufVxuXG5BY2NvbW9kYXRvci5wcm90b3R5cGUuZ2V0Um9vbSA9IGZ1bmN0aW9uIChndWVzdCkge1xuICB2YXIgcm9vbSwgcm9vbXMgPSB0aGlzLnJvb21zXG4gIGZvciAodmFyIGk9MDsgaTxyb29tcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChyb29tc1tpXS5jYW5BY2NvbW1vZGF0ZShndWVzdCkpIHtcbiAgICAgIHJvb20gPSByb29tc1tpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoIXJvb20pIHtcbiAgICBpZiAocm9vbXMubGVuZ3RoID49IHRoaXMubWF4Um9vbXMpIHtcbiAgICAgIHRocm93ICdUb28gbWFueSByb29tcydcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ25ldyByb29tLCAnLCByb29tcy5sZW5ndGggKyAxLCAnIHRvdGFsJylcbiAgICByb29tcy51bnNoaWZ0KHJvb20gPSB0aGlzLmZhY3RvcnkoKSlcbiAgICBpZiAoIXJvb20uY2FuQWNjb21tb2RhdGUoZ3Vlc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuYWJsZSB0byBhY2NvbW1vZGF0ZScsIGd1ZXN0KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm9vbVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjY29tb2RhdG9yIiwidmFyIHV0aWwgICAgICA9IHJlcXVpcmUoJ3V0aWwnKVxudmFyIG00ICAgICAgICA9IHJlcXVpcmUoJy4uL2xpYi90d2dsJykubTRcbnZhciB2MyAgICAgICAgPSByZXF1aXJlKCcuLi9saWIvdHdnbCcpLnYzXG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKVxuXG5mdW5jdGlvbiBkZWdUb1JhZChhKSB7XG4gIHJldHVybiBhIC8gMTgwICogTWF0aC5QSVxufVxuXG5mdW5jdGlvbiBVbnJpZ2dlZENhbWVyYShmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCwgbmVhciwgZmFyKSB7XG4gIHRoaXMuZnJhbWVXaWR0aCA9IGZyYW1lV2lkdGggfHwgNTAwO1xuICB0aGlzLmZyYW1lSGVpZ2h0ID0gZnJhbWVIZWlnaHQgfHwgdGhpcy5mcmFtZVdpZHRoO1xuICB0aGlzLm5lYXIgPSBuZWFyIHx8IC4xO1xuICB0aGlzLmZhciA9IGZhciB8fCA0MDk2O1xuICB0aGlzLnBlcnNwZWN0aXZlID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XG4gIHRoaXMuc2V0Rk9WKCk7XG5cbiAgdGhpcy5tYXRyaXggPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcbiAgdGhpcy5za3ltYXRyaXggPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcbn1cbm1vZHVsZS5leHBvcnRzLlVucmlnZ2VkQ2FtZXJhID0gVW5yaWdnZWRDYW1lcmFcblxuVW5yaWdnZWRDYW1lcmEucHJvdG90eXBlLnVwZGF0ZUZPViA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zZXRGT1YodGhpcy5mb3YpO1xufVxuVW5yaWdnZWRDYW1lcmEucHJvdG90eXBlLnNldEZPViA9IGZ1bmN0aW9uKGZvdiwgbGVmdEhhbmRlZCl7XG4gIHRoaXMuZm92ID0gZm92O1xuICBpZighZm92KXtcbiAgICB2YXIgd2ggID0gdGhpcy5mcmFtZVdpZHRoID4gdGhpcy5mcmFtZUhlaWdodFxuICAgIHZhciB3aHIgPSB3aCBcbiAgICAgID8gdGhpcy5mcmFtZVdpZHRoIC8gdGhpcy5mcmFtZUhlaWdodCAvIDJcbiAgICAgIDogdGhpcy5mcmFtZUhlaWdodCAvIHRoaXMuZnJhbWVXaWR0aCAvIDJcblxuICAgIG00Lm9ydGhvKFxuICAgICAgLSAod2ggPyB3aHIgOiAuNSksXG4gICAgICB3aCA/IHdocjogLjUsXG4gICAgICAtICh3aCA/IC41IDogd2hyKSxcbiAgICAgIHdoID8gLjUgOiB3aHIsXG4gICAgICB0aGlzLm5lYXIsXG4gICAgICB0aGlzLmZhcixcbiAgICAgIHRoaXMucGVyc3BlY3RpdmVcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIG00LnBlcnNwZWN0aXZlKFxuICAgICAgZGVnVG9SYWQoZm92KSxcbiAgICAgIHRoaXMuZnJhbWVXaWR0aCAvIHRoaXMuZnJhbWVIZWlnaHQsXG4gICAgICB0aGlzLm5lYXIsXG4gICAgICB0aGlzLmZhcixcbiAgICAgIHRoaXMucGVyc3BlY3RpdmVcbiAgICApO1xuICAgIGlmICghbGVmdEhhbmRlZCkge1xuICAgICAgLy9yaWdodCBoYW5kZWQgY29vcmRpbmF0ZSBzcGFjZVxuICAgICAgdGhpcy5wZXJzcGVjdGl2ZVs4XSAgKj0gLTE7XG4gICAgICB0aGlzLnBlcnNwZWN0aXZlWzldICAqPSAtMTtcbiAgICAgIHRoaXMucGVyc3BlY3RpdmVbMTBdICo9IC0xO1xuICAgICAgdGhpcy5wZXJzcGVjdGl2ZVsxMV0gKj0gLTE7XG4gICAgfVxuICB9XG5cbiAgXG4gIHJldHVybiB0aGlzO1xufVxuVW5yaWdnZWRDYW1lcmEucHJvdG90eXBlLmdldEFzcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmFzcGVjdCkge1xuICAgIHZhciBsYXJnZXIgPSBNYXRoLm1heCh0aGlzLmZyYW1lSGVpZ2h0LCB0aGlzLmZyYW1lV2lkdGgpO1xuICAgIHRoaXMuYXNwZWN0ID0gW3RoaXMuZnJhbWVIZWlnaHQgLyBsYXJnZXIsICB0aGlzLmZyYW1lV2lkdGggLyBsYXJnZXIsIDEsIDBdO1xuICB9XG4gIHJldHVybiB0aGlzLmFzcGVjdDtcbn1cblVucmlnZ2VkQ2FtZXJhLnByb3RvdHlwZS5jb21wdXRlTWF0cml4ID0gZnVuY3Rpb24gKG1hdHJpeCkge1xuICBpZiAobWF0cml4KSB7XG4gICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XG4gIH0gZWxzZSB7XG4gICAgbTQuY29weSh0aGlzLnBlcnNwZWN0aXZlLCB0aGlzLm1hdHJpeCk7XG4gIH1cbiAgbTQuY29weSh0aGlzLm1hdHJpeCwgdGhpcy5za3ltYXRyaXgpO1xuICBtNC5zZXRUcmFuc2xhdGlvbih0aGlzLnNreW1hdHJpeCwgWzAsIDAsIDBdLCB0aGlzLnNreW1hdHJpeCk7XG4gIHJldHVybiB0aGlzLm1hdHJpeDtcbn1cblxuXG5mdW5jdGlvbiBCYXNpY0NhbWVyYShmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCwgbmVhciwgZmFyKSB7XG4gIFVucmlnZ2VkQ2FtZXJhLmNhbGwodGhpcywgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQsIG5lYXIsIGZhcik7XG5cbiAgdGhpcy50cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKCk7XG5cbiAgdGhpcy5vcmllbnRhdGlvbiA9IG00LmlkZW50aXR5KG5ldyBGbG9hdDMyQXJyYXkoMTYpKTtcbiAgdGhpcy5za3lvcmllbnRhdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuXG4gIHRoaXMuY29tcHV0ZU1hdHJpeCgpO1xufVxuXG51dGlsLmluaGVyaXRzKEJhc2ljQ2FtZXJhLCBVbnJpZ2dlZENhbWVyYSlcbm1vZHVsZS5leHBvcnRzLkJhc2ljQ2FtZXJhID0gQmFzaWNDYW1lcmFcblxuQmFzaWNDYW1lcmEucHJvdG90eXBlLmNvbXB1dGVNYXRyaXggPSBmdW5jdGlvbigpe1xuICByZXF1aXJlKCcuLi9saWIvY29sdW1uTWFqb3InKS5tdWxNYXRyaXhNYXRyaXg0KHRoaXMucGVyc3BlY3RpdmUsIHRoaXMub3JpZW50YXRpb24sIHRoaXMubWF0cml4KTtcbiAgcmV0dXJuIFVucmlnZ2VkQ2FtZXJhLnByb3RvdHlwZS5jb21wdXRlTWF0cml4LmNhbGwodGhpcywgdGhpcy5tYXRyaXgpO1xufVxuXG5CYXNpY0NhbWVyYS5wcm90b3R5cGUudXBkYXRlT3JpZW50YXRpb24gPSBmdW5jdGlvbigpe1xuICBtNC5pZGVudGl0eSh0aGlzLm9yaWVudGF0aW9uKTtcbiAgaWYodGhpcy50cmFuc2Zvcm0ucm90YXRlWilcbiAgICBtNC5yb3RhdGVaKHRoaXMub3JpZW50YXRpb24sIC10aGlzLnRyYW5zZm9ybS5yb3RhdGVaLCB0aGlzLm9yaWVudGF0aW9uKTtcbiAgaWYodGhpcy50cmFuc2Zvcm0ucm90YXRlWClcbiAgICBtNC5yb3RhdGVYKHRoaXMub3JpZW50YXRpb24sIC10aGlzLnRyYW5zZm9ybS5yb3RhdGVYLCB0aGlzLm9yaWVudGF0aW9uKTtcbiAgaWYodGhpcy50cmFuc2Zvcm0ucm90YXRlWSlcbiAgICBtNC5yb3RhdGVZKHRoaXMub3JpZW50YXRpb24sIC10aGlzLnRyYW5zZm9ybS5yb3RhdGVZLCB0aGlzLm9yaWVudGF0aW9uKTtcbiAgdmFyIHBvcyA9IHYzLm11bFNjYWxhcih0aGlzLnRyYW5zZm9ybS5wb3NpdGlvbiwgLTEsIG5ldyBGbG9hdDMyQXJyYXkoMykpO1xuICBtNC5jb3B5KHRoaXMub3JpZW50YXRpb24sIHRoaXMuc2t5b3JpZW50YXRpb24pO1xuICBtNC50cmFuc2xhdGUodGhpcy5vcmllbnRhdGlvbiwgcG9zLCB0aGlzLm9yaWVudGF0aW9uKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbkJhc2ljQ2FtZXJhLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbih4LCB5LCB6KXtcbiAgdGhpcy50cmFuc2Zvcm0ucG9zaXRpb25bMF0gPSB4O1xuICB0aGlzLnRyYW5zZm9ybS5wb3NpdGlvblsxXSA9IHk7XG4gIHRoaXMudHJhbnNmb3JtLnBvc2l0aW9uWzJdID0gejtcbiAgdGhpcy51cGRhdGVPcmllbnRhdGlvbigpO1xuICByZXR1cm4gdGhpcztcbn1cblxuQmFzaWNDYW1lcmEucHJvdG90eXBlLm1vdmVCeSA9IGZ1bmN0aW9uKHgsIHksIHope1xuICB0aGlzLnRyYW5zZm9ybS5wb3NpdGlvblswXSArPSB4O1xuICB0aGlzLnRyYW5zZm9ybS5wb3NpdGlvblsxXSArPSB5O1xuICB0aGlzLnRyYW5zZm9ybS5wb3NpdGlvblsyXSArPSB6O1xuICB0aGlzLnVwZGF0ZU9yaWVudGF0aW9uKCk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5CYXNpY0NhbWVyYS5wcm90b3R5cGUucm90YXRlVG8gPSBmdW5jdGlvbih6LCB4LCB5KXtcbiAgdGhpcy50cmFuc2Zvcm0ucm90YXRlWiA9IHo7XG4gIHRoaXMudHJhbnNmb3JtLnJvdGF0ZVggPSB4O1xuICB0aGlzLnRyYW5zZm9ybS5yb3RhdGVZID0geTtcbiAgdGhpcy51cGRhdGVPcmllbnRhdGlvbigpO1xufVxuXG5CYXNpY0NhbWVyYS5wcm90b3R5cGUucm90YXRlQnkgPSBmdW5jdGlvbih6LCB4LCB5KXtcbiAgdGhpcy50cmFuc2Zvcm0ucm90YXRlWiArPSB6O1xuICB0aGlzLnRyYW5zZm9ybS5yb3RhdGVYICs9IHg7XG4gIHRoaXMudHJhbnNmb3JtLnJvdGF0ZVkgKz0geTtcbiAgdGhpcy51cGRhdGVPcmllbnRhdGlvbigpO1xufVxuXG5CYXNpY0NhbWVyYS5wcm90b3R5cGUubG9va0F0ID0gZnVuY3Rpb24odGFyZ2V0LCB1cCl7XG4gIG00Lmxvb2tBdCh0aGlzLnRyYW5zZm9ybS5wb3NpdGlvbiwgdGFyZ2V0LCB1cCwgdGhpcy5vcmllbnRhdGlvbik7XG4gIHJldHVybiB0aGlzO1xufVxuXG5CYXNpY0NhbWVyYS5wcm90b3R5cGUuZ2V0Um90YXRlWSAgID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy50cmFuc2Zvcm0ucm90YXRlWTsgfVxuQmFzaWNDYW1lcmEucHJvdG90eXBlLm1vdmVCeVkgICAgICA9IGZ1bmN0aW9uKGQsIHIsIGEpIHsgdGhpcy5tb3ZlQnkoIDAsICBkLCAgMCk7ICAgICAgICAgICAgICAgICAgICAgICAgIH1cbkJhc2ljQ2FtZXJhLnByb3RvdHlwZS5tb3ZlQnlOZWdaICAgPSBmdW5jdGlvbihkLCByLCBhKSB7IHRoaXMubW92ZUJ5KC1kKk1hdGguc2luKGEpLCAgMCwgIGQqTWF0aC5jb3MoYSkpOyB9XG5CYXNpY0NhbWVyYS5wcm90b3R5cGUubW92ZUJ5TmVnWCAgID0gZnVuY3Rpb24oZCwgciwgYSkgeyB0aGlzLm1vdmVCeSgtZCpNYXRoLmNvcyhhKSwgIDAsIC1kKk1hdGguc2luKGEpKTsgfVxuQmFzaWNDYW1lcmEucHJvdG90eXBlLm1vdmVCeVggICAgICA9IGZ1bmN0aW9uKGQsIHIsIGEpIHsgdGhpcy5tb3ZlQnkoIGQqTWF0aC5jb3MoYSksICAwLCAgZCpNYXRoLnNpbihhKSk7IH1cbkJhc2ljQ2FtZXJhLnByb3RvdHlwZS5tb3ZlQnlaICAgICAgPSBmdW5jdGlvbihkLCByLCBhKSB7IHRoaXMubW92ZUJ5KCBkKk1hdGguc2luKGEpLCAgMCwgLWQqTWF0aC5jb3MoYSkpOyB9XG5CYXNpY0NhbWVyYS5wcm90b3R5cGUubW92ZUJ5TmVnWSAgID0gZnVuY3Rpb24oZCwgciwgYSkgeyB0aGlzLm1vdmVCeSggMCwgLWQsICAwKTsgICAgICAgICAgICAgICAgICAgICAgICAgfVxuQmFzaWNDYW1lcmEucHJvdG90eXBlLnJvdGF0ZUJ5WSAgICA9IGZ1bmN0aW9uKGQsIHIsIGEpIHsgdGhpcy5yb3RhdGVCeSgwLCAgMCwgIHIpOyAgICAgICAgICAgICAgICAgICAgICAgIH1cbkJhc2ljQ2FtZXJhLnByb3RvdHlwZS5yb3RhdGVCeVggICAgPSBmdW5jdGlvbihkLCByLCBhKSB7IHRoaXMucm90YXRlQnkoMCwgIHIsICAwKTsgICAgICAgICAgICAgICAgICAgICAgICB9XG5CYXNpY0NhbWVyYS5wcm90b3R5cGUucm90YXRlQnlOZWdZID0gZnVuY3Rpb24oZCwgciwgYSkgeyB0aGlzLnJvdGF0ZUJ5KDAsICAwLCAtcik7ICAgICAgICAgICAgICAgICAgICAgICAgfVxuQmFzaWNDYW1lcmEucHJvdG90eXBlLnJvdGF0ZUJ5TmVnWCA9IGZ1bmN0aW9uKGQsIHIsIGEpIHsgdGhpcy5yb3RhdGVCeSgwLCAtciwgIDApOyAgICAgICAgICAgICAgICAgICAgICAgIH1cbiIsInZhciBtNCA9IHJlcXVpcmUoJy4uL2xpYi90d2dsJykubTRcbnZhciBldmVudGlmeSA9IHJlcXVpcmUoJ2V2ZW50aWZ5JylcblxuZnVuY3Rpb24gVHJhbnNmb3JtKCkge1xuICBldmVudGlmeS5lbmFibGUodGhpcylcblxuICB0aGlzLmlkICAgICAgID0gVHJhbnNmb3JtLl9uZXh0SWQgKys7XG4gIHRoaXMucG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwXSk7XG4gIHRoaXMucm90YXRlWiAgPSB0aGlzLnJvdGF0ZVggPSB0aGlzLnJvdGF0ZVkgPSAwO1xuICB0aGlzLm1hdHJpeCAgID0gbTQuaWRlbnRpdHkobmV3IEZsb2F0MzJBcnJheSgxNikpO1xufVxuVHJhbnNmb3JtLl9uZXh0SWQgPSAxO1xuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5kaXJ0eSkge1xuICAgIHZhciBtID0gbTQuaWRlbnRpdHkobmV3IEZsb2F0MzJBcnJheSgxNikpO1xuXG4gICAgaWYodGhpcy5yb3RhdGVZKVxuICAgICAgbTQucm90YXRlWShtLCB0aGlzLnJvdGF0ZVksIG0pO1xuICAgIGlmKHRoaXMucm90YXRlWClcbiAgICAgIG00LnJvdGF0ZVgobSwgdGhpcy5yb3RhdGVYLCBtKTtcbiAgICBpZih0aGlzLnJvdGF0ZVopXG4gICAgICBtNC5yb3RhdGVaKG0sIHRoaXMucm90YXRlWiwgbSk7XG5cbiAgICBjb25zb2xlLmxvZyhtKVxuICAgIG00LnNldFRyYW5zbGF0aW9uKG0sIHRoaXMucG9zaXRpb24sIG0pO1xuICAgIG00LmludmVyc2UobSwgdGhpcy5tYXRyaXgpO1xuICAgIC8vIHZhciBwb3MgPSB0ZGwuZmFzdC5tdWxTY2FsYXJWZWN0b3IobmV3IEZsb2F0MzJBcnJheSgzKSwgLTEsIHRoaXMucG9zaXRpb24pO1xuICAgIC8vIG00LnRyYW5zbGF0ZSh0aGlzLm1hdHJpeCwgcG9zKTtcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRoaXMubWF0cml4O1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG4gIHRoaXMucG9zaXRpb24gPSBbeCwgeSwgel07XG4gIHRoaXMuZGlydHkgPSB0cnVlO1xuICAvLyBtNC5zZXRUcmFuc2xhdGlvbih0aGlzLm1hdHJpeCwgdGhpcy5wb3NpdGlvbik7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUubW92ZUJ5ID0gZnVuY3Rpb24gKHgsIHksIHopIHtcbiAgdGhpcy5wb3NpdGlvblswXSArPSB4O1xuICB0aGlzLnBvc2l0aW9uWzFdICs9IHk7XG4gIHRoaXMucG9zaXRpb25bMl0gKz0gejtcbiAgdGhpcy5kaXJ0eSA9IHRydWU7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUucm90YXRlQnkgPSBmdW5jdGlvbih6LCB4LCB5KXtcbiAgdGhpcy5yb3RhdGVaICs9IHo7XG4gIHRoaXMucm90YXRlWCArPSB4O1xuICB0aGlzLnJvdGF0ZVkgKz0geTtcbiAgdGhpcy5kaXJ0eSA9IHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtIiwiLy8gRXZlbnRpZnlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb3B5cmlnaHQoYykgMjAxMC0yMDEyIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZFxuLy8gQ29weXJpZ2h0KGMpIDIwMTQgQmVybWkgRmVycmVyIDxiZXJtaUBiZXJtaWxhYnMuY29tPlxuLy8gQ29weXJpZ2h0KGMpIDIwMTMgTmljb2xhcyBQZXJyaWF1bHRcblxuLy8gTUlUIExpY2Vuc2VkXG5cblxuLy8gQSBtb2R1bGUgdGhhdCBjYW4gYmUgbWl4ZWQgaW4gdG8gKmFueSBvYmplY3QqIGluIG9yZGVyIHRvIHByb3ZpZGUgaXQgd2l0aFxuLy8gY3VzdG9tIGV2ZW50cy4gWW91IG1heSBiaW5kIHdpdGggYG9uYCBvciByZW1vdmUgd2l0aCBgb2ZmYCBjYWxsYmFjayBmdW5jdGlvbnNcbi8vIHRvIGFuIGV2ZW50OyB0cmlnZ2VyYC1pbmcgYW4gZXZlbnQgZmlyZXMgYWxsIGNhbGxiYWNrcyBpbiBzdWNjZXNzaW9uLlxuLy9cbi8vICAgICB2YXIgb2JqZWN0ID0ge307XG4vLyAgICAgRXZlbnRpZnkuZW5hYmxlKG9iamVjdCk7XG4vLyAgICAgb2JqZWN0Lm9uKCdleHBhbmQnLCBmdW5jdGlvbigpeyBhbGVydCgnZXhwYW5kZWQnKTsgfSk7XG4vLyAgICAgb2JqZWN0LnRyaWdnZXIoJ2V4cGFuZCcpO1xuKGZ1bmN0aW9uIChuYW1lLCBnbG9iYWwsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKG5hbWUsIGdsb2JhbCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcpIHtcbiAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG4gIH0gZWxzZSB7XG4gICAvLyAgZ2xvYmFsW25hbWVdID0gZGVmaW5pdGlvbihuYW1lLCBnbG9iYWwpO1xuICAgIHZhciBzZWxmID0gZGVmaW5pdGlvbigpLFxuXG4gICAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBFdmVudGlmeWAgdmFyaWFibGUuXG4gICAgcHJldiA9IGdsb2JhbFtuYW1lXTtcblxuICAgIC8vIFJ1biBFdmVudGlmeSBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgRXZlbnRpZnlgXG4gICAgLy8gdmFyaWFibGUgdG8gaXRzIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvXG4gICAgLy8gdGhlIEV2ZW50aWZ5IG9iamVjdC5cbiAgICBzZWxmLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBnbG9iYWxbbmFtZV0gPSBwcmV2O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcblxuICAgIGdsb2JhbFtuYW1lXSA9IHNlbGY7XG4gIH1cblxufSh0aGlzLmxvY2FsRXZlbnRpZnlMaWJyYXJ5TmFtZSB8fCBcIkV2ZW50aWZ5XCIsIHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEV2ZW50aWZ5LCBiYXNlZCBvbiBCYWNrYm9uZS5FdmVudHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIGZ1bmN0aW9uIHVuaXF1ZUlkKHByZWZpeCkge1xuICAgIGlkQ291bnRlciA9IGlkQ291bnRlciArIDE7XG4gICAgdmFyIGlkID0gaWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH1cblxuICBmdW5jdGlvbiBvbmNlKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsXG4gICAgICBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocmFuKSB7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgfVxuICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH1cblxuICB2YXIgRXZlbnRpZnlJbnN0YW5jZSxcbiAgICBsaXN0ZW5NZXRob2RzID0ge1xuICAgICAgbGlzdGVuVG86ICdvbicsXG4gICAgICBsaXN0ZW5Ub09uY2U6ICdvbmNlJ1xuICAgIH0sXG4gICAgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgaWRDb3VudGVyID0gMCxcblxuICAgIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHNwbGl0IGV2ZW50IHN0cmluZ3NcbiAgICBldmVudFNwbGl0dGVyID0gL1xccysvLFxuXG4gICAgLy8gRGVmaW5lcyB0aGUgbmFtZSBvZiB0aGUgbG9jYWwgdmFyaWFibGUgdGhlIEV2ZW50aWZ5IGxpYnJhcnkgd2lsbCB1c2VcbiAgICAvLyB0aGlzIGlzIHNwZWNpYWxseSB1c2VmdWwgaWYgd2luZG93LkV2ZW50aWZ5IGlzIGFscmVhZHkgYmVpbmcgdXNlZFxuICAgIC8vIGJ5IHlvdXIgYXBwbGljYXRpb24gYW5kIHlvdSB3YW50IGEgZGlmZmVyZW50IG5hbWUuIEZvciBleGFtcGxlOlxuICAgIC8vICAgIC8vIERlY2xhcmUgYmVmb3JlIGluY2x1ZGluZyB0aGUgRXZlbnRpZnkgbGlicmFyeVxuICAgIC8vICAgIHZhciBsb2NhbEV2ZW50aWZ5TGlicmFyeU5hbWUgPSAnRXZlbnRNYW5hZ2VyJztcblxuICAgIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBFdmVudGlmeSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgICBFdmVudGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgRXZlbnRpZnkucHJvdG90eXBlID0ge1xuXG4gICAgLy8gRXZlbnQgRnVuY3Rpb25zXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEJpbmQgYW4gZXZlbnQgdG8gYSBgY2FsbGJhY2tgIGZ1bmN0aW9uLiBQYXNzaW5nIGBcImFsbFwiYCB3aWxsIGJpbmRcbiAgICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgICBvbjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAnb24nLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdIHx8ICh0aGlzLl9ldmVudHNbbmFtZV0gPSBbXSk7XG4gICAgICBldmVudHMucHVzaCh7XG4gICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgY3R4OiBjb250ZXh0IHx8IHRoaXNcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAgIC8vIHRoZSBjYWxsYmFjayBpcyBpbnZva2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAgb25jZTogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG9uY2VMaXN0ZW5lcjtcblxuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uY2UnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG9uY2VMaXN0ZW5lciA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLm9mZihuYW1lLCBvbmNlTGlzdGVuZXIpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG5cbiAgICAgIG9uY2VMaXN0ZW5lci5fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIG9uY2VMaXN0ZW5lciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gICAgLy8gY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxuICAgIG9mZjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmV0YWluLCBldiwgZXZlbnRzLCBuYW1lcywgaSwgbCwgaiwgaztcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzIHx8ICFldmVudHNBcGkodGhpcywgJ29mZicsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG5hbWVzID0gbmFtZSA/IFtuYW1lXSA6IE9iamVjdC5rZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICBpZiAoZXZlbnRzKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW25hbWVdID0gcmV0YWluID0gW107XG4gICAgICAgICAgaWYgKGNhbGxiYWNrIHx8IGNvbnRleHQpIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaiArPSAxKSB7XG4gICAgICAgICAgICAgIGV2ID0gZXZlbnRzW2pdO1xuICAgICAgICAgICAgICBpZiAoKGNhbGxiYWNrICYmXG4gICAgICAgICAgICAgICAgICBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiZcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjay5fY2FsbGJhY2spIHx8XG4gICAgICAgICAgICAgICAgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gZXYuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXRhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW25hbWVdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIGV2ZW50cywgYWxsRXZlbnRzLFxuICAgICAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ3RyaWdnZXInLCBuYW1lLCBhcmdzKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgIGFsbEV2ZW50cyA9IHRoaXMuX2V2ZW50cy5hbGw7XG4gICAgICBpZiAoZXZlbnRzKSB7XG4gICAgICAgIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIGlmIChhbGxFdmVudHMpIHtcbiAgICAgICAgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVGVsbCB0aGlzIG9iamVjdCB0byBzdG9wIGxpc3RlbmluZyB0byBlaXRoZXIgc3BlY2lmaWMgZXZlbnRzIC4uLiBvclxuICAgIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXG4gICAgc3RvcExpc3RlbmluZzogZnVuY3Rpb24gKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBkZWxldGVMaXN0ZW5lciwgaWQsXG4gICAgICAgIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgZGVsZXRlTGlzdGVuZXIgPSAhbmFtZSAmJiAhY2FsbGJhY2s7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVycyA9IHt9O1xuICAgICAgaWYgKG9iaikge1xuICAgICAgICBsaXN0ZW5lcnNbb2JqLl9saXN0ZW5lcklkXSA9IG9iajtcbiAgICAgIH1cbiAgICAgIGZvciAoaWQgaW4gbGlzdGVuZXJzKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2lkXS5vZmYobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICAgIGlmIChkZWxldGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tpZF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gIH07XG5cblxuXG4gIC8vIEltcGxlbWVudCBmYW5jeSBmZWF0dXJlcyBvZiB0aGUgRXZlbnRzIEFQSSBzdWNoIGFzIG11bHRpcGxlIGV2ZW50XG4gIC8vIG5hbWVzIGBcImNoYW5nZSBibHVyXCJgIGFuZCBqUXVlcnktc3R5bGUgZXZlbnQgbWFwcyBge2NoYW5nZTogYWN0aW9ufWBcbiAgLy8gaW4gdGVybXMgb2YgdGhlIGV4aXN0aW5nIEFQSS5cbiAgZnVuY3Rpb24gZXZlbnRzQXBpKG9iaiwgYWN0aW9uLCBuYW1lLCByZXN0KSB7XG4gICAgdmFyIGtleSwgaSwgbCwgbmFtZXM7XG5cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBldmVudCBtYXBzLlxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAoa2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwYWNlIHNlcGFyYXRlZCBldmVudCBuYW1lcy5cbiAgICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgICBuYW1lcyA9IG5hbWUuc3BsaXQoZXZlbnRTcGxpdHRlcik7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW25hbWVzW2ldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gQSBkaWZmaWN1bHQtdG8tYmVsaWV2ZSwgYnV0IG9wdGltaXplZCBpbnRlcm5hbCBkaXNwYXRjaCBmdW5jdGlvbiBmb3JcbiAgLy8gdHJpZ2dlcmluZyBldmVudHMuIFRyaWVzIHRvIGtlZXAgdGhlIHVzdWFsIGNhc2VzIHNwZWVkeSAobW9zdCBpbnRlcm5hbFxuICAvLyBCYWNrYm9uZSBldmVudHMgaGF2ZSAzIGFyZ3VtZW50cykuXG5cbiAgZnVuY3Rpb24gdHJpZ2dlckV2ZW50cyhldmVudHMsIGFyZ3MpIHtcbiAgICB2YXIgZXYsXG4gICAgICBpID0gMCxcbiAgICAgIGwgPSBldmVudHMubGVuZ3RoLFxuICAgICAgYTEgPSBhcmdzWzBdLFxuICAgICAgYTIgPSBhcmdzWzFdLFxuICAgICAgYTMgPSBhcmdzWzJdO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICB3aGlsZSAoaSA8IGwpIHtcbiAgICAgICAgZXYgPSBldmVudHNbaV07XG4gICAgICAgIGV2LmNhbGxiYWNrLmNhbGwoZXYuY3R4KTtcbiAgICAgICAgaSArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgMTpcbiAgICAgIHdoaWxlIChpIDwgbCkge1xuICAgICAgICBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgZXYuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTtcbiAgICAgICAgaSArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgMjpcbiAgICAgIHdoaWxlIChpIDwgbCkge1xuICAgICAgICBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgZXYuY2FsbGJhY2suY2FsbChldi5jdHgsIGExLCBhMik7XG4gICAgICAgIGkgKz0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICBjYXNlIDM6XG4gICAgICB3aGlsZSAoaSA8IGwpIHtcbiAgICAgICAgZXYgPSBldmVudHNbaV07XG4gICAgICAgIGV2LmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIsIGEzKTtcbiAgICAgICAgaSArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3aGlsZSAoaSA8IGwpIHtcbiAgICAgICAgZXYgPSBldmVudHNbaV07XG4gICAgICAgIGV2LmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7XG4gICAgICAgIGkgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4gIC8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3NcbiAgLy8gbGlzdGVuaW5nIHRvLlxuICBPYmplY3Qua2V5cyhsaXN0ZW5NZXRob2RzKS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICB2YXIgaW1wbGVtZW50YXRpb24gPSBsaXN0ZW5NZXRob2RzW21ldGhvZF07XG4gICAgRXZlbnRpZnkucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbiAob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGlkLFxuICAgICAgICBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IHt9KTtcbiAgICAgIG9iai5fbGlzdGVuZXJJZCA9IG9iai5fbGlzdGVuZXJJZCB8fCB1bmlxdWVJZCgnbCcpO1xuICAgICAgaWQgPSBvYmouX2xpc3RlbmVySWQ7XG4gICAgICBsaXN0ZW5lcnNbaWRdID0gb2JqO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjYWxsYmFjayA9IHRoaXM7XG4gICAgICB9XG4gICAgICBvYmpbaW1wbGVtZW50YXRpb25dKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH0pO1xuXG5cbiAgLy8gRXhwb3J0IGFuIEV2ZW50aWZ5IGluc3RhbmNlIGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYEV2ZW50aWZ5YCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlLlxuICBFdmVudGlmeUluc3RhbmNlID0gbmV3IEV2ZW50aWZ5KCk7XG5cbiAgRXZlbnRpZnlJbnN0YW5jZS52ZXJzaW9uID0gXCIyLjAuMFwiO1xuXG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gIC8vIEFkZHMgdGhlIG1ldGhvZHMgb24sIG9mZiBhbmQgdHJpZ2dlciB0byBhIHRhcmdldCBPYmplY3RcbiAgRXZlbnRpZnlJbnN0YW5jZS5lbmFibGUgPSBmdW5jdGlvbiBlbmFibGUodGFyZ2V0KSB7XG4gICAgdmFyIGksIGxlbixcbiAgICAgIG1ldGhvZHMgPSBPYmplY3Qua2V5cyhFdmVudGlmeS5wcm90b3R5cGUpO1xuICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBtZXRob2RzLmxlbmd0aDsgaSA8IGxlbjsgaSA9IGkgKyAxKSB7XG4gICAgICB0YXJnZXRbbWV0aG9kc1tpXV0gPSB0aGlzW21ldGhvZHNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIEV2ZW50aWZ5SW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKEV2ZW50aWZ5LnByb3RvdHlwZSk7XG4gIH07XG5cbiAgLy8gQmFja2JvbmUuRXZlbnRzIGRyb3AgaW4gcmVwbGFjZW1lbnQgY29tcGF0aWJpbGl0eVxuICBFdmVudGlmeUluc3RhbmNlLm1peGluID0gRXZlbnRpZnlJbnN0YW5jZS5lbmFibGU7XG5cbiAgLy8gRXhwb3NlIHByb3RvdHlwZSBzbyBvdGhlciBvYmplY3RzIGNhbiBleHRlbmQgaXRcbiAgRXZlbnRpZnlJbnN0YW5jZS5wcm90byA9IEV2ZW50aWZ5LnByb3RvdHlwZTtcblxuICAvLyBTZXRzIEV2ZW50aWZ5IG9uIHRoZSBicm93c2VyIHdpbmRvdyBvciBvbiB0aGUgcHJvY2Vzc1xuICByZXR1cm4gRXZlbnRpZnlJbnN0YW5jZTtcblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3NlcixcbiAgLy8gb3IgYGdsb2JhbGAgb24gdGhlIHNlcnZlci5cbn0pKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgndHdnbC5qcycpLnR3Z2wiLCIvKipcbiAqIEBsaWNlbnNlIHR3Z2wuanMgMC4wLjI1IENvcHlyaWdodCAoYykgMjAxNSwgR3JlZ2cgVGF2YXJlcyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogQXZhaWxhYmxlIHZpYSB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBzZWU6IGh0dHA6Ly9naXRodWIuY29tL2dyZWdnbWFuL3R3Z2wuanMgZm9yIGRldGFpbHNcbiAqL1xuLyoqXG4gKiBAbGljZW5zZSBhbG1vbmQgMC4zLjEgQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIFRoZSBEb2pvIEZvdW5kYXRpb24gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIEF2YWlsYWJsZSB2aWEgdGhlIE1JVCBvciBuZXcgQlNEIGxpY2Vuc2UuXG4gKiBzZWU6IGh0dHA6Ly9naXRodWIuY29tL2pyYnVya2UvYWxtb25kIGZvciBkZXRhaWxzXG4gKi9cbiFmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sYik6YS50d2dsPWIoKX0odGhpcyxmdW5jdGlvbigpe3ZhciBhLGIsYztyZXR1cm4gZnVuY3Rpb24oZCl7ZnVuY3Rpb24gZShhLGIpe3JldHVybiB1LmNhbGwoYSxiKX1mdW5jdGlvbiBmKGEsYil7dmFyIGMsZCxlLGYsZyxoLGksaixrLGwsbSxuPWImJmIuc3BsaXQoXCIvXCIpLG89cy5tYXAscD1vJiZvW1wiKlwiXXx8e307aWYoYSYmXCIuXCI9PT1hLmNoYXJBdCgwKSlpZihiKXtmb3IoYT1hLnNwbGl0KFwiL1wiKSxnPWEubGVuZ3RoLTEscy5ub2RlSWRDb21wYXQmJncudGVzdChhW2ddKSYmKGFbZ109YVtnXS5yZXBsYWNlKHcsXCJcIikpLGE9bi5zbGljZSgwLG4ubGVuZ3RoLTEpLmNvbmNhdChhKSxrPTA7azxhLmxlbmd0aDtrKz0xKWlmKG09YVtrXSxcIi5cIj09PW0pYS5zcGxpY2UoaywxKSxrLT0xO2Vsc2UgaWYoXCIuLlwiPT09bSl7aWYoMT09PWsmJihcIi4uXCI9PT1hWzJdfHxcIi4uXCI9PT1hWzBdKSlicmVhaztrPjAmJihhLnNwbGljZShrLTEsMiksay09Mil9YT1hLmpvaW4oXCIvXCIpfWVsc2UgMD09PWEuaW5kZXhPZihcIi4vXCIpJiYoYT1hLnN1YnN0cmluZygyKSk7aWYoKG58fHApJiZvKXtmb3IoYz1hLnNwbGl0KFwiL1wiKSxrPWMubGVuZ3RoO2s+MDtrLT0xKXtpZihkPWMuc2xpY2UoMCxrKS5qb2luKFwiL1wiKSxuKWZvcihsPW4ubGVuZ3RoO2w+MDtsLT0xKWlmKGU9b1tuLnNsaWNlKDAsbCkuam9pbihcIi9cIildLGUmJihlPWVbZF0pKXtmPWUsaD1rO2JyZWFrfWlmKGYpYnJlYWs7IWkmJnAmJnBbZF0mJihpPXBbZF0saj1rKX0hZiYmaSYmKGY9aSxoPWopLGYmJihjLnNwbGljZSgwLGgsZiksYT1jLmpvaW4oXCIvXCIpKX1yZXR1cm4gYX1mdW5jdGlvbiBnKGEsYil7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGM9di5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgY1swXSYmMT09PWMubGVuZ3RoJiZjLnB1c2gobnVsbCksbi5hcHBseShkLGMuY29uY2F0KFthLGJdKSl9fWZ1bmN0aW9uIGgoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBmKGIsYSl9fWZ1bmN0aW9uIGkoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3FbYV09Yn19ZnVuY3Rpb24gaihhKXtpZihlKHIsYSkpe3ZhciBiPXJbYV07ZGVsZXRlIHJbYV0sdFthXT0hMCxtLmFwcGx5KGQsYil9aWYoIWUocSxhKSYmIWUodCxhKSl0aHJvdyBuZXcgRXJyb3IoXCJObyBcIithKTtyZXR1cm4gcVthXX1mdW5jdGlvbiBrKGEpe3ZhciBiLGM9YT9hLmluZGV4T2YoXCIhXCIpOi0xO3JldHVybiBjPi0xJiYoYj1hLnN1YnN0cmluZygwLGMpLGE9YS5zdWJzdHJpbmcoYysxLGEubGVuZ3RoKSksW2IsYV19ZnVuY3Rpb24gbChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gcyYmcy5jb25maWcmJnMuY29uZmlnW2FdfHx7fX19dmFyIG0sbixvLHAscT17fSxyPXt9LHM9e30sdD17fSx1PU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksdj1bXS5zbGljZSx3PS9cXC5qcyQvO289ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPWsoYSksZT1kWzBdO3JldHVybiBhPWRbMV0sZSYmKGU9ZihlLGIpLGM9aihlKSksZT9hPWMmJmMubm9ybWFsaXplP2Mubm9ybWFsaXplKGEsaChiKSk6ZihhLGIpOihhPWYoYSxiKSxkPWsoYSksZT1kWzBdLGE9ZFsxXSxlJiYoYz1qKGUpKSkse2Y6ZT9lK1wiIVwiK2E6YSxuOmEscHI6ZSxwOmN9fSxwPXtyZXF1aXJlOmZ1bmN0aW9uKGEpe3JldHVybiBnKGEpfSxleHBvcnRzOmZ1bmN0aW9uKGEpe3ZhciBiPXFbYV07cmV0dXJuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGI/YjpxW2FdPXt9fSxtb2R1bGU6ZnVuY3Rpb24oYSl7cmV0dXJue2lkOmEsdXJpOlwiXCIsZXhwb3J0czpxW2FdLGNvbmZpZzpsKGEpfX19LG09ZnVuY3Rpb24oYSxiLGMsZil7dmFyIGgsayxsLG0sbixzLHU9W10sdj10eXBlb2YgYztpZihmPWZ8fGEsXCJ1bmRlZmluZWRcIj09PXZ8fFwiZnVuY3Rpb25cIj09PXYpe2ZvcihiPSFiLmxlbmd0aCYmYy5sZW5ndGg/W1wicmVxdWlyZVwiLFwiZXhwb3J0c1wiLFwibW9kdWxlXCJdOmIsbj0wO248Yi5sZW5ndGg7bis9MSlpZihtPW8oYltuXSxmKSxrPW0uZixcInJlcXVpcmVcIj09PWspdVtuXT1wLnJlcXVpcmUoYSk7ZWxzZSBpZihcImV4cG9ydHNcIj09PWspdVtuXT1wLmV4cG9ydHMoYSkscz0hMDtlbHNlIGlmKFwibW9kdWxlXCI9PT1rKWg9dVtuXT1wLm1vZHVsZShhKTtlbHNlIGlmKGUocSxrKXx8ZShyLGspfHxlKHQsaykpdVtuXT1qKGspO2Vsc2V7aWYoIW0ucCl0aHJvdyBuZXcgRXJyb3IoYStcIiBtaXNzaW5nIFwiK2spO20ucC5sb2FkKG0ubixnKGYsITApLGkoaykse30pLHVbbl09cVtrXX1sPWM/Yy5hcHBseShxW2FdLHUpOnZvaWQgMCxhJiYoaCYmaC5leHBvcnRzIT09ZCYmaC5leHBvcnRzIT09cVthXT9xW2FdPWguZXhwb3J0czpsPT09ZCYmc3x8KHFbYV09bCkpfWVsc2UgYSYmKHFbYV09Yyl9LGE9Yj1uPWZ1bmN0aW9uKGEsYixjLGUsZil7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGEpcmV0dXJuIHBbYV0/cFthXShiKTpqKG8oYSxiKS5mKTtpZighYS5zcGxpY2Upe2lmKHM9YSxzLmRlcHMmJm4ocy5kZXBzLHMuY2FsbGJhY2spLCFiKXJldHVybjtiLnNwbGljZT8oYT1iLGI9YyxjPW51bGwpOmE9ZH1yZXR1cm4gYj1ifHxmdW5jdGlvbigpe30sXCJmdW5jdGlvblwiPT10eXBlb2YgYyYmKGM9ZSxlPWYpLGU/bShkLGEsYixjKTpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bShkLGEsYixjKX0sNCksbn0sbi5jb25maWc9ZnVuY3Rpb24oYSl7cmV0dXJuIG4oYSl9LGEuX2RlZmluZWQ9cSxjPWZ1bmN0aW9uKGEsYixjKXtpZihcInN0cmluZ1wiIT10eXBlb2YgYSl0aHJvdyBuZXcgRXJyb3IoXCJTZWUgYWxtb25kIFJFQURNRTogaW5jb3JyZWN0IG1vZHVsZSBidWlsZCwgbm8gbW9kdWxlIG5hbWVcIik7Yi5zcGxpY2V8fChjPWIsYj1bXSksZShxLGEpfHxlKHIsYSl8fChyW2FdPVthLGIsY10pfSxjLmFtZD17alF1ZXJ5OiEwfX0oKSxjKFwibm9kZV9tb2R1bGVzL2FsbW9uZC9hbG1vbmQuanNcIixmdW5jdGlvbigpe30pLGMoXCJ0d2dsL3R3Z2xcIixbXSxmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSl7ZWE9bmV3IFVpbnQ4QXJyYXkoWzI1NSphWzBdLDI1NSphWzFdLDI1NSphWzJdLDI1NSphWzNdXSl9ZnVuY3Rpb24gYihhKXtkYT1hfWZ1bmN0aW9uIGMoYSxiKXtmb3IodmFyIGM9W1wid2ViZ2xcIixcImV4cGVyaW1lbnRhbC13ZWJnbFwiXSxkPW51bGwsZT0wO2U8Yy5sZW5ndGg7KytlKXt0cnl7ZD1hLmdldENvbnRleHQoY1tlXSxiKX1jYXRjaChmKXt9aWYoZClicmVha31yZXR1cm4gZH1mdW5jdGlvbiBkKGEsYil7dmFyIGQ9YyhhLGIpO3JldHVybiBkfWZ1bmN0aW9uIGUoYSl7cmV0dXJuIGEuc3BsaXQoXCJcXG5cIikubWFwKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIrMStcIjogXCIrYX0pLmpvaW4oXCJcXG5cIil9ZnVuY3Rpb24gZihhLGIsYyxkKXt2YXIgZj1kfHxjYSxnPWEuY3JlYXRlU2hhZGVyKGMpO2Euc2hhZGVyU291cmNlKGcsYiksYS5jb21waWxlU2hhZGVyKGcpO3ZhciBoPWEuZ2V0U2hhZGVyUGFyYW1ldGVyKGcsYS5DT01QSUxFX1NUQVRVUyk7aWYoIWgpe3ZhciBpPWEuZ2V0U2hhZGVySW5mb0xvZyhnKTtyZXR1cm4gZihlKGIpK1wiXFxuKioqIEVycm9yIGNvbXBpbGluZyBzaGFkZXI6IFwiK2kpLGEuZGVsZXRlU2hhZGVyKGcpLG51bGx9cmV0dXJuIGd9ZnVuY3Rpb24gZyhhLGIsYyxkLGUpe3ZhciBmPWV8fGNhLGc9YS5jcmVhdGVQcm9ncmFtKCk7Yi5mb3JFYWNoKGZ1bmN0aW9uKGIpe2EuYXR0YWNoU2hhZGVyKGcsYil9KSxjJiZjLmZvckVhY2goZnVuY3Rpb24oYixjKXthLmJpbmRBdHRyaWJMb2NhdGlvbihnLGQ/ZFtjXTpjLGIpfSksYS5saW5rUHJvZ3JhbShnKTt2YXIgaD1hLmdldFByb2dyYW1QYXJhbWV0ZXIoZyxhLkxJTktfU1RBVFVTKTtpZighaCl7dmFyIGk9YS5nZXRQcm9ncmFtSW5mb0xvZyhnKTtyZXR1cm4gZihcIkVycm9yIGluIHByb2dyYW0gbGlua2luZzpcIitpKSxhLmRlbGV0ZVByb2dyYW0oZyksbnVsbH1yZXR1cm4gZ31mdW5jdGlvbiBoKGEsYixjLGQpe3ZhciBlLGc9XCJcIixoPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGIpO2lmKCFoKXRocm93XCIqKiogRXJyb3I6IHVua25vd24gc2NyaXB0IGVsZW1lbnRcIitiO2lmKGc9aC50ZXh0LCFjKWlmKFwieC1zaGFkZXIveC12ZXJ0ZXhcIj09PWgudHlwZSllPWEuVkVSVEVYX1NIQURFUjtlbHNlIGlmKFwieC1zaGFkZXIveC1mcmFnbWVudFwiPT09aC50eXBlKWU9YS5GUkFHTUVOVF9TSEFERVI7ZWxzZSBpZihlIT09YS5WRVJURVhfU0hBREVSJiZlIT09YS5GUkFHTUVOVF9TSEFERVIpdGhyb3dcIioqKiBFcnJvcjogdW5rbm93biBzaGFkZXIgdHlwZVwiO3JldHVybiBmKGEsZyxjP2M6ZSxkKX1mdW5jdGlvbiBpKGEsYixjLGQsZSl7Zm9yKHZhciBmPVtdLGk9MDtpPGIubGVuZ3RoOysraSl7dmFyIGo9aChhLGJbaV0sYVtIYVtpXV0sZSk7aWYoIWopcmV0dXJuIG51bGw7Zi5wdXNoKGopfXJldHVybiBnKGEsZixjLGQsZSl9ZnVuY3Rpb24gaihhLGIsYyxkLGUpe2Zvcih2YXIgaD1bXSxpPTA7aTxiLmxlbmd0aDsrK2kpe3ZhciBqPWYoYSxiW2ldLGFbSGFbaV1dLGUpO2lmKCFqKXJldHVybiBudWxsO2gucHVzaChqKX1yZXR1cm4gZyhhLGgsYyxkLGUpfWZ1bmN0aW9uIGsoYSxiKXtyZXR1cm4gYj09PWEuU0FNUExFUl8yRD9hLlRFWFRVUkVfMkQ6Yj09PWEuU0FNUExFUl9DVUJFP2EuVEVYVFVSRV9DVUJFX01BUDp2b2lkIDB9ZnVuY3Rpb24gbChhLGIpe2Z1bmN0aW9uIGMoYixjKXt2YXIgZT1hLmdldFVuaWZvcm1Mb2NhdGlvbihiLGMubmFtZSksZj1jLnR5cGUsZz1jLnNpemU+MSYmXCJbMF1cIj09PWMubmFtZS5zdWJzdHIoLTMpO2lmKGY9PT1hLkZMT0FUJiZnKXJldHVybiBmdW5jdGlvbihiKXthLnVuaWZvcm0xZnYoZSxiKX07aWYoZj09PWEuRkxPQVQpcmV0dXJuIGZ1bmN0aW9uKGIpe2EudW5pZm9ybTFmKGUsYil9O2lmKGY9PT1hLkZMT0FUX1ZFQzIpcmV0dXJuIGZ1bmN0aW9uKGIpe2EudW5pZm9ybTJmdihlLGIpfTtpZihmPT09YS5GTE9BVF9WRUMzKXJldHVybiBmdW5jdGlvbihiKXthLnVuaWZvcm0zZnYoZSxiKX07aWYoZj09PWEuRkxPQVRfVkVDNClyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtNGZ2KGUsYil9O2lmKGY9PT1hLklOVCYmZylyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtMWl2KGUsYil9O2lmKGY9PT1hLklOVClyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtMWkoZSxiKX07aWYoZj09PWEuSU5UX1ZFQzIpcmV0dXJuIGZ1bmN0aW9uKGIpe2EudW5pZm9ybTJpdihlLGIpfTtpZihmPT09YS5JTlRfVkVDMylyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtM2l2KGUsYil9O2lmKGY9PT1hLklOVF9WRUM0KXJldHVybiBmdW5jdGlvbihiKXthLnVuaWZvcm00aXYoZSxiKX07aWYoZj09PWEuQk9PTClyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtMWl2KGUsYil9O2lmKGY9PT1hLkJPT0xfVkVDMilyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtMml2KGUsYil9O2lmKGY9PT1hLkJPT0xfVkVDMylyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtM2l2KGUsYil9O2lmKGY9PT1hLkJPT0xfVkVDNClyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtNGl2KGUsYil9O2lmKGY9PT1hLkZMT0FUX01BVDIpcmV0dXJuIGZ1bmN0aW9uKGIpe2EudW5pZm9ybU1hdHJpeDJmdihlLCExLGIpfTtpZihmPT09YS5GTE9BVF9NQVQzKXJldHVybiBmdW5jdGlvbihiKXthLnVuaWZvcm1NYXRyaXgzZnYoZSwhMSxiKX07aWYoZj09PWEuRkxPQVRfTUFUNClyZXR1cm4gZnVuY3Rpb24oYil7YS51bmlmb3JtTWF0cml4NGZ2KGUsITEsYil9O2lmKChmPT09YS5TQU1QTEVSXzJEfHxmPT09YS5TQU1QTEVSX0NVQkUpJiZnKXtmb3IodmFyIGg9W10saT0wO2k8Yy5zaXplOysraSloLnB1c2goZCsrKTtyZXR1cm4gZnVuY3Rpb24oYixjKXtyZXR1cm4gZnVuY3Rpb24oZCl7YS51bmlmb3JtMWl2KGUsYyksZC5mb3JFYWNoKGZ1bmN0aW9uKGQsZSl7YS5hY3RpdmVUZXh0dXJlKGEuVEVYVFVSRTArY1tlXSksYS5iaW5kVGV4dHVyZShiLGQpfSl9fShrKGEsZiksaCl9aWYoZj09PWEuU0FNUExFUl8yRHx8Zj09PWEuU0FNUExFUl9DVUJFKXJldHVybiBmdW5jdGlvbihiLGMpe3JldHVybiBmdW5jdGlvbihkKXthLnVuaWZvcm0xaShlLGMpLGEuYWN0aXZlVGV4dHVyZShhLlRFWFRVUkUwK2MpLGEuYmluZFRleHR1cmUoYixkKX19KGsoYSxmKSxkKyspO3Rocm93XCJ1bmtub3duIHR5cGU6IDB4XCIrZi50b1N0cmluZygxNil9Zm9yKHZhciBkPTAsZT17fSxmPWEuZ2V0UHJvZ3JhbVBhcmFtZXRlcihiLGEuQUNUSVZFX1VOSUZPUk1TKSxnPTA7Zj5nOysrZyl7dmFyIGg9YS5nZXRBY3RpdmVVbmlmb3JtKGIsZyk7aWYoIWgpYnJlYWs7dmFyIGk9aC5uYW1lO1wiWzBdXCI9PT1pLnN1YnN0cigtMykmJihpPWkuc3Vic3RyKDAsaS5sZW5ndGgtMykpO3ZhciBqPWMoYixoKTtlW2ldPWp9cmV0dXJuIGV9ZnVuY3Rpb24gbShhLGIpe2E9YS51bmlmb3JtU2V0dGVyc3x8YTtmb3IodmFyIGM9YXJndW1lbnRzLmxlbmd0aCxkPTE7Yz5kOysrZCl7dmFyIGU9YXJndW1lbnRzW2RdO2lmKEFycmF5LmlzQXJyYXkoZSkpZm9yKHZhciBmPWUubGVuZ3RoLGc9MDtmPmc7KytnKW0oYSxlW2ddKTtlbHNlIGZvcih2YXIgaCBpbiBlKXt2YXIgaT1hW2hdO2kmJmkoZVtoXSl9fX1mdW5jdGlvbiBuKGEsYil7ZnVuY3Rpb24gYyhiKXtyZXR1cm4gZnVuY3Rpb24oYyl7YS5iaW5kQnVmZmVyKGEuQVJSQVlfQlVGRkVSLGMuYnVmZmVyKSxhLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGIpLGEudmVydGV4QXR0cmliUG9pbnRlcihiLGMubnVtQ29tcG9uZW50c3x8Yy5zaXplLGMudHlwZXx8YS5GTE9BVCxjLm5vcm1hbGl6ZXx8ITEsYy5zdHJpZGV8fDAsYy5vZmZzZXR8fDApfX1mb3IodmFyIGQ9e30sZT1hLmdldFByb2dyYW1QYXJhbWV0ZXIoYixhLkFDVElWRV9BVFRSSUJVVEVTKSxmPTA7ZT5mOysrZil7dmFyIGc9YS5nZXRBY3RpdmVBdHRyaWIoYixmKTtpZighZylicmVhazt2YXIgaD1hLmdldEF0dHJpYkxvY2F0aW9uKGIsZy5uYW1lKTtkW2cubmFtZV09YyhoKX1yZXR1cm4gZH1mdW5jdGlvbiBvKGEsYil7Zm9yKHZhciBjIGluIGIpe3ZhciBkPWFbY107ZCYmZChiW2NdKX19ZnVuY3Rpb24gcChhLGIsYyl7byhiLmF0dHJpYlNldHRlcnN8fGIsYy5hdHRyaWJzKSxjLmluZGljZXMmJmEuYmluZEJ1ZmZlcihhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLGMuaW5kaWNlcyl9ZnVuY3Rpb24gcShhLGIsYyxkLGUpe2I9Yi5tYXAoZnVuY3Rpb24oYSl7dmFyIGI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYSk7cmV0dXJuIGI/Yi50ZXh0OmF9KTt2YXIgZj1qKGEsYixjLGQsZSk7aWYoIWYpcmV0dXJuIG51bGw7dmFyIGc9bChhLGYpLGg9bihhLGYpO3JldHVybntwcm9ncmFtOmYsdW5pZm9ybVNldHRlcnM6ZyxhdHRyaWJTZXR0ZXJzOmh9fWZ1bmN0aW9uIHIoYSxiKXtiPWJ8fDEsYj1NYXRoLm1heCgxLGIpO3ZhciBjPWEuY2xpZW50V2lkdGgqYnwwLGQ9YS5jbGllbnRIZWlnaHQqYnwwO3JldHVybiBhLndpZHRoIT09Y3x8YS5oZWlnaHQhPT1kPyhhLndpZHRoPWMsYS5oZWlnaHQ9ZCwhMCk6ITF9ZnVuY3Rpb24gcyhhLGIsYyxkKXtpZihiIGluc3RhbmNlb2YgV2ViR0xCdWZmZXIpcmV0dXJuIGI7Yz1jfHxhLkFSUkFZX0JVRkZFUjt2YXIgZT1hLmNyZWF0ZUJ1ZmZlcigpO3JldHVybiBhLmJpbmRCdWZmZXIoYyxlKSxhLmJ1ZmZlckRhdGEoYyxiLGR8fGEuU1RBVElDX0RSQVcpLGV9ZnVuY3Rpb24gdChhKXtyZXR1cm5cImluZGljZXNcIj09PWF9ZnVuY3Rpb24gdShhKXtpZihhIGluc3RhbmNlb2YgSW50OEFycmF5KXJldHVybiBnYTtpZihhIGluc3RhbmNlb2YgVWludDhBcnJheSlyZXR1cm4gaGE7aWYoYSBpbnN0YW5jZW9mIEludDE2QXJyYXkpcmV0dXJuIGlhO2lmKGEgaW5zdGFuY2VvZiBVaW50MTZBcnJheSlyZXR1cm4gamE7aWYoYSBpbnN0YW5jZW9mIEludDMyQXJyYXkpcmV0dXJuIGthO2lmKGEgaW5zdGFuY2VvZiBVaW50MzJBcnJheSlyZXR1cm4gbGE7aWYoYSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSlyZXR1cm4gbWE7dGhyb3dcInVuc3VwcG9ydGVkIHR5cGVkIGFycmF5IHR5cGVcIn1mdW5jdGlvbiB2KGEsYil7c3dpdGNoKGIpe2Nhc2UgYS5CWVRFOnJldHVybiBJbnQ4QXJyYXk7Y2FzZSBhLlVOU0lHTkVEX0JZVEU6cmV0dXJuIFVpbnQ4QXJyYXk7Y2FzZSBhLlNIT1JUOnJldHVybiBJbnQxNkFycmF5O2Nhc2UgYS5VTlNJR05FRF9TSE9SVDpyZXR1cm4gVWludDE2QXJyYXk7Y2FzZSBhLklOVDpyZXR1cm4gSW50MzJBcnJheTtjYXNlIGEuVU5TSUdORURfSU5UOnJldHVybiBVaW50MzJBcnJheTtjYXNlIGEuRkxPQVQ6cmV0dXJuIEZsb2F0MzJBcnJheTtkZWZhdWx0OnRocm93XCJ1bmtub3duIGdsIHR5cGVcIn19ZnVuY3Rpb24gdyhhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIEludDhBcnJheT8hMDphIGluc3RhbmNlb2YgVWludDhBcnJheT8hMDohMX1mdW5jdGlvbiB4KGEpe3JldHVybiBhJiZhLmJ1ZmZlciYmYS5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcn1mdW5jdGlvbiB5KGEsYil7dmFyIGM7aWYoYz1hLmluZGV4T2YoXCJjb29yZFwiKT49MD8yOmEuaW5kZXhPZihcImNvbG9yXCIpPj0wPzQ6MyxiJWM+MCl0aHJvd1wiY2FuIG5vdCBndWVzcyBudW1Db21wb25lbnRzLiBZb3Ugc2hvdWxkIHNwZWNpZnkgaXQuXCI7cmV0dXJuIGN9ZnVuY3Rpb24geihhLGIpe2lmKHgoYSkpcmV0dXJuIGE7aWYoeChhLmRhdGEpKXJldHVybiBhLmRhdGE7QXJyYXkuaXNBcnJheShhKSYmKGE9e2RhdGE6YX0pO3ZhciBjPWEudHlwZTtyZXR1cm4gY3x8KGM9XCJpbmRpY2VzXCI9PT1iP1VpbnQxNkFycmF5OkZsb2F0MzJBcnJheSksbmV3IGMoYS5kYXRhKX1mdW5jdGlvbiBBKGEsYil7dmFyIGM9e307cmV0dXJuIE9iamVjdC5rZXlzKGIpLmZvckVhY2goZnVuY3Rpb24oZCl7aWYoIXQoZCkpe3ZhciBlPWJbZF0sZj1lLmF0dHJpYnx8ZS5uYW1lfHxlLmF0dHJpYk5hbWV8fGRhK2QsZz16KGUsZCk7Y1tmXT17YnVmZmVyOnMoYSxnLHZvaWQgMCxlLmRyYXdUeXBlKSxudW1Db21wb25lbnRzOmUubnVtQ29tcG9uZW50c3x8ZS5zaXplfHx5KGQpLHR5cGU6dShnKSxub3JtYWxpemU6dm9pZCAwIT09ZS5ub3JtYWxpemU/ZS5ub3JtYWxpemU6dyhnKSxzdHJpZGU6ZS5zdHJpZGV8fDAsb2Zmc2V0OmUub2Zmc2V0fHwwfX19KSxjfWZ1bmN0aW9uIEIoYSxiKXt2YXIgYz17YXR0cmliczpBKGEsYil9LGQ9Yi5pbmRpY2VzO3JldHVybiBkPyhkPXooZCxcImluZGljZXNcIiksYy5pbmRpY2VzPXMoYSxkLGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIpLGMubnVtRWxlbWVudHM9ZC5sZW5ndGgsYy5lbGVtZW50VHlwZT1kIGluc3RhbmNlb2YgVWludDMyQXJyYXk/YS5VTlNJR05FRF9JTlQ6YS5VTlNJR05FRF9TSE9SVCk6Yy5udW1FbGVtZW50cz1JYShiKSxjfWZ1bmN0aW9uIEMoYSxiKXt2YXIgYz17fTtyZXR1cm4gT2JqZWN0LmtleXMoYikuZm9yRWFjaChmdW5jdGlvbihkKXt2YXIgZT1cImluZGljZXNcIj09PWQ/YS5FTEVNRU5UX0FSUkFZX0JVRkZFUjphLkFSUkFZX0JVRkZFUixmPXooYltkXSxkKTtjW2RdPXMoYSxmLGUpfSksY31mdW5jdGlvbiBEKGEsYixjLGQsZSl7dmFyIGY9Yy5pbmRpY2VzLGc9dm9pZCAwPT09ZD9jLm51bUVsZW1lbnRzOmQ7ZT12b2lkIDA9PT1lPzA6ZSxmP2EuZHJhd0VsZW1lbnRzKGIsZyx2b2lkIDA9PT1jLmVsZW1lbnRUeXBlP2EuVU5TSUdORURfU0hPUlQ6Yy5lbGVtZW50VHlwZSxlKTphLmRyYXdBcnJheXMoYixlLGcpfWZ1bmN0aW9uIEUoYSxiKXt2YXIgYz1udWxsLGQ9bnVsbDtiLmZvckVhY2goZnVuY3Rpb24oYil7aWYoYi5hY3RpdmUhPT0hMSl7dmFyIGU9Yi5wcm9ncmFtSW5mbyxmPWIuYnVmZmVySW5mbyxnPSExO2UhPT1jJiYoYz1lLGEudXNlUHJvZ3JhbShlLnByb2dyYW0pLGc9ITApLChnfHxmIT09ZCkmJihkPWYscChhLGUsZikpLG0oZSxiLnVuaWZvcm1zKSxEKGEsYi50eXBlfHxhLlRSSUFOR0xFUyxmLGIuY291bnQsYi5vZmZzZXQpfX0pfWZ1bmN0aW9uIEYoYSxiKXt2b2lkIDAhPT1iLmNvbG9yc3BhY2VDb252ZXJzaW9uJiYoSmEuY29sb3JTcGFjZUNvbnZlcnNpb249YS5nZXRQYXJhbWV0ZXIoYS5VTlBBQ0tfQ09MT1JTUEFDRV9DT05WRVJTSU9OX1dFQkdMKSksdm9pZCAwIT09Yi5wcmVtdWx0aXBseUFscGhhJiYoSmEucHJlbXVsdGlwbHlBbHBoYT1hLmdldFBhcmFtZXRlcihhLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCkpLHZvaWQgMCE9PWIuZmxpcFkmJihKYS5mbGlwWT1hLmdldFBhcmFtZXRlcihhLlVOUEFDS19GTElQX1lfV0VCR0wpKX1mdW5jdGlvbiBHKGEsYil7dm9pZCAwIT09Yi5jb2xvcnNwYWNlQ29udmVyc2lvbiYmYS5waXhlbFN0b3JlaShhLlVOUEFDS19DT0xPUlNQQUNFX0NPTlZFUlNJT05fV0VCR0wsSmEuY29sb3JTcGFjZUNvbnZlcnNpb24pLHZvaWQgMCE9PWIucHJlbXVsdGlwbHlBbHBoYSYmYS5waXhlbFN0b3JlaShhLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCxKYS5wcmVtdWx0aXBseUFscGhhKSx2b2lkIDAhPT1iLmZsaXBZJiZhLnBpeGVsU3RvcmVpKGEuVU5QQUNLX0ZMSVBfWV9XRUJHTCxKYS5mbGlwWSl9ZnVuY3Rpb24gSChhLGIsYyl7dmFyIGQ9Yy50YXJnZXR8fGEuVEVYVFVSRV8yRDthLmJpbmRUZXh0dXJlKGQsYiksYy5taW4mJmEudGV4UGFyYW1ldGVyaShkLGEuVEVYVFVSRV9NSU5fRklMVEVSLGMubWluKSxjLm1hZyYmYS50ZXhQYXJhbWV0ZXJpKGQsYS5URVhUVVJFX01BR19GSUxURVIsYy5tYWcpLGMud3JhcCYmKGEudGV4UGFyYW1ldGVyaShkLGEuVEVYVFVSRV9XUkFQX1MsYy53cmFwKSxhLnRleFBhcmFtZXRlcmkoZCxhLlRFWFRVUkVfV1JBUF9ULGMud3JhcCkpLGMud3JhcFMmJmEudGV4UGFyYW1ldGVyaShkLGEuVEVYVFVSRV9XUkFQX1MsYy53cmFwUyksYy53cmFwVCYmYS50ZXhQYXJhbWV0ZXJpKGQsYS5URVhUVVJFX1dSQVBfVCxjLndyYXBUKX1mdW5jdGlvbiBJKGEpe3JldHVybiBhPWF8fGVhLHgoYSk/YTpuZXcgVWludDhBcnJheShbMjU1KmFbMF0sMjU1KmFbMV0sMjU1KmFbMl0sMjU1KmFbM11dKX1mdW5jdGlvbiBKKGEpe3JldHVybiAwPT09KGEmYS0xKX1mdW5jdGlvbiBLKGEsYixjLGQsZSl7Yz1jfHxmYTt2YXIgZj1jLnRhcmdldHx8YS5URVhUVVJFXzJEO2Q9ZHx8Yy53aWR0aCxlPWV8fGMuaGVpZ2h0LGEuYmluZFRleHR1cmUoZixiKSxKKGQpJiZKKGUpP2EuZ2VuZXJhdGVNaXBtYXAoZik6KGEudGV4UGFyYW1ldGVyaShmLGEuVEVYVFVSRV9NSU5fRklMVEVSLGEuTElORUFSKSxhLnRleFBhcmFtZXRlcmkoZixhLlRFWFRVUkVfV1JBUF9TLGEuQ0xBTVBfVE9fRURHRSksYS50ZXhQYXJhbWV0ZXJpKGYsYS5URVhUVVJFX1dSQVBfVCxhLkNMQU1QX1RPX0VER0UpKX1mdW5jdGlvbiBMKGEsYil7cmV0dXJuIGI9Ynx8e30sYi5jdWJlRmFjZU9yZGVyfHxbYS5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1gsYS5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1gsYS5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ksYS5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1ksYS5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osYS5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1pdfWZ1bmN0aW9uIE0oYSxiKXt2YXIgYz1MKGEsYiksZD1jLm1hcChmdW5jdGlvbihhLGIpe3JldHVybntmYWNlOmEsbmR4OmJ9fSk7cmV0dXJuIGQuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLmZhY2UtYi5mYWNlfSksZH1mdW5jdGlvbiBOKGEpe3ZhciBiPXt9O3JldHVybiBPYmplY3Qua2V5cyhhKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe2JbY109YVtjXX0pLGJ9ZnVuY3Rpb24gTyhhLGIpe3ZhciBjPW5ldyBJbWFnZTtyZXR1cm4gYy5vbmVycm9yPWZ1bmN0aW9uKCl7dmFyIGQ9XCJjb3VsZG4ndCBsb2FkIGltYWdlOiBcIithO2NhKGQpLGIoZCxjKX0sYy5vbmxvYWQ9ZnVuY3Rpb24oKXtiKG51bGwsYyl9LGMuc3JjPWEsY31mdW5jdGlvbiBQKGEsYixjKXtjPWN8fGZhO3ZhciBkPWMudGFyZ2V0fHxhLlRFWFRVUkVfMkQ7aWYoYS5iaW5kVGV4dHVyZShkLGIpLGMuY29sb3IhPT0hMSl7dmFyIGU9SShjLmNvbG9yKTtpZihkPT09YS5URVhUVVJFX0NVQkVfTUFQKWZvcih2YXIgZj0wOzY+ZjsrK2YpYS50ZXhJbWFnZTJEKGEuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YK2YsMCxhLlJHQkEsMSwxLDAsYS5SR0JBLGEuVU5TSUdORURfQllURSxlKTtlbHNlIGEudGV4SW1hZ2UyRChkLDAsYS5SR0JBLDEsMSwwLGEuUkdCQSxhLlVOU0lHTkVEX0JZVEUsZSl9fWZ1bmN0aW9uIFEoYSxiLGMsZCl7Yz1jfHxmYSxQKGEsYixjKSxjPU4oYyk7dmFyIGU9TyhjLnNyYyxmdW5jdGlvbihlLGYpe2U/ZChlLGIsZik6KEthKGEsYixmLGMpLGQobnVsbCxiLGYpKX0pO3JldHVybiBlfWZ1bmN0aW9uIFIoYSxiLGMsZCl7ZnVuY3Rpb24gZShlKXtyZXR1cm4gZnVuY3Rpb24oZixtKXstLWssZj9sLnB1c2goZik6bS53aWR0aCE9PW0uaGVpZ2h0P2wucHVzaChcImN1YmVtYXAgZmFjZSBpbWcgaXMgbm90IGEgc3F1YXJlOiBcIittLnNyYyk6KEYoYSxjKSxhLmJpbmRUZXh0dXJlKGksYiksNT09PWs/TChhKS5mb3JFYWNoKGZ1bmN0aW9uKGIpe2EudGV4SW1hZ2UyRChiLDAsZyxnLGgsbSl9KTphLnRleEltYWdlMkQoZSwwLGcsZyxoLG0pLEcoYSxjKSxhLmdlbmVyYXRlTWlwbWFwKGkpKSwwPT09ayYmZCYmZChsLmxlbmd0aD9sOnZvaWQgMCxqLGIpfX12YXIgZj1jLnNyYztpZig2IT09Zi5sZW5ndGgpdGhyb3dcInRoZXJlIG11c3QgYmUgNiB1cmxzIGZvciBhIGN1YmVtYXBcIjt2YXIgZz1jLmZvcm1hdHx8YS5SR0JBLGg9Yy50eXBlfHxhLlVOU0lHTkVEX0JZVEUsaT1jLnRhcmdldHx8YS5URVhUVVJFXzJEO2lmKGkhPT1hLlRFWFRVUkVfQ1VCRV9NQVApdGhyb3dcInRhcmdldCBtdXN0IGJlIFRFWFRVUkVfQ1VCRV9NQVBcIjtQKGEsYixjKSxjPU4oYyk7dmFyIGosaz02LGw9W10sbT1MKGEsYyk7aj1mLm1hcChmdW5jdGlvbihhLGIpe3JldHVybiBPKGEsZShtW2JdKSl9KX1mdW5jdGlvbiBTKGEpe3N3aXRjaChhKXtjYXNlIG9hOmNhc2UgcmE6cmV0dXJuIDE7Y2FzZSBzYTpyZXR1cm4gMjtjYXNlIHBhOnJldHVybiAzO2Nhc2UgcWE6cmV0dXJuIDQ7ZGVmYXVsdDp0aHJvd1widW5rbm93biB0eXBlOiBcIithfX1mdW5jdGlvbiBUKGEsYil7cmV0dXJuIHgoYik/dShiKTphLlVOU0lHTkVEX0JZVEV9ZnVuY3Rpb24gVShhLGIsYyxkKXtkPWR8fGZhO3ZhciBlPWQudGFyZ2V0fHxhLlRFWFRVUkVfMkQsZj1kLndpZHRoLGc9ZC5oZWlnaHQsaD1kLmZvcm1hdHx8YS5SR0JBLGk9ZC50eXBlfHxUKGEsYyksaj1TKGgpLGs9Yy5sZW5ndGgvajtpZihrJTEpdGhyb3dcImxlbmd0aCB3cm9uZyBzaXplIG9mIGZvcm1hdDogXCIrR2EoYSxoKTtpZihmfHxnKXtpZihnKXtpZighZiYmKGY9ay9nLGYlMSkpdGhyb3dcImNhbid0IGd1ZXNzIHdpZHRoXCJ9ZWxzZSBpZihnPWsvZixnJTEpdGhyb3dcImNhbid0IGd1ZXNzIGhlaWdodFwifWVsc2V7dmFyIGw9TWF0aC5zcXJ0KGsvKGU9PT1hLlRFWFRVUkVfQ1VCRV9NQVA/NjoxKSk7bCUxPT09MD8oZj1sLGc9bCk6KGY9ayxnPTEpfWlmKCF4KGMpKXt2YXIgbT12KGEsaSk7Yz1uZXcgbShjKX1pZihhLnBpeGVsU3RvcmVpKGEuVU5QQUNLX0FMSUdOTUVOVCxkLnVucGFja0FsaWdubWVudHx8MSksRihhLGQpLGU9PT1hLlRFWFRVUkVfQ1VCRV9NQVApe3ZhciBuPWsvNipqO00oYSxkKS5mb3JFYWNoKGZ1bmN0aW9uKGIpe3ZhciBkPW4qYi5uZHgsZT1jLnN1YmFycmF5KGQsZCtuKTthLnRleEltYWdlMkQoYi5mYWNlLDAsaCxmLGcsMCxoLGksZSl9KX1lbHNlIGEudGV4SW1hZ2UyRChlLDAsaCxmLGcsMCxoLGksYyk7cmV0dXJuIEcoYSxkKSx7d2lkdGg6ZixoZWlnaHQ6Z319ZnVuY3Rpb24gVihhLGIsYyl7dmFyIGQ9Yy50YXJnZXR8fGEuVEVYVFVSRV8yRDthLmJpbmRUZXh0dXJlKGQsYik7dmFyIGU9Yy5mb3JtYXR8fGEuUkdCQSxmPWMudHlwZXx8YS5VTlNJR05FRF9CWVRFO2lmKEYoYSxjKSxkPT09YS5URVhUVVJFX0NVQkVfTUFQKWZvcih2YXIgZz0wOzY+ZzsrK2cpYS50ZXhJbWFnZTJEKGEuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YK2csMCxlLGMud2lkdGgsYy5oZWlnaHQsMCxlLGYsbnVsbCk7ZWxzZSBhLnRleEltYWdlMkQoZCwwLGUsYy53aWR0aCxjLmhlaWdodCwwLGUsZixudWxsKX1mdW5jdGlvbiBXKGEsYixjKXtiPWJ8fGZhO3ZhciBkPWEuY3JlYXRlVGV4dHVyZSgpLGU9Yi50YXJnZXR8fGEuVEVYVFVSRV8yRCxmPWIud2lkdGh8fDEsZz1iLmhlaWdodHx8MTthLmJpbmRUZXh0dXJlKGUsZCksZT09PWEuVEVYVFVSRV9DVUJFX01BUCYmKGEudGV4UGFyYW1ldGVyaShlLGEuVEVYVFVSRV9XUkFQX1MsYS5DTEFNUF9UT19FREdFKSxhLnRleFBhcmFtZXRlcmkoZSxhLlRFWFRVUkVfV1JBUF9ULGEuQ0xBTVBfVE9fRURHRSkpO3ZhciBoPWIuc3JjO2lmKGgpaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgaCYmKGg9aChhLGIpKSxcInN0cmluZ1wiPT10eXBlb2YgaClRKGEsZCxiLGMpO2Vsc2UgaWYoeChoKXx8QXJyYXkuaXNBcnJheShoKSYmKFwibnVtYmVyXCI9PXR5cGVvZiBoWzBdfHxBcnJheS5pc0FycmF5KGhbMF0pfHx4KGhbMF0pKSl7dmFyIGk9VShhLGQsaCxiKTtmPWkud2lkdGgsZz1pLmhlaWdodH1lbHNlIGlmKEFycmF5LmlzQXJyYXkoaCkmJlwic3RyaW5nXCI9PXR5cGVvZiBoWzBdKVIoYSxkLGIsYyk7ZWxzZXtpZighKGggaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpdGhyb3dcInVuc3VwcG9ydGVkIHNyYyB0eXBlXCI7S2EoYSxkLGgsYiksZj1oLndpZHRoLGc9aC5oZWlnaHR9ZWxzZSBWKGEsZCxiKTtyZXR1cm4gYi5hdXRvIT09ITEmJksoYSxkLGIsZixnKSxIKGEsZCxiKSxkfWZ1bmN0aW9uIFgoYSxiLGMsZCxlKXtkPWR8fGMud2lkdGgsZT1lfHxjLmhlaWdodDt2YXIgZj1jLnRhcmdldHx8YS5URVhUVVJFXzJEO2EuYmluZFRleHR1cmUoZixiKTt2YXIgZyxoPWMuZm9ybWF0fHxhLlJHQkEsaT1jLnNyYztpZihnPWkmJih4KGkpfHxBcnJheS5pc0FycmF5KGkpJiZcIm51bWJlclwiPT10eXBlb2YgaVswXSk/Yy50eXBlfHxUKGEsaSk6Yy50eXBlfHxhLlVOU0lHTkVEX0JZVEUsZj09PWEuVEVYVFVSRV9DVUJFX01BUClmb3IodmFyIGo9MDs2Pmo7KytqKWEudGV4SW1hZ2UyRChhLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCtqLDAsaCxkLGUsMCxoLGcsbnVsbCk7ZWxzZSBhLnRleEltYWdlMkQoZiwwLGgsZCxlLDAsaCxnLG51bGwpfWZ1bmN0aW9uIFkoYSl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGF8fEFycmF5LmlzQXJyYXkoYSkmJlwic3RyaW5nXCI9PXR5cGVvZiBhWzBdfWZ1bmN0aW9uIFooYSxiLGMpe2Z1bmN0aW9uIGQoKXswPT09ZiYmYyYmc2V0VGltZW91dChmdW5jdGlvbigpe2MoZy5sZW5ndGg/Zzp2b2lkIDAsYil9LDApfWZ1bmN0aW9uIGUoYSl7LS1mLGEmJmcucHVzaChhKSxkKCl9dmFyIGY9MCxnPVtdLGg9e307cmV0dXJuIE9iamVjdC5rZXlzKGIpLmZvckVhY2goZnVuY3Rpb24oYyl7dmFyIGQ9YltjXSxnPXZvaWQgMDtZKGQuc3JjKSYmKGc9ZSwrK2YpLGhbY109VyhhLGQsZyl9KSxkKCksaH1mdW5jdGlvbiAkKGEpe3JldHVybiBNYVthXX1mdW5jdGlvbiBfKGEpe3JldHVybiBOYVthXX1mdW5jdGlvbiBhYShhLGIsYyxkKXt2YXIgZT1hLkZSQU1FQlVGRkVSLGY9YS5jcmVhdGVGcmFtZWJ1ZmZlcigpO2EuYmluZEZyYW1lYnVmZmVyKGUsZiksYz1jfHxhLmRyYXdpbmdCdWZmZXJXaWR0aCxkPWR8fGEuZHJhd2luZ0J1ZmZlckhlaWdodCxiPWJ8fExhO3ZhciBnPTAsaD17ZnJhbWVidWZmZXI6ZixhdHRhY2htZW50czpbXX07cmV0dXJuIGIuZm9yRWFjaChmdW5jdGlvbihiKXt2YXIgZj1iLmF0dGFjaG1lbnQsaT1iLmZvcm1hdCxqPSQoaSk7aWYoanx8KGo9QWErZysrKSwhZilpZihfKGkpKWY9YS5jcmVhdGVSZW5kZXJidWZmZXIoKSxhLmJpbmRSZW5kZXJidWZmZXIoYS5SRU5ERVJCVUZGRVIsZiksYS5yZW5kZXJidWZmZXJTdG9yYWdlKGEuUkVOREVSQlVGRkVSLGksYyxkKTtlbHNle3ZhciBrPU4oYik7ay53aWR0aD1jLGsuaGVpZ2h0PWQsay5hdXRvPXZvaWQgMD09PWIuYXV0bz8hMTpiLmF1dG8sZj1XKGEsayl9aWYoZiBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyYnVmZmVyKWEuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZSxqLGEuUkVOREVSQlVGRkVSLGYpO2Vsc2V7aWYoIShmIGluc3RhbmNlb2YgV2ViR0xUZXh0dXJlKSl0aHJvd1widW5rbm93biBhdHRhY2htZW50IHR5cGVcIjthLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGUsaixiLnRleFRhcmdldHx8YS5URVhUVVJFXzJELGYsYi5sZXZlbHx8MCl9aC5hdHRhY2htZW50cy5wdXNoKGYpfSksaH1mdW5jdGlvbiBiYShhLGIsYyxkLGUpe2Q9ZHx8YS5kcmF3aW5nQnVmZmVyV2lkdGgsZT1lfHxhLmRyYXdpbmdCdWZmZXJIZWlnaHQsYz1jfHxMYSxjLmZvckVhY2goZnVuY3Rpb24oYyxmKXt2YXIgZz1iLmF0dGFjaG1lbnRzW2ZdLGg9Yy5mb3JtYXQ7aWYoZyBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyYnVmZmVyKWEuYmluZFJlbmRlcmJ1ZmZlcihhLlJFTkRFUkJVRkZFUixnKSxhLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoYS5SRU5ERVJCVUZGRVIsaCxkLGUpO2Vsc2V7aWYoIShnIGluc3RhbmNlb2YgV2ViR0xUZXh0dXJlKSl0aHJvd1widW5rbm93biBhdHRhY2htZW50IHR5cGVcIjtYKGEsZyxjLGQsZSl9fSl9dmFyIGNhPXdpbmRvdy5jb25zb2xlJiZ3aW5kb3cuY29uc29sZS5lcnJvcj93aW5kb3cuY29uc29sZS5lcnJvci5iaW5kKHdpbmRvdy5jb25zb2xlKTpmdW5jdGlvbigpe30sZGE9XCJcIixlYT1uZXcgVWludDhBcnJheShbMTI4LDE5MiwyNTUsMjU1XSksZmE9e30sZ2E9NTEyMCxoYT01MTIxLGlhPTUxMjIsamE9NTEyMyxrYT01MTI0LGxhPTUxMjUsbWE9NTEyNixuYT02NDAyLG9hPTY0MDYscGE9NjQwNyxxYT02NDA4LHJhPTY0MDksc2E9NjQxMCx0YT0zMjg1NCx1YT0zMjg1NSx2YT0zNjE5NCx3YT0zMzE4OSx4YT02NDAxLHlhPTM2MTY4LHphPTM0MDQxLEFhPTM2MDY0LEJhPTM2MDk2LENhPTM2MTI4LERhPTMzMzA2LEVhPTMzMDcxLEZhPTk3MjksR2E9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEpe2J8fChiPXt9LE9iamVjdC5rZXlzKGEpLmZvckVhY2goZnVuY3Rpb24oYyl7XCJudW1iZXJcIj09dHlwZW9mIGFbY10mJihiW2FbY11dPWMpfSkpfXZhciBiO3JldHVybiBmdW5jdGlvbihjLGQpe3JldHVybiBhKCksYltkXXx8XCIweFwiK2QudG9TdHJpbmcoMTYpfX0oKSxIYT1bXCJWRVJURVhfU0hBREVSXCIsXCJGUkFHTUVOVF9TSEFERVJcIl0sSWE9ZnVuY3Rpb24oKXt2YXIgYT1bXCJwb3NpdGlvblwiLFwicG9zaXRpb25zXCIsXCJhX3Bvc2l0aW9uXCJdO3JldHVybiBmdW5jdGlvbihiKXtmb3IodmFyIGMsZD0wO2Q8YS5sZW5ndGgmJihjPWFbZF0sIShjIGluIGIpKTsrK2QpO2Q9PT1hLmxlbmd0aCYmKGM9T2JqZWN0LmtleXMoYilbMF0pO3ZhciBlPWJbY10sZj1lLmxlbmd0aHx8ZS5kYXRhLmxlbmd0aCxnPWUubnVtQ29tcG9uZW50c3x8eShjLGYpLGg9Zi9nO2lmKGYlZz4wKXRocm93XCJudW1Db21wb25lbnRzIFwiK2crXCIgbm90IGNvcnJlY3QgZm9yIGxlbmd0aCBcIitmO3JldHVybiBofX0oKSxKYT17fSxLYT1mdW5jdGlvbigpe3ZhciBhPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIikuZ2V0Q29udGV4dChcIjJkXCIpO3JldHVybiBmdW5jdGlvbihiLGMsZCxlKXtlPWV8fGZhO3ZhciBmPWUudGFyZ2V0fHxiLlRFWFRVUkVfMkQsZz1kLndpZHRoLGg9ZC5oZWlnaHQsaT1lLmZvcm1hdHx8Yi5SR0JBLGo9ZS50eXBlfHxiLlVOU0lHTkVEX0JZVEU7aWYoRihiLGUpLGIuYmluZFRleHR1cmUoZixjKSxmPT09Yi5URVhUVVJFX0NVQkVfTUFQKXt2YXIgayxsLG09ZC53aWR0aCxuPWQuaGVpZ2h0O2lmKG0vNj09PW4paz1uLGw9WzAsMCwxLDAsMiwwLDMsMCw0LDAsNSwwXTtlbHNlIGlmKG4vNj09PW0paz1tLGw9WzAsMCwwLDEsMCwyLDAsMywwLDQsMCw1XTtlbHNlIGlmKG0vMz09PW4vMilrPW0vMyxsPVswLDAsMSwwLDIsMCwwLDEsMSwxLDIsMV07ZWxzZXtpZihtLzIhPT1uLzMpdGhyb3dcImNhbid0IGZpZ3VyZSBvdXQgY3ViZSBtYXAgZnJvbSBlbGVtZW50OiBcIisoZC5zcmM/ZC5zcmM6ZC5ub2RlTmFtZSk7az1tLzIsbD1bMCwwLDEsMCwwLDEsMSwxLDAsMiwxLDJdfWEuY2FudmFzLndpZHRoPWssYS5jYW52YXMuaGVpZ2h0PWssZz1rLGg9ayxNKGIsZSkuZm9yRWFjaChmdW5jdGlvbihjKXt2YXIgZT1sWzIqYy5uZHgrMF0qayxmPWxbMipjLm5keCsxXSprO2EuZHJhd0ltYWdlKGQsZSxmLGssaywwLDAsayxrKSxiLnRleEltYWdlMkQoYy5mYWNlLDAsaSxpLGosYS5jYW52YXMpfSksYS5jYW52YXMud2lkdGg9MSxhLmNhbnZhcy5oZWlnaHQ9MX1lbHNlIGIudGV4SW1hZ2UyRChmLDAsaSxpLGosZCk7RyhiLGUpLGUuYXV0byE9PSExJiZLKGIsYyxlLGcsaCksSChiLGMsZSl9fSgpLExhPVt7Zm9ybWF0OnFhLHR5cGU6aGEsbWluOkZhLHdyYXA6RWF9LHtmb3JtYXQ6emF9XSxNYT17fTtNYVt6YV09RGEsTWFbeGFdPUNhLE1hW3lhXT1DYSxNYVtuYV09QmEsTWFbd2FdPUJhO3ZhciBOYT17fTtyZXR1cm4gTmFbdGFdPSEwLE5hW3VhXT0hMCxOYVt2YV09ITAsTmFbemFdPSEwLE5hW3dhXT0hMCxOYVt4YV09ITAsTmFbeWFdPSEwLHtjcmVhdGVBdHRyaWJzRnJvbUFycmF5czpBLGNyZWF0ZUJ1ZmZlcnNGcm9tQXJyYXlzOkMsY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXM6QixjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzOm4sY3JlYXRlUHJvZ3JhbTpnLGNyZWF0ZVByb2dyYW1Gcm9tU2NyaXB0czppLGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlczpqLGNyZWF0ZVByb2dyYW1JbmZvOnEsY3JlYXRlVW5pZm9ybVNldHRlcnM6bCxkcmF3QnVmZmVySW5mbzpELGRyYXdPYmplY3RMaXN0OkUsZ2V0V2ViR0xDb250ZXh0OmQscmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZTpyLHNldEF0dHJpYnV0ZXM6byxzZXRBdHRyaWJ1dGVQcmVmaXg6YixzZXRCdWZmZXJzQW5kQXR0cmlidXRlczpwLHNldFVuaWZvcm1zOm0sY3JlYXRlVGV4dHVyZTpXLHNldEVtcHR5VGV4dHVyZTpWLHNldFRleHR1cmVGcm9tQXJyYXk6VSxsb2FkVGV4dHVyZUZyb21Vcmw6USxzZXRUZXh0dXJlRnJvbUVsZW1lbnQ6S2Esc2V0VGV4dHVyZUZpbHRlcmluZ0ZvclNpemU6SyxzZXRUZXh0dXJlUGFyYW1ldGVyczpILHNldERlZmF1bHRUZXh0dXJlQ29sb3I6YSxjcmVhdGVUZXh0dXJlczpaLHJlc2l6ZVRleHR1cmU6WCxjcmVhdGVGcmFtZWJ1ZmZlckluZm86YWEscmVzaXplRnJhbWVidWZmZXJJbmZvOmJhfX0pLGMoXCJ0d2dsL3YzXCIsW10sZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEpe3E9YX1mdW5jdGlvbiBiKCl7cmV0dXJuIG5ldyBxKDMpfWZ1bmN0aW9uIGMoYSxiLGMpe3JldHVybiBjPWN8fG5ldyBxKDMpLGNbMF09YVswXStiWzBdLGNbMV09YVsxXStiWzFdLGNbMl09YVsyXStiWzJdLGN9ZnVuY3Rpb24gZChhLGIsYyl7cmV0dXJuIGM9Y3x8bmV3IHEoMyksY1swXT1hWzBdLWJbMF0sY1sxXT1hWzFdLWJbMV0sY1syXT1hWzJdLWJbMl0sY31mdW5jdGlvbiBlKGEsYixjLGQpe3JldHVybiBkPWR8fG5ldyBxKDMpLGRbMF09KDEtYykqYVswXStjKmJbMF0sZFsxXT0oMS1jKSphWzFdK2MqYlsxXSxkWzJdPSgxLWMpKmFbMl0rYypiWzJdLGR9ZnVuY3Rpb24gZihhLGIsYyl7cmV0dXJuIGM9Y3x8bmV3IHEoMyksY1swXT1hWzBdKmIsY1sxXT1hWzFdKmIsY1syXT1hWzJdKmIsY31mdW5jdGlvbiBnKGEsYixjKXtyZXR1cm4gYz1jfHxuZXcgcSgzKSxjWzBdPWFbMF0vYixjWzFdPWFbMV0vYixjWzJdPWFbMl0vYixjfWZ1bmN0aW9uIGgoYSxiLGMpe3JldHVybiBjPWN8fG5ldyBxKDMpLGNbMF09YVsxXSpiWzJdLWFbMl0qYlsxXSxjWzFdPWFbMl0qYlswXS1hWzBdKmJbMl0sY1syXT1hWzBdKmJbMV0tYVsxXSpiWzBdLGN9ZnVuY3Rpb24gaShhLGIpe3JldHVybiBhWzBdKmJbMF0rYVsxXSpiWzFdK2FbMl0qYlsyXX1mdW5jdGlvbiBqKGEpe3JldHVybiBNYXRoLnNxcnQoYVswXSphWzBdK2FbMV0qYVsxXSthWzJdKmFbMl0pfWZ1bmN0aW9uIGsoYSl7cmV0dXJuIGFbMF0qYVswXSthWzFdKmFbMV0rYVsyXSphWzJdfWZ1bmN0aW9uIGwoYSxiKXtiPWJ8fG5ldyBxKDMpO3ZhciBjPWFbMF0qYVswXSthWzFdKmFbMV0rYVsyXSphWzJdLGQ9TWF0aC5zcXJ0KGMpO3JldHVybiBkPjFlLTU/KGJbMF09YVswXS9kLGJbMV09YVsxXS9kLGJbMl09YVsyXS9kKTooYlswXT0wLGJbMV09MCxiWzJdPTApLGJ9ZnVuY3Rpb24gbShhLGIpe3JldHVybiBiPWJ8fG5ldyBxKDMpLGJbMF09LWFbMF0sYlsxXT0tYVsxXSxiWzJdPS1hWzJdLGJ9ZnVuY3Rpb24gbihhLGIpe3JldHVybiBiPWJ8fG5ldyBxKDMpLGJbMF09YVswXSxiWzFdPWFbMV0sYlsyXT1hWzJdLGJ9ZnVuY3Rpb24gbyhhLGIsYyl7cmV0dXJuIGM9Y3x8bmV3IHEoMyksY1swXT1hWzBdKmJbMF0sY1sxXT1hWzFdKmJbMV0sY1syXT1hWzJdKmJbMl0sY31mdW5jdGlvbiBwKGEsYixjKXtyZXR1cm4gYz1jfHxuZXcgcSgzKSxjWzBdPWFbMF0vYlswXSxjWzFdPWFbMV0vYlsxXSxjWzJdPWFbMl0vYlsyXSxjfXZhciBxPUZsb2F0MzJBcnJheTtyZXR1cm57YWRkOmMsY29weTpuLGNyZWF0ZTpiLGNyb3NzOmgsZGl2aWRlOnAsZGl2U2NhbGFyOmcsZG90OmksbGVycDplLGxlbmd0aDpqLGxlbmd0aFNxOmssbXVsU2NhbGFyOmYsbXVsdGlwbHk6byxuZWdhdGU6bSxub3JtYWxpemU6bCxzZXREZWZhdWx0VHlwZTphLHN1YnRyYWN0OmR9fSksYyhcInR3Z2wvbTRcIixbXCIuL3YzXCJdLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSl7VmVjVHlwZT1hfWZ1bmN0aW9uIGMoYSxiKXtyZXR1cm4gYj1ifHxuZXcgRSgxNiksYlswXT0tYVswXSxiWzFdPS1hWzFdLGJbMl09LWFbMl0sYlszXT0tYVszXSxiWzRdPS1hWzRdLGJbNV09LWFbNV0sYls2XT0tYVs2XSxiWzddPS1hWzddLGJbOF09LWFbOF0sYls5XT0tYVs5XSxiWzEwXT0tYVsxMF0sYlsxMV09LWFbMTFdLGJbMTJdPS1hWzEyXSxiWzEzXT0tYVsxM10sYlsxNF09LWFbMTRdLGJbMTVdPS1hWzE1XSxifWZ1bmN0aW9uIGQoYSxiKXtyZXR1cm4gYj1ifHxuZXcgRSgxNiksYlswXT1hWzBdLGJbMV09YVsxXSxiWzJdPWFbMl0sYlszXT1hWzNdLGJbNF09YVs0XSxiWzVdPWFbNV0sYls2XT1hWzZdLGJbN109YVs3XSxiWzhdPWFbOF0sYls5XT1hWzldLGJbMTBdPWFbMTBdLGJbMTFdPWFbMTFdLGJbMTJdPWFbMTJdLGJbMTNdPWFbMTNdLGJbMTRdPWFbMTRdLGJbMTVdPWFbMTVdLGJ9ZnVuY3Rpb24gZShhKXtyZXR1cm4gYT1hfHxuZXcgRSgxNiksYVswXT0xLGFbMV09MCxhWzJdPTAsYVszXT0wLGFbNF09MCxhWzVdPTEsYVs2XT0wLGFbN109MCxhWzhdPTAsYVs5XT0wLGFbMTBdPTEsYVsxMV09MCxhWzEyXT0wLGFbMTNdPTAsYVsxNF09MCxhWzE1XT0xLGF9ZnVuY3Rpb24gZihhLGIpe2lmKGI9Ynx8bmV3IEUoMTYpLGI9PT1hKXt2YXIgYztyZXR1cm4gYz1hWzFdLGFbMV09YVs0XSxhWzRdPWMsYz1hWzJdLGFbMl09YVs4XSxhWzhdPWMsYz1hWzNdLGFbM109YVsxMl0sYVsxMl09YyxjPWFbNl0sYVs2XT1hWzldLGFbOV09YyxjPWFbN10sYVs3XT1hWzEzXSxhWzEzXT1jLGM9YVsxMV0sYVsxMV09YVsxNF0sYVsxNF09YyxifXZhciBkPWFbMF0sZT1hWzFdLGY9YVsyXSxnPWFbM10saD1hWzRdLGk9YVs1XSxqPWFbNl0saz1hWzddLGw9YVs4XSxtPWFbOV0sbj1hWzEwXSxvPWFbMTFdLHA9YVsxMl0scT1hWzEzXSxyPWFbMTRdLHM9YVsxNV07cmV0dXJuIGJbMF09ZCxiWzFdPWgsYlsyXT1sLGJbM109cCxiWzRdPWUsYls1XT1pLGJbNl09bSxiWzddPXEsYls4XT1mLGJbOV09aixiWzEwXT1uLGJbMTFdPXIsYlsxMl09ZyxiWzEzXT1rLGJbMTRdPW8sYlsxNV09cyxifWZ1bmN0aW9uIGcoYSxiKXtiPWJ8fG5ldyBFKDE2KTt2YXIgYz1hWzBdLGQ9YVsxXSxlPWFbMl0sZj1hWzNdLGc9YVs0XSxoPWFbNV0saT1hWzZdLGo9YVs3XSxrPWFbOF0sbD1hWzldLG09YVsxMF0sbj1hWzExXSxvPWFbMTJdLHA9YVsxM10scT1hWzE0XSxyPWFbMTVdLHM9bSpyLHQ9cSpuLHU9aSpyLHY9cSpqLHc9aSpuLHg9bSpqLHk9ZSpyLHo9cSpmLEE9ZSpuLEI9bSpmLEM9ZSpqLEQ9aSpmLEY9aypwLEc9bypsLEg9ZypwLEk9bypoLEo9ZypsLEs9aypoLEw9YypwLE09bypkLE49YypsLE89aypkLFA9YypoLFE9ZypkLFI9cypoK3YqbCt3KnAtKHQqaCt1KmwreCpwKSxTPXQqZCt5KmwrQipwLShzKmQreipsK0EqcCksVD11KmQreipoK0MqcC0odipkK3kqaCtEKnApLFU9eCpkK0EqaCtEKmwtKHcqZCtCKmgrQypsKSxWPTEvKGMqUitnKlMraypUK28qVSk7cmV0dXJuIGJbMF09VipSLGJbMV09VipTLGJbMl09VipULGJbM109VipVLGJbNF09VioodCpnK3Uqayt4Km8tKHMqZyt2KmsrdypvKSksYls1XT1WKihzKmMreiprK0Eqby0odCpjK3kqaytCKm8pKSxiWzZdPVYqKHYqYyt5KmcrRCpvLSh1KmMreipnK0MqbykpLGJbN109VioodypjK0IqZytDKmstKHgqYytBKmcrRCprKSksYls4XT1WKihGKmorSSpuK0oqci0oRypqK0gqbitLKnIpKSxiWzldPVYqKEcqZitMKm4rTypyLShGKmYrTSpuK04qcikpLGJbMTBdPVYqKEgqZitNKmorUCpyLShJKmYrTCpqK1EqcikpLGJbMTFdPVYqKEsqZitOKmorUSpuLShKKmYrTypqK1AqbikpLGJbMTJdPVYqKEgqbStLKnErRyppLShKKnErRippK0kqbSkpLGJbMTNdPVYqKE4qcStGKmUrTSptLShMKm0rTypxK0cqZSkpLGJbMTRdPVYqKEwqaStRKnErSSplLShQKnErSCplK00qaSkpLGJbMTVdPVYqKFAqbStKKmUrTyppLShOKmkrUSptK0sqZSkpLGJ9ZnVuY3Rpb24gaChhLGIsYyl7Yz1jfHxuZXcgRSgxNik7dmFyIGQ9YVswXSxlPWFbMV0sZj1hWzJdLGc9YVszXSxoPWFbNF0saT1hWzVdLGo9YVs2XSxrPWFbN10sbD1hWzhdLG09YVs5XSxuPWFbMTBdLG89YVsxMV0scD1hWzEyXSxxPWFbMTNdLHI9YVsxNF0scz1hWzE1XSx0PWJbMF0sdT1iWzFdLHY9YlsyXSx3PWJbM10seD1iWzRdLHk9Yls1XSx6PWJbNl0sQT1iWzddLEI9Yls4XSxDPWJbOV0sRD1iWzEwXSxGPWJbMTFdLEc9YlsxMl0sSD1iWzEzXSxJPWJbMTRdLEo9YlsxNV07cmV0dXJuIGNbMF09ZCp0K2UqeCtmKkIrZypHLGNbMV09ZCp1K2UqeStmKkMrZypILGNbMl09ZCp2K2UqeitmKkQrZypJLGNbM109ZCp3K2UqQStmKkYrZypKLGNbNF09aCp0K2kqeCtqKkIraypHLGNbNV09aCp1K2kqeStqKkMraypILGNbNl09aCp2K2kqeitqKkQraypJLGNbN109aCp3K2kqQStqKkYraypKLGNbOF09bCp0K20qeCtuKkIrbypHLGNbOV09bCp1K20qeStuKkMrbypILGNbMTBdPWwqdittKnorbipEK28qSSxjWzExXT1sKncrbSpBK24qRitvKkosY1sxMl09cCp0K3EqeCtyKkIrcypHLGNbMTNdPXAqdStxKnkrcipDK3MqSCxjWzE0XT1wKnYrcSp6K3IqRCtzKkksY1sxNV09cCp3K3EqQStyKkYrcypKLGN9ZnVuY3Rpb24gaShhLGIsYyl7cmV0dXJuIGM9Y3x8ZSgpLGEhPT1jJiYoY1swXT1hWzBdLGNbMV09YVsxXSxjWzJdPWFbMl0sY1szXT1hWzNdLGNbNF09YVs0XSxjWzVdPWFbNV0sY1s2XT1hWzZdLGNbN109YVs3XSxjWzhdPWFbOF0sY1s5XT1hWzldLGNbMTBdPWFbMTBdLGNbMTFdPWFbMTFdKSxjWzEyXT1iWzBdLGNbMTNdPWJbMV0sY1sxNF09YlsyXSxjWzE1XT0xLGN9ZnVuY3Rpb24gaihiLGMpe3JldHVybiBjPWN8fGEuY3JlYXRlKCksY1swXT1iWzEyXSxjWzFdPWJbMTNdLGNbMl09YlsxNF0sY31mdW5jdGlvbiBrKGIsYyxkKXtkPWR8fGEuY3JlYXRlKCk7dmFyIGU9NCpjO3JldHVybiBkWzBdPWJbZSswXSxkWzFdPWJbZSsxXSxkWzJdPWJbZSsyXSxkfWZ1bmN0aW9uIGwoYSxiLGMsZCxlKXtlPWV8fG5ldyBFKDE2KTt2YXIgZj1NYXRoLnRhbiguNSpNYXRoLlBJLS41KmEpLGc9MS8oYy1kKTtyZXR1cm4gZVswXT1mL2IsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09ZixlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09KGMrZCkqZyxlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09YypkKmcqMixlWzE1XT0wLGV9ZnVuY3Rpb24gbShhLGIsYyxkLGUsZixnKXtyZXR1cm4gZz1nfHxuZXcgRSgxNiksZ1swXT0yLyhiLWEpLGdbMV09MCxnWzJdPTAsZ1szXT0wLGdbNF09MCxnWzVdPTIvKGQtYyksZ1s2XT0wLGdbN109MCxnWzhdPTAsZ1s5XT0wLGdbMTBdPS0xLyhmLWUpLGdbMTFdPTAsZ1sxMl09KGIrYSkvKGEtYiksZ1sxM109KGQrYykvKGMtZCksZ1sxNF09LWUvKGUtZiksZ1sxNV09MSxnfWZ1bmN0aW9uIG4oYSxiLGMsZCxlLGYsZyl7Zz1nfHxuZXcgRSgxNik7dmFyIGg9Yi1hLGk9ZC1jLGo9ZS1mO3JldHVybiBnWzBdPTIqZS9oLGdbMV09MCxnWzJdPTAsZ1szXT0wLGdbNF09MCxnWzVdPTIqZS9pLGdbNl09MCxnWzddPTAsZ1s4XT0oYStiKS9oLGdbOV09KGQrYykvaSxnWzEwXT1mL2osZ1sxMV09LTEsZ1sxMl09MCxnWzEzXT0wLGdbMTRdPWUqZi9qLGdbMTVdPTAsZ31mdW5jdGlvbiBvKGIsYyxkLGUpe2U9ZXx8bmV3IEUoMTYpO3ZhciBmPUYsZz1HLGg9SDtyZXR1cm4gYS5ub3JtYWxpemUoYS5zdWJ0cmFjdChiLGMsaCksaCksYS5ub3JtYWxpemUoYS5jcm9zcyhkLGgsZiksZiksYS5ub3JtYWxpemUoYS5jcm9zcyhoLGYsZyksZyksZVswXT1mWzBdLGVbMV09ZlsxXSxlWzJdPWZbMl0sZVszXT0wLGVbNF09Z1swXSxlWzVdPWdbMV0sZVs2XT1nWzJdLGVbN109MCxlWzhdPWhbMF0sZVs5XT1oWzFdLGVbMTBdPWhbMl0sZVsxMV09MCxlWzEyXT1iWzBdLGVbMTNdPWJbMV0sZVsxNF09YlsyXSxlWzE1XT0xLGV9ZnVuY3Rpb24gcChhLGIpe3JldHVybiBiPWJ8fG5ldyBFKDE2KSxiWzBdPTEsYlsxXT0wLGJbMl09MCxiWzNdPTAsYls0XT0wLGJbNV09MSxiWzZdPTAsYls3XT0wLGJbOF09MCxiWzldPTAsYlsxMF09MSxiWzExXT0wLGJbMTJdPWFbMF0sYlsxM109YVsxXSxiWzE0XT1hWzJdLGJbMTVdPTEsYn1mdW5jdGlvbiBxKGEsYixjKXtjPWN8fG5ldyBFKDE2KTt2YXIgZD1iWzBdLGU9YlsxXSxmPWJbMl0sZz1hWzBdLGg9YVsxXSxpPWFbMl0saj1hWzNdLGs9YVs0XSxsPWFbNV0sbT1hWzZdLG49YVs3XSxvPWFbOF0scD1hWzldLHE9YVsxMF0scj1hWzExXSxzPWFbMTJdLHQ9YVsxM10sdT1hWzE0XSx2PWFbMTVdO3JldHVybiBhIT09YyYmKGNbMF09ZyxjWzFdPWgsY1syXT1pLGNbM109aixjWzRdPWssY1s1XT1sLGNbNl09bSxjWzddPW4sY1s4XT1vLGNbOV09cCxjWzEwXT1xLGNbMTFdPXIpLGNbMTJdPWcqZCtrKmUrbypmK3MsY1sxM109aCpkK2wqZStwKmYrdCxjWzE0XT1pKmQrbSplK3EqZit1LGNbMTVdPWoqZCtuKmUrcipmK3YsY31mdW5jdGlvbiByKGEsYil7Yj1ifHxuZXcgRSgxNik7dmFyIGM9TWF0aC5jb3MoYSksZD1NYXRoLnNpbihhKTtyZXR1cm4gYlswXT0xLGJbMV09MCxiWzJdPTAsYlszXT0wLGJbNF09MCxiWzVdPWMsYls2XT1kLGJbN109MCxiWzhdPTAsYls5XT0tZCxiWzEwXT1jLGJbMTFdPTAsYlsxMl09MCxiWzEzXT0wLGJbMTRdPTAsYlsxNV09MSxifWZ1bmN0aW9uIHMoYSxiLGMpe2M9Y3x8bmV3IEUoMTYpO3ZhciBkPWFbNF0sZT1hWzVdLGY9YVs2XSxnPWFbN10saD1hWzhdLGk9YVs5XSxqPWFbMTBdLGs9YVsxMV0sbD1NYXRoLmNvcyhiKSxtPU1hdGguc2luKGIpO3JldHVybiBjWzRdPWwqZCttKmgsY1s1XT1sKmUrbSppLGNbNl09bCpmK20qaixjWzddPWwqZyttKmssY1s4XT1sKmgtbSpkLGNbOV09bCppLW0qZSxjWzEwXT1sKmotbSpmLGNbMTFdPWwqay1tKmcsYSE9PWMmJihjWzBdPWFbMF0sY1sxXT1hWzFdLGNbMl09YVsyXSxjWzNdPWFbM10sY1sxMl09YVsxMl0sY1sxM109YVsxM10sY1sxNF09YVsxNF0sY1sxNV09YVsxNV0pLGN9ZnVuY3Rpb24gdChhLGIpe2I9Ynx8bmV3IEUoMTYpO3ZhciBjPU1hdGguY29zKGEpLGQ9TWF0aC5zaW4oYSk7cmV0dXJuIGJbMF09YyxiWzFdPTAsYlsyXT0tZCxiWzNdPTAsYls0XT0wLGJbNV09MSxiWzZdPTAsYls3XT0wLGJbOF09ZCxiWzldPTAsYlsxMF09YyxiWzExXT0wLGJbMTJdPTAsYlsxM109MCxiWzE0XT0wLGJbMTVdPTEsYn1mdW5jdGlvbiB1KGEsYixjKXtjPWN8fG5ldyBFKDE2KTt2YXIgZD1hWzBdLGU9YVsxXSxmPWFbMl0sZz1hWzNdLGg9YVs4XSxpPWFbOV0saj1hWzEwXSxrPWFbMTFdLGw9TWF0aC5jb3MoYiksbT1NYXRoLnNpbihiKTtyZXR1cm4gY1swXT1sKmQtbSpoLGNbMV09bCplLW0qaSxjWzJdPWwqZi1tKmosY1szXT1sKmctbSprLGNbOF09bCpoK20qZCxjWzldPWwqaSttKmUsY1sxMF09bCpqK20qZixjWzExXT1sKmsrbSpnLGEhPT1jJiYoY1s0XT1hWzRdLGNbNV09YVs1XSxjWzZdPWFbNl0sY1s3XT1hWzddLGNbMTJdPWFbMTJdLGNbMTNdPWFbMTNdLGNbMTRdPWFbMTRdLGNbMTVdPWFbMTVdKSxjfWZ1bmN0aW9uIHYoYSxiKXtiPWJ8fG5ldyBFKDE2KTt2YXIgYz1NYXRoLmNvcyhhKSxkPU1hdGguc2luKGEpO3JldHVybiBiWzBdPWMsYlsxXT1kLGJbMl09MCxiWzNdPTAsYls0XT0tZCxiWzVdPWMsYls2XT0wLGJbN109MCxiWzhdPTAsYls5XT0wLGJbMTBdPTEsYlsxMV09MCxiWzEyXT0wLGJbMTNdPTAsYlsxNF09MCxiWzE1XT0xLGJ9ZnVuY3Rpb24gdyhhLGIsYyl7Yz1jfHxuZXcgRSgxNik7dmFyIGQ9YVswXSxlPWFbMV0sZj1hWzJdLGc9YVszXSxoPWFbNF0saT1hWzVdLGo9YVs2XSxrPWFbN10sbD1NYXRoLmNvcyhiKSxtPU1hdGguc2luKGIpO3JldHVybiBjWzBdPWwqZCttKmgsY1sxXT1sKmUrbSppLGNbMl09bCpmK20qaixjWzNdPWwqZyttKmssY1s0XT1sKmgtbSpkLGNbNV09bCppLW0qZSxjWzZdPWwqai1tKmYsY1s3XT1sKmstbSpnLGEhPT1jJiYoY1s4XT1hWzhdLGNbOV09YVs5XSxjWzEwXT1hWzEwXSxjWzExXT1hWzExXSxjWzEyXT1hWzEyXSxjWzEzXT1hWzEzXSxjWzE0XT1hWzE0XSxjWzE1XT1hWzE1XSksY31mdW5jdGlvbiB4KGEsYixjKXtjPWN8fG5ldyBFKDE2KTt2YXIgZD1hWzBdLGU9YVsxXSxmPWFbMl0sZz1NYXRoLnNxcnQoZCpkK2UqZStmKmYpO2QvPWcsZS89ZyxmLz1nO3ZhciBoPWQqZCxpPWUqZSxqPWYqZixrPU1hdGguY29zKGIpLGw9TWF0aC5zaW4oYiksbT0xLWs7cmV0dXJuIGNbMF09aCsoMS1oKSprLGNbMV09ZCplKm0rZipsLGNbMl09ZCpmKm0tZSpsLGNbM109MCxjWzRdPWQqZSptLWYqbCxjWzVdPWkrKDEtaSkqayxjWzZdPWUqZiptK2QqbCxjWzddPTAsY1s4XT1kKmYqbStlKmwsY1s5XT1lKmYqbS1kKmwsY1sxMF09aisoMS1qKSprLGNbMTFdPTAsY1sxMl09MCxjWzEzXT0wLGNbMTRdPTAsY1sxNV09MSxjfWZ1bmN0aW9uIHkoYSxiLGMsZCl7ZD1kfHxuZXcgRSgxNik7dmFyIGU9YlswXSxmPWJbMV0sZz1iWzJdLGg9TWF0aC5zcXJ0KGUqZStmKmYrZypnKTtlLz1oLGYvPWgsZy89aDt2YXIgaT1lKmUsaj1mKmYsaz1nKmcsbD1NYXRoLmNvcyhjKSxtPU1hdGguc2luKGMpLG49MS1sLG89aSsoMS1pKSpsLHA9ZSpmKm4rZyptLHE9ZSpnKm4tZiptLHI9ZSpmKm4tZyptLHM9aisoMS1qKSpsLHQ9ZipnKm4rZSptLHU9ZSpnKm4rZiptLHY9ZipnKm4tZSptLHc9aysoMS1rKSpsLHg9YVswXSx5PWFbMV0sej1hWzJdLEE9YVszXSxCPWFbNF0sQz1hWzVdLEQ9YVs2XSxGPWFbN10sRz1hWzhdLEg9YVs5XSxJPWFbMTBdLEo9YVsxMV07cmV0dXJuIGRbMF09byp4K3AqQitxKkcsZFsxXT1vKnkrcCpDK3EqSCxkWzJdPW8qeitwKkQrcSpJLGRbM109bypBK3AqRitxKkosZFs0XT1yKngrcypCK3QqRyxkWzVdPXIqeStzKkMrdCpILGRbNl09cip6K3MqRCt0KkksZFs3XT1yKkErcypGK3QqSixkWzhdPXUqeCt2KkIrdypHLGRbOV09dSp5K3YqQyt3KkgsZFsxMF09dSp6K3YqRCt3KkksZFsxMV09dSpBK3YqRit3KkosYSE9PWQmJihkWzEyXT1hWzEyXSxkWzEzXT1hWzEzXSxkWzE0XT1hWzE0XSxkWzE1XT1hWzE1XSksZH1mdW5jdGlvbiB6KGEsYil7cmV0dXJuIGI9Ynx8bmV3IEUoMTYpLGJbMF09YVswXSxiWzFdPTAsYlsyXT0wLGJbM109MCxiWzRdPTAsYls1XT1hWzFdLGJbNl09MCxiWzddPTAsYls4XT0wLGJbOV09MCxiWzEwXT1hWzJdLGJbMTFdPTAsYlsxMl09MCxiWzEzXT0wLGJbMTRdPTAsYlsxNV09MSxifWZ1bmN0aW9uIEEoYSxiLGMpe2M9Y3x8bmV3IEUoMTYpO3ZhciBkPWJbMF0sZT1iWzFdLGY9YlsyXTtyZXR1cm4gY1swXT1kKmFbMF0sY1sxXT1kKmFbMV0sY1syXT1kKmFbMl0sY1szXT1kKmFbM10sY1s0XT1lKmFbNF0sY1s1XT1lKmFbNV0sY1s2XT1lKmFbNl0sY1s3XT1lKmFbN10sY1s4XT1mKmFbOF0sY1s5XT1mKmFbOV0sY1sxMF09ZiphWzEwXSxjWzExXT1mKmFbMTFdLGEhPT1jJiYoY1sxMl09YVsxMl0sY1sxM109YVsxM10sY1sxNF09YVsxNF0sY1sxNV09YVsxNV0pLGF9ZnVuY3Rpb24gQihiLGMsZCl7ZD1kfHxhLmNyZWF0ZSgpO3ZhciBlPWNbMF0sZj1jWzFdLGc9Y1syXSxoPWUqYlszXStmKmJbN10rZypiWzExXStiWzE1XTtyZXR1cm4gZFswXT0oZSpiWzBdK2YqYls0XStnKmJbOF0rYlsxMl0pL2gsZFsxXT0oZSpiWzFdK2YqYls1XStnKmJbOV0rYlsxM10pL2gsZFsyXT0oZSpiWzJdK2YqYls2XStnKmJbMTBdK2JbMTRdKS9oLGR9ZnVuY3Rpb24gQyhiLGMsZCl7ZD1kfHxhLmNyZWF0ZSgpO3ZhciBlPWNbMF0sZj1jWzFdLGc9Y1syXTtyZXR1cm4gZFswXT1lKmJbMF0rZipiWzRdK2cqYls4XSxkWzFdPWUqYlsxXStmKmJbNV0rZypiWzldLGRbMl09ZSpiWzJdK2YqYls2XStnKmJbMTBdLGR9ZnVuY3Rpb24gRChiLGMsZCl7ZD1kfHxhLmNyZWF0ZSgpO3ZhciBlPWcoYiksZj1jWzBdLGg9Y1sxXSxpPWNbMl07cmV0dXJuIGRbMF09ZiplWzBdK2gqZVsxXStpKmVbMl0sZFsxXT1mKmVbNF0raCplWzVdK2kqZVs2XSxkWzJdPWYqZVs4XStoKmVbOV0raSplWzEwXSxkfXZhciBFPUZsb2F0MzJBcnJheSxGPWEuY3JlYXRlKCksRz1hLmNyZWF0ZSgpLEg9YS5jcmVhdGUoKTtyZXR1cm57YXhpc1JvdGF0ZTp5LGF4aXNSb3RhdGlvbjp4LGNyZWF0ZTplLGNvcHk6ZCxmcnVzdHVtOm4sZ2V0QXhpczprLGdldFRyYW5zbGF0aW9uOmosaWRlbnRpdHk6ZSxpbnZlcnNlOmcsbG9va0F0Om8sbXVsdGlwbHk6aCxuZWdhdGU6YyxvcnRobzptLHBlcnNwZWN0aXZlOmwscm90YXRlWDpzLHJvdGF0ZVk6dSxyb3RhdGVaOncscm90YXRpb25YOnIscm90YXRpb25ZOnQscm90YXRpb25aOnYsc2NhbGU6QSxzY2FsaW5nOnosc2V0RGVmYXVsdFR5cGU6YixzZXRUcmFuc2xhdGlvbjppLHRyYW5zZm9ybURpcmVjdGlvbjpDLHRyYW5zZm9ybU5vcm1hbDpELHRyYW5zZm9ybVBvaW50OkIsdHJhbnNsYXRlOnEsdHJhbnNsYXRpb246cCx0cmFuc3Bvc2U6Zn19KSxjKFwidHdnbC9wcmltaXRpdmVzXCIsW1wiLi90d2dsXCIsXCIuL200XCIsXCIuL3YzXCJdLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEsYil7dmFyIGM9MDtyZXR1cm4gYS5wdXNoPWZ1bmN0aW9uKCl7Zm9yKHZhciBiPTA7Yjxhcmd1bWVudHMubGVuZ3RoOysrYil7dmFyIGQ9YXJndW1lbnRzW2JdO2lmKGQgaW5zdGFuY2VvZiBBcnJheXx8ZC5idWZmZXImJmQuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpZm9yKHZhciBlPTA7ZTxkLmxlbmd0aDsrK2UpYVtjKytdPWRbZV07ZWxzZSBhW2MrK109ZH19LGEucmVzZXQ9ZnVuY3Rpb24oYSl7Yz1hfHwwfSxhLm51bUNvbXBvbmVudHM9YixPYmplY3QuZGVmaW5lUHJvcGVydHkoYSxcIm51bUVsZW1lbnRzXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmxlbmd0aC90aGlzLm51bUNvbXBvbmVudHN8MH19KSxhfWZ1bmN0aW9uIGUoYSxiLGMpe3ZhciBlPWN8fEZsb2F0MzJBcnJheTtyZXR1cm4gZChuZXcgZShhKmIpLGEpfWZ1bmN0aW9uIGYoYSl7cmV0dXJuXCJpbmRpY2VzXCIhPT1hfWZ1bmN0aW9uIGcoYSl7ZnVuY3Rpb24gYihiKXtmb3IodmFyIGY9YVtiXSxoPWYubnVtQ29tcG9uZW50cyxpPWUoaCxnLGYuY29uc3RydWN0b3IpLGo9MDtnPmo7KytqKWZvcih2YXIgaz1jW2pdLGw9aypoLG09MDtoPm07KyttKWkucHVzaChmW2wrbV0pO2RbYl09aX12YXIgYz1hLmluZGljZXMsZD17fSxnPWMubGVuZ3RoO3JldHVybiBPYmplY3Qua2V5cyhhKS5maWx0ZXIoZikuZm9yRWFjaChiKSxkfWZ1bmN0aW9uIGgoYSl7aWYoYS5pbmRpY2VzKXRocm93XCJjYW4ndCBmbGF0dGVuIG5vcm1hbHMgb2YgaW5kZXhlZCB2ZXJ0aWNlcy4gZGVpbmRleCB0aGVtIGZpcnN0XCI7Zm9yKHZhciBiPWEubm9ybWFsLGM9Yi5sZW5ndGgsZD0wO2M+ZDtkKz05KXt2YXIgZT1iW2QrMF0sZj1iW2QrMV0sZz1iW2QrMl0saD1iW2QrM10saT1iW2QrNF0saj1iW2QrNV0saz1iW2QrNl0sbD1iW2QrN10sbT1iW2QrOF0sbj1lK2grayxvPWYraStsLHA9ZytqK20scT1NYXRoLnNxcnQobipuK28qbytwKnApO24vPXEsby89cSxwLz1xLGJbZCswXT1uLGJbZCsxXT1vLGJbZCsyXT1wLGJbZCszXT1uLGJbZCs0XT1vLGJbZCs1XT1wLGJbZCs2XT1uLGJbZCs3XT1vLGJbZCs4XT1wfXJldHVybiBhfWZ1bmN0aW9uIGkoYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPW5ldyBGbG9hdDMyQXJyYXkoMyksZj0wO2Q+ZjtmKz0zKWMoYixbYVtmXSxhW2YrMV0sYVtmKzJdXSxlKSxhW2ZdPWVbMF0sYVtmKzFdPWVbMV0sYVtmKzJdPWVbMl19ZnVuY3Rpb24gaihhLGIsZCl7ZD1kfHxjLmNyZWF0ZSgpO3ZhciBlPWJbMF0sZj1iWzFdLGc9YlsyXTtyZXR1cm4gZFswXT1lKmFbMF0rZiphWzFdK2cqYVsyXSxkWzFdPWUqYVs0XStmKmFbNV0rZyphWzZdLGRbMl09ZSphWzhdK2YqYVs5XStnKmFbMTBdLGR9ZnVuY3Rpb24gayhhLGMpe3JldHVybiBpKGEsYyxiLnRyYW5zZm9ybURpcmVjdGlvbiksYX1mdW5jdGlvbiBsKGEsYyl7cmV0dXJuIGkoYSxiLmludmVyc2UoYyksaiksYX1mdW5jdGlvbiBtKGEsYyl7cmV0dXJuIGkoYSxjLGIudHJhbnNmb3JtUG9pbnQpLGF9ZnVuY3Rpb24gbihhLGIpe3JldHVybiBPYmplY3Qua2V5cyhhKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe3ZhciBkPWFbY107Yy5pbmRleE9mKFwicG9zXCIpPj0wP20oZCxiKTpjLmluZGV4T2YoXCJ0YW5cIik+PTB8fGMuaW5kZXhPZihcImJpbm9ybVwiKT49MD9rKGQsYik6Yy5pbmRleE9mKFwibm9ybVwiKT49MCYmbChkLGIpfSksYX1mdW5jdGlvbiBvKGEsYixjKXtyZXR1cm4gYT1hfHwyLGI9Ynx8MCxjPWN8fDAsYSo9LjUse3Bvc2l0aW9uOntudW1Db21wb25lbnRzOjIsZGF0YTpbYistMSphLGMrLTEqYSxiKzEqYSxjKy0xKmEsYistMSphLGMrMSphLGIrMSphLGMrMSphXX0sbm9ybWFsOlswLDAsMSwwLDAsMSwwLDAsMSwwLDAsMV0sdGV4Y29vcmQ6WzAsMCwxLDAsMCwxLDEsMV0saW5kaWNlczpbMCwxLDIsMiwxLDNdfX1mdW5jdGlvbiBwKGEsYyxkLGYsZyl7YT1hfHwxLGM9Y3x8MSxkPWR8fDEsZj1mfHwxLGc9Z3x8Yi5pZGVudGl0eSgpO2Zvcih2YXIgaD0oZCsxKSooZisxKSxpPWUoMyxoKSxqPWUoMyxoKSxrPWUoMixoKSxsPTA7Zj49bDtsKyspZm9yKHZhciBtPTA7ZD49bTttKyspe3ZhciBvPW0vZCxwPWwvZjtpLnB1c2goYSpvLS41KmEsMCxjKnAtLjUqYyksai5wdXNoKDAsMSwwKSxrLnB1c2gobyxwKX1mb3IodmFyIHE9ZCsxLHI9ZSgzLGQqZioyLFVpbnQxNkFycmF5KSxsPTA7Zj5sO2wrKylmb3IodmFyIG09MDtkPm07bSsrKXIucHVzaCgobCswKSpxK20sKGwrMSkqcSttLChsKzApKnErbSsxKSxyLnB1c2goKGwrMSkqcSttLChsKzEpKnErbSsxLChsKzApKnErbSsxKTt2YXIgcz1uKHtwb3NpdGlvbjppLG5vcm1hbDpqLHRleGNvb3JkOmssaW5kaWNlczpyfSxnKTtyZXR1cm4gc31mdW5jdGlvbiBxKGEsYixjLGQsZixnLGgpe2lmKDA+PWJ8fDA+PWMpdGhyb3cgRXJyb3IoXCJzdWJkaXZpc2lvbkF4aXMgYW5kIHN1YmRpdmlzaW9uSGVpZ2h0IG11c3QgYmUgPiAwXCIpO2Q9ZHx8MCxmPWZ8fE1hdGguUEksZz1nfHwwLGg9aHx8MipNYXRoLlBJO2Zvcih2YXIgaT1mLWQsaj1oLWcsaz0oYisxKSooYysxKSxsPWUoMyxrKSxtPWUoMyxrKSxuPWUoMixrKSxvPTA7Yz49bztvKyspZm9yKHZhciBwPTA7Yj49cDtwKyspe3ZhciBxPXAvYixyPW8vYyxzPWoqcSx0PWkqcix1PU1hdGguc2luKHMpLHY9TWF0aC5jb3Mocyksdz1NYXRoLnNpbih0KSx4PU1hdGguY29zKHQpLHk9dip3LHo9eCxBPXUqdztsLnB1c2goYSp5LGEqeixhKkEpLG0ucHVzaCh5LHosQSksbi5wdXNoKDEtcSxyKX1mb3IodmFyIEI9YisxLEM9ZSgzLGIqYyoyLFVpbnQxNkFycmF5KSxwPTA7Yj5wO3ArKylmb3IodmFyIG89MDtjPm87bysrKUMucHVzaCgobyswKSpCK3AsKG8rMCkqQitwKzEsKG8rMSkqQitwKSxDLnB1c2goKG8rMSkqQitwLChvKzApKkIrcCsxLChvKzEpKkIrcCsxKTtyZXR1cm57cG9zaXRpb246bCxub3JtYWw6bSx0ZXhjb29yZDpuLGluZGljZXM6Q319ZnVuY3Rpb24gcihhKXthPWF8fDE7Zm9yKHZhciBiPWEvMixjPVtbLWIsLWIsLWJdLFsrYiwtYiwtYl0sWy1iLCtiLC1iXSxbK2IsK2IsLWJdLFstYiwtYiwrYl0sWytiLC1iLCtiXSxbLWIsK2IsK2JdLFsrYiwrYiwrYl1dLGQ9W1sxLDAsMF0sWy0xLDAsMF0sWzAsMSwwXSxbMCwtMSwwXSxbMCwwLDFdLFswLDAsLTFdXSxmPVtbMSwwXSxbMCwwXSxbMCwxXSxbMSwxXV0sZz0yNCxoPWUoMyxnKSxpPWUoMyxnKSxqPWUoMixnKSxrPWUoMywxMixVaW50MTZBcnJheSksbD0wOzY+bDsrK2wpe1xuZm9yKHZhciBtPURbbF0sbj0wOzQ+bjsrK24pe3ZhciBvPWNbbVtuXV0scD1kW2xdLHE9ZltuXTtoLnB1c2gobyksaS5wdXNoKHApLGoucHVzaChxKX12YXIgcj00Kmw7ay5wdXNoKHIrMCxyKzEscisyKSxrLnB1c2gociswLHIrMixyKzMpfXJldHVybntwb3NpdGlvbjpoLG5vcm1hbDppLHRleGNvb3JkOmosaW5kaWNlczprfX1mdW5jdGlvbiBzKGEsYixjLGQsZixnLGgpe2lmKDM+ZCl0aHJvdyBFcnJvcihcInJhZGlhbFN1YmRpdmlzaW9ucyBtdXN0IGJlIDMgb3IgZ3JlYXRlclwiKTtpZigxPmYpdGhyb3cgRXJyb3IoXCJ2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBtdXN0IGJlIDEgb3IgZ3JlYXRlclwiKTtmb3IodmFyIGk9dm9pZCAwPT09Zz8hMDpnLGo9dm9pZCAwPT09aD8hMDpoLGs9KGk/MjowKSsoaj8yOjApLGw9KGQrMSkqKGYrMStrKSxtPWUoMyxsKSxuPWUoMyxsKSxvPWUoMixsKSxwPWUoMyxkKihmK2spKjIsVWludDE2QXJyYXkpLHE9ZCsxLHI9TWF0aC5hdGFuMihhLWIsYykscz1NYXRoLmNvcyhyKSx0PU1hdGguc2luKHIpLHU9aT8tMjowLHY9Zisoaj8yOjApLHc9dTt2Pj13Oysrdyl7dmFyIHgseT13L2Ysej1jKnk7MD53Pyh6PTAseT0xLHg9YSk6dz5mPyh6PWMseT0xLHg9Yik6eD1hKyhiLWEpKih3L2YpLCgtMj09PXd8fHc9PT1mKzIpJiYoeD0wLHk9MCksei09Yy8yO2Zvcih2YXIgQT0wO3E+QTsrK0Epe3ZhciBCPU1hdGguc2luKEEqTWF0aC5QSSoyL2QpLEM9TWF0aC5jb3MoQSpNYXRoLlBJKjIvZCk7bS5wdXNoKEIqeCx6LEMqeCksbi5wdXNoKDA+d3x8dz5mPzA6QipzLDA+dz8tMTp3PmY/MTp0LDA+d3x8dz5mPzA6QypzKSxvLnB1c2goQS9kLDEteSl9fWZvcih2YXIgdz0wO2Yraz53Oysrdylmb3IodmFyIEE9MDtkPkE7KytBKXAucHVzaChxKih3KzApKzArQSxxKih3KzApKzErQSxxKih3KzEpKzErQSkscC5wdXNoKHEqKHcrMCkrMCtBLHEqKHcrMSkrMStBLHEqKHcrMSkrMCtBKTtyZXR1cm57cG9zaXRpb246bSxub3JtYWw6bix0ZXhjb29yZDpvLGluZGljZXM6cH19ZnVuY3Rpb24gdChhLGIpe2I9Ynx8W107Zm9yKHZhciBjPVtdLGQ9MDtkPGEubGVuZ3RoO2QrPTQpe3ZhciBlPWFbZF0sZj1hLnNsaWNlKGQrMSxkKzQpO2YucHVzaC5hcHBseShmLGIpO2Zvcih2YXIgZz0wO2U+ZzsrK2cpYy5wdXNoLmFwcGx5KGMsZil9cmV0dXJuIGN9ZnVuY3Rpb24gdSgpe3ZhciBhPVswLDAsMCwwLDE1MCwwLDMwLDAsMCwwLDE1MCwwLDMwLDE1MCwwLDMwLDAsMCwzMCwwLDAsMzAsMzAsMCwxMDAsMCwwLDMwLDMwLDAsMTAwLDMwLDAsMTAwLDAsMCwzMCw2MCwwLDMwLDkwLDAsNjcsNjAsMCwzMCw5MCwwLDY3LDkwLDAsNjcsNjAsMCwwLDAsMzAsMzAsMCwzMCwwLDE1MCwzMCwwLDE1MCwzMCwzMCwwLDMwLDMwLDE1MCwzMCwzMCwwLDMwLDEwMCwwLDMwLDMwLDMwLDMwLDMwLDMwLDMwLDEwMCwwLDMwLDEwMCwzMCwzMCwzMCw2MCwzMCw2Nyw2MCwzMCwzMCw5MCwzMCwzMCw5MCwzMCw2Nyw2MCwzMCw2Nyw5MCwzMCwwLDAsMCwxMDAsMCwwLDEwMCwwLDMwLDAsMCwwLDEwMCwwLDMwLDAsMCwzMCwxMDAsMCwwLDEwMCwzMCwwLDEwMCwzMCwzMCwxMDAsMCwwLDEwMCwzMCwzMCwxMDAsMCwzMCwzMCwzMCwwLDMwLDMwLDMwLDEwMCwzMCwzMCwzMCwzMCwwLDEwMCwzMCwzMCwxMDAsMzAsMCwzMCwzMCwwLDMwLDYwLDMwLDMwLDMwLDMwLDMwLDMwLDAsMzAsNjAsMCwzMCw2MCwzMCwzMCw2MCwwLDY3LDYwLDMwLDMwLDYwLDMwLDMwLDYwLDAsNjcsNjAsMCw2Nyw2MCwzMCw2Nyw2MCwwLDY3LDkwLDMwLDY3LDYwLDMwLDY3LDYwLDAsNjcsOTAsMCw2Nyw5MCwzMCwzMCw5MCwwLDMwLDkwLDMwLDY3LDkwLDMwLDMwLDkwLDAsNjcsOTAsMzAsNjcsOTAsMCwzMCw5MCwwLDMwLDE1MCwzMCwzMCw5MCwzMCwzMCw5MCwwLDMwLDE1MCwwLDMwLDE1MCwzMCwwLDE1MCwwLDAsMTUwLDMwLDMwLDE1MCwzMCwwLDE1MCwwLDMwLDE1MCwzMCwzMCwxNTAsMCwwLDAsMCwwLDAsMzAsMCwxNTAsMzAsMCwwLDAsMCwxNTAsMzAsMCwxNTAsMF0sYj1bLjIyLC4xOSwuMjIsLjc5LC4zNCwuMTksLjIyLC43OSwuMzQsLjc5LC4zNCwuMTksLjM0LC4xOSwuMzQsLjMxLC42MiwuMTksLjM0LC4zMSwuNjIsLjMxLC42MiwuMTksLjM0LC40MywuMzQsLjU1LC40OSwuNDMsLjM0LC41NSwuNDksLjU1LC40OSwuNDMsMCwwLDEsMCwwLDEsMCwxLDEsMCwxLDEsMCwwLDEsMCwwLDEsMCwxLDEsMCwxLDEsMCwwLDEsMCwwLDEsMCwxLDEsMCwxLDEsMCwwLDEsMCwxLDEsMCwwLDEsMSwwLDEsMCwwLDEsMCwxLDEsMCwwLDEsMSwwLDEsMCwwLDAsMSwxLDEsMCwwLDEsMSwxLDAsMCwwLDEsMSwwLDEsMCwwLDEsMCwxLDEsMCwwLDEsMSwwLDEsMCwwLDEsMCwxLDEsMCwwLDEsMSwwLDEsMCwwLDEsMCwxLDEsMCwwLDAsMSwxLDEsMCwwLDEsMSwxLDAsMCwwLDEsMSwwLDEsMCwwLDEsMCwxLDEsMCwwLDAsMSwxLDEsMCwwLDEsMSwxLDAsMCwwLDAsMSwxLDEsMCwwLDEsMSwxLDBdLGM9dChbMTgsMCwwLDEsMTgsMCwwLC0xLDYsMCwxLDAsNiwxLDAsMCw2LDAsLTEsMCw2LDEsMCwwLDYsMCwxLDAsNiwxLDAsMCw2LDAsLTEsMCw2LDEsMCwwLDYsMCwtMSwwLDYsLTEsMCwwXSksZD10KFsxOCwyMDAsNzAsMTIwLDE4LDgwLDcwLDIwMCw2LDcwLDIwMCwyMTAsNiwyMDAsMjAwLDcwLDYsMjEwLDEwMCw3MCw2LDIxMCwxNjAsNzAsNiw3MCwxODAsMjEwLDYsMTAwLDcwLDIxMCw2LDc2LDIxMCwxMDAsNiwxNDAsMjEwLDgwLDYsOTAsMTMwLDExMCw2LDE2MCwxNjAsMjIwXSxbMjU1XSksZj1hLmxlbmd0aC8zLGc9e3Bvc2l0aW9uOmUoMyxmKSx0ZXhjb29yZDplKDIsZiksbm9ybWFsOmUoMyxmKSxjb2xvcjplKDQsZixVaW50OEFycmF5KSxpbmRpY2VzOmUoMyxmLzMsVWludDE2QXJyYXkpfTtnLnBvc2l0aW9uLnB1c2goYSksZy50ZXhjb29yZC5wdXNoKGIpLGcubm9ybWFsLnB1c2goYyksZy5jb2xvci5wdXNoKGQpO2Zvcih2YXIgaD0wO2Y+aDsrK2gpZy5pbmRpY2VzLnB1c2goaCk7cmV0dXJuIGd9ZnVuY3Rpb24gdihhLGIsZCxmLGcsaCxpKXtmdW5jdGlvbiBqKGEsYixjKXtyZXR1cm4gYSsoYi1hKSpjfWZ1bmN0aW9uIGsoYixkLGUsaSxrLGwpe2Zvcih2YXIgbz0wO2c+PW87bysrKXt2YXIgcz1kLyhtLTEpLHQ9by9nLHU9Mioocy0uNSksdj0oaCt0Km4pKk1hdGguUEksdz1NYXRoLnNpbih2KSx4PU1hdGguY29zKHYpLHk9aihhLGIsdyksej11KmYsQT14KmEsQj13Knk7cC5wdXNoKHosQSxCKTt2YXIgQz1jLmFkZChjLm11bHRpcGx5KFswLHcseF0sZSksaSk7cS5wdXNoKEMpLHIucHVzaChzKmsrbCx0KX19ZnVuY3Rpb24gbChhLGIpe2Zvcih2YXIgYz0wO2c+YzsrK2MpdS5wdXNoKGErYyswLGErYysxLGIrYyswKSx1LnB1c2goYStjKzEsYitjKzEsYitjKzApfWlmKDA+PWcpdGhyb3cgRXJyb3IoXCJzdWJkaXZpc2lvbkRvd24gbXVzdCBiZSA+IDBcIik7aD1ofHwwLGk9aXx8MTtmb3IodmFyIG09MixuPWktaCxvPTIqKGcrMSkqKDIrbSkscD1lKDMsbykscT1lKDMsbykscj1lKDIsbykscz0wO20+cztzKyspe3ZhciB0PTIqKHMvKG0tMSktLjUpO2soYixzLFsxLDEsMV0sWzAsMCwwXSwxLDApLGsoYixzLFswLDAsMF0sW3QsMCwwXSwwLDApLGsoZCxzLFsxLDEsMV0sWzAsMCwwXSwxLDApLGsoZCxzLFswLDAsMF0sW3QsMCwwXSwwLDEpfXZhciB1PWUoMywyKmcqKDIrbSksVWludDE2QXJyYXkpLHY9ZysxO3JldHVybiBsKDAqdiw0KnYpLGwoNSp2LDcqdiksbCg2KnYsMip2KSxsKDMqdiwxKnYpLHtwb3NpdGlvbjpwLG5vcm1hbDpxLHRleGNvb3JkOnIsaW5kaWNlczp1fX1mdW5jdGlvbiB3KGEsYixjLGQsZSxmKXtyZXR1cm4gcyhhLGEsYixjLGQsZSxmKX1mdW5jdGlvbiB4KGEsYixjLGQsZixnKXtpZigzPmMpdGhyb3cgRXJyb3IoXCJyYWRpYWxTdWJkaXZpc2lvbnMgbXVzdCBiZSAzIG9yIGdyZWF0ZXJcIik7aWYoMz5kKXRocm93IEVycm9yKFwidmVydGljYWxTdWJkaXZpc2lvbnMgbXVzdCBiZSAzIG9yIGdyZWF0ZXJcIik7Zj1mfHwwLGc9Z3x8MipNYXRoLlBJLHJhbmdlPWctZjtmb3IodmFyIGg9YysxLGk9ZCsxLGo9aCppLGs9ZSgzLGopLGw9ZSgzLGopLG09ZSgyLGopLG49ZSgzLGMqZCoyLFVpbnQxNkFycmF5KSxvPTA7aT5vOysrbylmb3IodmFyIHA9by9kLHE9cCpNYXRoLlBJKjIscj1NYXRoLnNpbihxKSxzPWErcipiLHQ9TWF0aC5jb3MocSksdT10KmIsdj0wO2g+djsrK3Ype3ZhciB3PXYvYyx4PWYrdypyYW5nZSx5PU1hdGguc2luKHgpLHo9TWF0aC5jb3MoeCksQT15KnMsQj16KnMsQz15KnIsRD16KnI7ay5wdXNoKEEsdSxCKSxsLnB1c2goQyx0LEQpLG0ucHVzaCh3LDEtcCl9Zm9yKHZhciBvPTA7ZD5vOysrbylmb3IodmFyIHY9MDtjPnY7Kyt2KXt2YXIgRT0xK3YsRj0xK287bi5wdXNoKGgqbyt2LGgqRit2LGgqbytFKSxuLnB1c2goaCpGK3YsaCpGK0UsaCpvK0UpfXJldHVybntwb3NpdGlvbjprLG5vcm1hbDpsLHRleGNvb3JkOm0saW5kaWNlczpufX1mdW5jdGlvbiB5KGEsYixjLGQsZil7aWYoMz5iKXRocm93IEVycm9yKFwiZGl2aXNpb25zIG11c3QgYmUgYXQgbGVhc3QgM1wiKTtjPWM/YzoxLGY9Zj9mOjEsZD1kP2Q6MDtmb3IodmFyIGc9KGIrMSkqKGMrMSksaD1lKDMsZyksaT1lKDMsZyksaj1lKDIsZyksaz1lKDMsYypiKjIsVWludDE2QXJyYXkpLGw9MCxtPWEtZCxuPTA7Yz49bjsrK24pe2Zvcih2YXIgbz1kK20qTWF0aC5wb3cobi9jLGYpLHA9MDtiPj1wOysrcCl7dmFyIHE9MipNYXRoLlBJKnAvYixyPW8qTWF0aC5jb3MocSkscz1vKk1hdGguc2luKHEpO2lmKGgucHVzaChyLDAscyksaS5wdXNoKDAsMSwwKSxqLnB1c2goMS1wL2Isbi9jKSxuPjAmJnAhPT1iKXt2YXIgdD1sKyhwKzEpLHU9bCtwLHY9bCtwLWIsdz1sKyhwKzEpLWI7ay5wdXNoKHQsdSx2KSxrLnB1c2godCx2LHcpfX1sKz1iKzF9cmV0dXJue3Bvc2l0aW9uOmgsbm9ybWFsOmksdGV4Y29vcmQ6aixpbmRpY2VzOmt9fWZ1bmN0aW9uIHooYSl7cmV0dXJuIE1hdGgucmFuZG9tKCkqYXwwfWZ1bmN0aW9uIEEoYSxiKXtiPWJ8fHt9O3ZhciBjPWEucG9zaXRpb24ubnVtRWxlbWVudHMsZD1lKDQsYyxVaW50OEFycmF5KSxmPWIucmFuZHx8ZnVuY3Rpb24oYSxiKXtyZXR1cm4gMz5iP3ooMjU2KToyNTV9O2lmKGEuY29sb3I9ZCxhLmluZGljZXMpZm9yKHZhciBnPTA7Yz5nOysrZylkLnB1c2goZihnLDApLGYoZywxKSxmKGcsMiksZihnLDMpKTtlbHNlIGZvcih2YXIgaD1iLnZlcnRzUGVyQ29sb3J8fDMsaT1jL2gsZz0wO2k+ZzsrK2cpZm9yKHZhciBqPVtmKGcsMCksZihnLDEpLGYoZywyKSxmKGcsMyldLGs9MDtoPms7KytrKWQucHVzaChqKTtyZXR1cm4gYX1mdW5jdGlvbiBCKGIpe3JldHVybiBmdW5jdGlvbihjKXt2YXIgZD1iLmFwcGx5KHRoaXMsQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpKTtyZXR1cm4gYS5jcmVhdGVCdWZmZXJzRnJvbUFycmF5cyhjLGQpfX1mdW5jdGlvbiBDKGIpe3JldHVybiBmdW5jdGlvbihjKXt2YXIgZD1iLmFwcGx5KG51bGwsQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpKTtyZXR1cm4gYS5jcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhjLGQpfX12YXIgRD1bWzMsNyw1LDFdLFs2LDIsMCw0XSxbNiw3LDMsMl0sWzAsMSw1LDRdLFs3LDYsNCw1XSxbMiwzLDEsMF1dO3JldHVybntjcmVhdGUzREZCdWZmZXJJbmZvOkModSksY3JlYXRlM0RGQnVmZmVyczpCKHUpLGNyZWF0ZTNERlZlcnRpY2VzOnUsY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheTplLGNyZWF0ZUN1YmVCdWZmZXJJbmZvOkMociksY3JlYXRlQ3ViZUJ1ZmZlcnM6QihyKSxjcmVhdGVDdWJlVmVydGljZXM6cixjcmVhdGVQbGFuZUJ1ZmZlckluZm86QyhwKSxjcmVhdGVQbGFuZUJ1ZmZlcnM6QihwKSxjcmVhdGVQbGFuZVZlcnRpY2VzOnAsY3JlYXRlU3BoZXJlQnVmZmVySW5mbzpDKHEpLGNyZWF0ZVNwaGVyZUJ1ZmZlcnM6QihxKSxjcmVhdGVTcGhlcmVWZXJ0aWNlczpxLGNyZWF0ZVRydW5jYXRlZENvbmVCdWZmZXJJbmZvOkMocyksY3JlYXRlVHJ1bmNhdGVkQ29uZUJ1ZmZlcnM6QihzKSxjcmVhdGVUcnVuY2F0ZWRDb25lVmVydGljZXM6cyxjcmVhdGVYWVF1YWRCdWZmZXJJbmZvOkMobyksY3JlYXRlWFlRdWFkQnVmZmVyczpCKG8pLGNyZWF0ZVhZUXVhZFZlcnRpY2VzOm8sY3JlYXRlQ3Jlc2VudEJ1ZmZlckluZm86Qyh2KSxjcmVhdGVDcmVzZW50QnVmZmVyczpCKHYpLGNyZWF0ZUNyZXNlbnRWZXJ0aWNlczp2LGNyZWF0ZUN5bGluZGVyQnVmZmVySW5mbzpDKHcpLGNyZWF0ZUN5bGluZGVyQnVmZmVyczpCKHcpLGNyZWF0ZUN5bGluZGVyVmVydGljZXM6dyxjcmVhdGVUb3J1c0J1ZmZlckluZm86Qyh4KSxjcmVhdGVUb3J1c0J1ZmZlcnM6Qih4KSxjcmVhdGVUb3J1c1ZlcnRpY2VzOngsY3JlYXRlRGlzY0J1ZmZlckluZm86Qyh5KSxjcmVhdGVEaXNjQnVmZmVyczpCKHkpLGNyZWF0ZURpc2NWZXJ0aWNlczp5LGRlaW5kZXhWZXJ0aWNlczpnLGZsYXR0ZW5Ob3JtYWxzOmgsbWFrZVJhbmRvbVZlcnRleENvbG9yczpBLHJlb3JpZW50RGlyZWN0aW9uczprLHJlb3JpZW50Tm9ybWFsczpsLHJlb3JpZW50UG9zaXRpb25zOm0scmVvcmllbnRWZXJ0aWNlczpufX0pLGMoXCJtYWluXCIsW1widHdnbC90d2dsXCIsXCJ0d2dsL200XCIsXCJ0d2dsL3YzXCIsXCJ0d2dsL3ByaW1pdGl2ZXNcIl0sZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIGEubTQ9YixhLnYzPWMsYS5wcmltaXRpdmVzPWQsYX0pLGIoW1wibWFpblwiXSxmdW5jdGlvbihhKXtyZXR1cm4gYX0sdm9pZCAwLCEwKSxjKFwiYnVpbGQvanMvdHdnbC1pbmNsdWRlci1mdWxsXCIsZnVuY3Rpb24oKXt9KSxiKFwibWFpblwiKX0pOyIsIm1vZHVsZS5leHBvcnRzLm11bE1hdHJpeE1hdHJpeDQgPSBmdW5jdGlvbihhLCBiLCBkc3QpIHtcbiAgdmFyIGEwMCA9IGFbMF07XG4gIHZhciBhMDEgPSBhWzFdO1xuICB2YXIgYTAyID0gYVsyXTtcbiAgdmFyIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWyA0ICsgMF07XG4gIHZhciBhMTEgPSBhWyA0ICsgMV07XG4gIHZhciBhMTIgPSBhWyA0ICsgMl07XG4gIHZhciBhMTMgPSBhWyA0ICsgM107XG4gIHZhciBhMjAgPSBhWyA4ICsgMF07XG4gIHZhciBhMjEgPSBhWyA4ICsgMV07XG4gIHZhciBhMjIgPSBhWyA4ICsgMl07XG4gIHZhciBhMjMgPSBhWyA4ICsgM107XG4gIHZhciBhMzAgPSBhWzEyICsgMF07XG4gIHZhciBhMzEgPSBhWzEyICsgMV07XG4gIHZhciBhMzIgPSBhWzEyICsgMl07XG4gIHZhciBhMzMgPSBhWzEyICsgM107XG4gIHZhciBiMDAgPSBiWzBdO1xuICB2YXIgYjAxID0gYlsxXTtcbiAgdmFyIGIwMiA9IGJbMl07XG4gIHZhciBiMDMgPSBiWzNdO1xuICB2YXIgYjEwID0gYlsgNCArIDBdO1xuICB2YXIgYjExID0gYlsgNCArIDFdO1xuICB2YXIgYjEyID0gYlsgNCArIDJdO1xuICB2YXIgYjEzID0gYlsgNCArIDNdO1xuICB2YXIgYjIwID0gYlsgOCArIDBdO1xuICB2YXIgYjIxID0gYlsgOCArIDFdO1xuICB2YXIgYjIyID0gYlsgOCArIDJdO1xuICB2YXIgYjIzID0gYlsgOCArIDNdO1xuICB2YXIgYjMwID0gYlsxMiArIDBdO1xuICB2YXIgYjMxID0gYlsxMiArIDFdO1xuICB2YXIgYjMyID0gYlsxMiArIDJdO1xuICB2YXIgYjMzID0gYlsxMiArIDNdO1xuICBkc3RbIDBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyICsgYTMwICogYjAzO1xuICBkc3RbIDFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyICsgYTMxICogYjAzO1xuICBkc3RbIDJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyICsgYTMyICogYjAzO1xuICBkc3RbIDNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyICsgYTMzICogYjAzO1xuICBkc3RbIDRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyICsgYTMwICogYjEzO1xuICBkc3RbIDVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyICsgYTMxICogYjEzO1xuICBkc3RbIDZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyICsgYTMyICogYjEzO1xuICBkc3RbIDddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyICsgYTMzICogYjEzO1xuICBkc3RbIDhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyICsgYTMwICogYjIzO1xuICBkc3RbIDldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyICsgYTMxICogYjIzO1xuICBkc3RbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyICsgYTMyICogYjIzO1xuICBkc3RbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyICsgYTMzICogYjIzO1xuICBkc3RbMTJdID0gYTAwICogYjMwICsgYTEwICogYjMxICsgYTIwICogYjMyICsgYTMwICogYjMzO1xuICBkc3RbMTNdID0gYTAxICogYjMwICsgYTExICogYjMxICsgYTIxICogYjMyICsgYTMxICogYjMzO1xuICBkc3RbMTRdID0gYTAyICogYjMwICsgYTEyICogYjMxICsgYTIyICogYjMyICsgYTMyICogYjMzO1xuICBkc3RbMTVdID0gYTAzICogYjMwICsgYTEzICogYjMxICsgYTIzICogYjMyICsgYTMzICogYjMzO1xuICByZXR1cm4gZHN0O1xufTsiLCJcbmZ1bmN0aW9uIEF0dHJpYnV0ZShuYW1lLCBtYXgsIG51bUNvbXBvbmVudHMsIGVsZW1lbnRzUGVyUG9seSwgYnVmZmVyVHlwZSwgc2V0RWxlbWVudHMpIHtcbiAgdGhpcy5uYW1lICAgICAgICAgICAgPSBuYW1lXG4gIHRoaXMubWF4ICAgICAgICAgICAgID0gbWF4XG4gIHRoaXMubnVtQ29tcG9uZW50cyAgID0gbnVtQ29tcG9uZW50c1xuICB0aGlzLmVsZW1lbnRzUGVyUG9seSA9IGVsZW1lbnRzUGVyUG9seVxuICB0aGlzLmJ1ZmZlclR5cGUgICAgICA9IGJ1ZmZlclR5cGVcbiAgdGhpcy5kaXJ0eSAgICAgICAgICAgPSBmYWxzZVxuICB0aGlzLmJ1ZmZlciAgICAgICAgICA9IHRoaXMuY3JlYXRlQnVmZmVyKClcbiAgdGhpcy5zZXRFbGVtZW50cyAgICAgPSBzZXRFbGVtZW50c1xufVxuXG5BdHRyaWJ1dGUucHJvdG90eXBlLmdldEJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHsgZGF0YSA6IHRoaXMuYnVmZmVyLCBudW1Db21wb25lbnRzIDogdGhpcy5udW1Db21wb25lbnRzfVxufVxuXG5BdHRyaWJ1dGUucHJvdG90eXBlLmNyZWF0ZUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHR5cGUgPSB3aW5kb3dbdGhpcy5idWZmZXJUeXBlXTtcbiAgcmV0dXJuIG5ldyB0eXBlKHRoaXMubnVtQ29tcG9uZW50cyAqIHRoaXMuZWxlbWVudHNQZXJQb2x5ICogdGhpcy5tYXgpO1xufVxuXG5BdHRyaWJ1dGUucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oYiwgaW5kZXgpe1xuICBmb3IodmFyIGk9MDsgaTxiLmxlbmd0aDsgaSsrKXtcbiAgICB0aGlzLmJ1ZmZlcltpK2luZGV4XSA9IGJbaV1cbiAgfVxuICB0aGlzLmRpcnR5ID0gdHJ1ZVxufVxuXG5BdHRyaWJ1dGUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLm51bUNvbXBvbmVudHMgKiB0aGlzLmVsZW1lbnRzUGVyUG9seVxuICBmb3IodmFyIGk9MDsgaTxsZW5ndGg7IGkrKyl7XG4gICAgdGhpcy5idWZmZXJbaSArIGluZGV4ICogbGVuZ3RoXSA9IHZhbHVlXG4gIH1cbiAgdGhpcy5kaXJ0eSA9IHRydWVcbn1cblxuQXR0cmlidXRlLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKGdsLCBnZW9tZXRyeSkge1xuICAvLyBnZW9tZXRyeS5idWZmZXJzW3RoaXMubmFtZV0uc2V0KHRoaXMuYnVmZmVyLCBnbC5EWU5BTUlDX0RSQVcpXG4gIGdlb21ldHJ5LnNldEJ1ZmZlcih0aGlzLm5hbWUsIHRoaXMuYnVmZmVyLCBnbC5EWU5BTUlDX0RSQVcpXG4gIHRoaXMuZGlydHkgPSBmYWxzZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dHJpYnV0ZSIsInZhciB1dGlsICAgICAgPSByZXF1aXJlKCd1dGlsJylcbnZhciBTbG90TGlzdCAgPSByZXF1aXJlKCcuL3Nsb3RsaXN0JylcbnZhciBPd25lckxpc3QgPSByZXF1aXJlKCcuL293bmVybGlzdCcpXG5cblxuZnVuY3Rpb24gQWxsb2NhdGlvbihtYXgpIHtcbiAgdGhpcy5zbG90cyAgPSBuZXcgU2xvdExpc3QobWF4KTtcbiAgdGhpcy5vd25lcnMgPSBuZXcgT3duZXJMaXN0KCk7XG4gIFxuICB0aGlzLm1lbWJlcnMgID0gW107XG4gIHRoaXMuaW5kZXhlcyAgPSB7fTtcbiAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKVxufVxuICBcblxuQWxsb2NhdGlvbi5uZXh0SWQgPSAwLFxuQWxsb2NhdGlvbi5kZWFsbG9jYXRlID0gZnVuY3Rpb24gKG8pIHtcbiAgdmFyIGFsID0gby5hbCwgXG4gICAgICBpZCA9IG8uaWQsIFxuICAgICAgaXRlbXMgPSBvLml0ZW1zLCBcbiAgICAgIGwgPSBpdGVtcy5sZW5ndGg7XG5cbiAgZm9yKHZhciBpPTA7aTxsO2krKylcbiAgICBhbC5yZW1vdmUoaXRlbXNbaV0sIGlkKTtcbn1cblxuQWxsb2NhdGlvbi5wcm90b3R5cGUubWF4U2xvdHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnNsb3RzLm1heDtcbn1cblxuQWxsb2NhdGlvbi5wcm90b3R5cGUuY2FuQWNjb21tb2RhdGUgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgdmFyIGV4Y2VzcyA9IGl0ZW1zLmxlbmd0aCAtIHRoaXMuc2xvdHMudmFjYW5jaWVzKCk7XG4gIGlmIChleGNlc3MgPD0gMClcbiAgICByZXR1cm4gdHJ1ZTtcbiAgZm9yICh2YXIgaT0wOyBpPGl0ZW1zLmxlbmd0aCAmJiBleGNlc3MgPiAwOyBpKyspIHtcbiAgICBpZiAodGhpcy5oYXNJdGVtKGl0ZW1zW2ldKSkge1xuICAgICAgZXhjZXNzLS07XG4gICAgfVxuICB9XG4gIHJldHVybiBleGNlc3MgPD0gMDtcbn1cblxuQWxsb2NhdGlvbi5wcm90b3R5cGUuaGFzSXRlbSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHJldHVybiBpdGVtLmlkIGluIHRoaXMuaW5kZXhlcztcbn1cblxuQWxsb2NhdGlvbi5wcm90b3R5cGUuaW5kZXhGb3IgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGlmICghKGl0ZW0uaWQgaW4gdGhpcy5pbmRleGVzKSlcbiAgICB0aHJvdyBpdGVtLmlkICsgXCIgbm90IGFsbG9jYXRlZFwiO1xuICByZXR1cm4gdGhpcy5pbmRleGVzW2l0ZW0uaWRdO1xufVxuXG5BbGxvY2F0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbSwgb3duZXIsIGZuKSB7XG4gIHZhciBpbmRleDtcbiAgaWYgKHRoaXMuaGFzSXRlbShpdGVtKSkge1xuICAgIGluZGV4ID0gdGhpcy5pbmRleEZvcihpdGVtKTtcbiAgfSBlbHNlIHtcbiAgICBpbmRleCA9IHRoaXMuc2xvdHMuY3VycmVudCgpO1xuICAgIHRoaXMubWVtYmVyc1tpbmRleF0gPSBpdGVtO1xuICAgIHRoaXMuaW5kZXhlc1tpdGVtLmlkXSA9IGluZGV4O1xuICAgIHRoaXMuc2xvdHMuaW5jcmVtZW50KCk7XG4gICAgdGhpcy53cml0ZShpbmRleCwgZm4oKSk7XG4gICAgaXRlbS5vbiAmJiBpdGVtLm9uKCdjaGFuZ2UnLCB0aGlzLm9uQ2hhbmdlKVxuICB9XG4gIHRoaXMub3duZXJzLmFkZChpbmRleCwgb3duZXIpO1xuICByZXR1cm4gaW5kZXg7XG59XG5cbkFsbG9jYXRpb24ucHJvdG90eXBlLm9uQ2hhbmdlID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgaWYgKCFpc05hTih0aGlzLmluZGV4ZXNbaXRlbS5pZF0pKVxuICAgIHRoaXMud3JpdGUodGhpcy5pbmRleGVzW2l0ZW0uaWRdLCBpdGVtLmdldFZhbHVlKCkpO1xufVxuXG5BbGxvY2F0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoaXRlbSwgb3duZXIpIHtcbiAgaWYgKHRoaXMuaGFzSXRlbShpdGVtKSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXhGb3IoaXRlbSk7XG4gICAgaWYgKHRoaXMub3duZXJzLnJlbW92ZShpbmRleCwgb3duZXIpKXtcbiAgICAgIGRlbGV0ZSB0aGlzLm1lbWJlcnNbaW5kZXhdO1xuICAgICAgZGVsZXRlIHRoaXMuaW5kZXhlc1tpdGVtLmlkXTtcbiAgICAgIGl0ZW0ub2ZmICYmIGl0ZW0ub2ZmKCdjaGFuZ2UnLCB0aGlzLm9uQ2hhbmdlKVxuICAgICAgdGhpcy5zbG90cy5kZWNyZW1lbnQoaW5kZXgpO1xuICAgIH1cbiAgfVxufVxuXG5BbGxvY2F0aW9uLnByb3RvdHlwZS5hbGxvY2F0ZSA9IGZ1bmN0aW9uIChpdGVtcykge1xuICBpdGVtcyA9IGl0ZW1zLnNsaWNlKCk7XG4gIHZhciBtZSA9IHRoaXM7XG4gIHZhciBpZCA9IEFsbG9jYXRpb24ubmV4dElkICsrO1xuICAkLmVhY2goaXRlbXMsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgbWUuYWRkKGl0ZW0sIGlkKTtcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgYWwgICAgOiB0aGlzLFxuICAgIGl0ZW1zIDogaXRlbXMsXG4gICAgaWQgICAgOiBpZFxuICB9O1xufVxuXG52YXIgRmxvYXRBbGxvY2F0aW9uID0gQWxsb2NhdGlvbi5GbG9hdCA9IGZ1bmN0aW9uIChtYXgsIG51bUNvbXBvbmVudHMpIHtcbiAgQWxsb2NhdGlvbi5jYWxsKHRoaXMsIG1heClcbiAgdGhpcy5udW1Db21wb25lbnRzICAgPSBudW1Db21wb25lbnRzXG4gIHRoaXMuYnVmZmVyICAgICAgICAgID0gbmV3IEZsb2F0MzJBcnJheShudW1Db21wb25lbnRzICogbWF4KTtcbn1cbnV0aWwuaW5oZXJpdHMoRmxvYXRBbGxvY2F0aW9uLCBBbGxvY2F0aW9uKVxuXG5cbkZsb2F0QWxsb2NhdGlvbi5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihpbmRleCwgYil7XG4gIGluZGV4ID0gaW5kZXggKiB0aGlzLm51bUNvbXBvbmVudHNcbiAgZm9yKHZhciBpPTA7IGk8Yi5sZW5ndGg7IGkrKyl7XG4gICAgdGhpcy5idWZmZXJbaSArIGluZGV4XSA9IGJbaV1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsbG9jYXRpb24iLCJmdW5jdGlvbiBTbG90TGlzdChtYXgpIHtcbiAgdGhpcy5tYXggICAgICAgICA9IG1heDtcbiAgdGhpcy5jb3VudCAgICAgICA9IDA7XG4gIHRoaXMubmV4dCAgICAgICAgPSAwO1xuICB0aGlzLmF2YWlsYWJsZSAgID0gW107XG59XG5cblNsb3RMaXN0LnByb3RvdHlwZS5jdXJyZW50ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hdmFpbGFibGUubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXZhaWxhYmxlWzBdO1xuICB9XG4gIHJldHVybiB0aGlzLm5leHQ7XG59XG5cblNsb3RMaXN0LnByb3RvdHlwZS5pbmNyZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmF2YWlsYWJsZS5sZW5ndGgpIHtcbiAgICB0aGlzLmF2YWlsYWJsZS5zaGlmdCgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubmV4dCArKztcbiAgfVxuICB0aGlzLmNvdW50ICsrO1xufVxuXG5TbG90TGlzdC5wcm90b3R5cGUuZGVjcmVtZW50ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIHRoaXMuYXZhaWxhYmxlLnB1c2goaW5kZXgpO1xuICB0aGlzLmNvdW50IC0tO1xufVxuXG5TbG90TGlzdC5wcm90b3R5cGUudmFjYW5jaWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5hdmFpbGFibGUubGVuZ3RoICsgdGhpcy5tYXggLSB0aGlzLmNvdW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNsb3RMaXN0IiwiZnVuY3Rpb24gT3duZXJMaXN0KCkge1xuICB0aGlzLmRhdGEgPSB7fTtcbn1cblxuT3duZXJMaXN0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoaXRlbSwgb3duZXIpIHtcbiAgdmFyIGQgPSB0aGlzLmRhdGE7XG4gIGlmKCFkW2l0ZW1dKVxuICAgICBkW2l0ZW1dID0ge2NvdW50OjAsIG93bmVyczp7fX07XG4gICBkW2l0ZW1dLm93bmVyc1tvd25lcl09b3duZXI7XG4gICBkW2l0ZW1dLmNvdW50Kys7XG59XG5cbk93bmVyTGlzdC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGl0ZW0sIG93bmVyKSB7XG4gIHZhciBkID0gdGhpcy5kYXRhO1xuICBpZihkW2l0ZW1dICYmIGRbaXRlbV0ub3duZXJzW293bmVyXSkge1xuICAgIGRlbGV0ZSBkW2l0ZW1dLm93bmVyc1tvd25lcl07XG4gICAgZFtpdGVtXS5jb3VudCAtLTtcbiAgICByZXR1cm4gZFtpdGVtXS5jb3VudCA8IDE7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3duZXJMaXN0IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aWNtOTNjMlZ5YVdaNUwyNXZaR1ZmYlc5a2RXeGxjeTkxZEdsc0wzVjBhV3d1YW5NaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaTh2SUVOdmNIbHlhV2RvZENCS2IzbGxiblFzSUVsdVl5NGdZVzVrSUc5MGFHVnlJRTV2WkdVZ1kyOXVkSEpwWW5WMGIzSnpMbHh1THk5Y2JpOHZJRkJsY20xcGMzTnBiMjRnYVhNZ2FHVnlaV0o1SUdkeVlXNTBaV1FzSUdaeVpXVWdiMllnWTJoaGNtZGxMQ0IwYnlCaGJua2djR1Z5YzI5dUlHOWlkR0ZwYm1sdVp5QmhYRzR2THlCamIzQjVJRzltSUhSb2FYTWdjMjltZEhkaGNtVWdZVzVrSUdGemMyOWphV0YwWldRZ1pHOWpkVzFsYm5SaGRHbHZiaUJtYVd4bGN5QW9kR2hsWEc0dkx5QmNJbE52Wm5SM1lYSmxYQ0lwTENCMGJ5QmtaV0ZzSUdsdUlIUm9aU0JUYjJaMGQyRnlaU0IzYVhSb2IzVjBJSEpsYzNSeWFXTjBhVzl1TENCcGJtTnNkV1JwYm1kY2JpOHZJSGRwZEdodmRYUWdiR2x0YVhSaGRHbHZiaUIwYUdVZ2NtbG5hSFJ6SUhSdklIVnpaU3dnWTI5d2VTd2diVzlrYVdaNUxDQnRaWEpuWlN3Z2NIVmliR2x6YUN4Y2JpOHZJR1JwYzNSeWFXSjFkR1VzSUhOMVlteHBZMlZ1YzJVc0lHRnVaQzl2Y2lCelpXeHNJR052Y0dsbGN5QnZaaUIwYUdVZ1UyOW1kSGRoY21Vc0lHRnVaQ0IwYnlCd1pYSnRhWFJjYmk4dklIQmxjbk52Ym5NZ2RHOGdkMmh2YlNCMGFHVWdVMjltZEhkaGNtVWdhWE1nWm5WeWJtbHphR1ZrSUhSdklHUnZJSE52TENCemRXSnFaV04wSUhSdklIUm9aVnh1THk4Z1ptOXNiRzkzYVc1bklHTnZibVJwZEdsdmJuTTZYRzR2TDF4dUx5OGdWR2hsSUdGaWIzWmxJR052Y0hseWFXZG9kQ0J1YjNScFkyVWdZVzVrSUhSb2FYTWdjR1Z5YldsemMybHZiaUJ1YjNScFkyVWdjMmhoYkd3Z1ltVWdhVzVqYkhWa1pXUmNiaTh2SUdsdUlHRnNiQ0JqYjNCcFpYTWdiM0lnYzNWaWMzUmhiblJwWVd3Z2NHOXlkR2x2Ym5NZ2IyWWdkR2hsSUZOdlpuUjNZWEpsTGx4dUx5OWNiaTh2SUZSSVJTQlRUMFpVVjBGU1JTQkpVeUJRVWs5V1NVUkZSQ0JjSWtGVElFbFRYQ0lzSUZkSlZFaFBWVlFnVjBGU1VrRk9WRmtnVDBZZ1FVNVpJRXRKVGtRc0lFVllVRkpGVTFOY2JpOHZJRTlTSUVsTlVFeEpSVVFzSUVsT1EweFZSRWxPUnlCQ1ZWUWdUazlVSUV4SlRVbFVSVVFnVkU4Z1ZFaEZJRmRCVWxKQlRsUkpSVk1nVDBaY2JpOHZJRTFGVWtOSVFVNVVRVUpKVEVsVVdTd2dSa2xVVGtWVFV5QkdUMUlnUVNCUVFWSlVTVU5WVEVGU0lGQlZVbEJQVTBVZ1FVNUVJRTVQVGtsT1JsSkpUa2RGVFVWT1ZDNGdTVTVjYmk4dklFNVBJRVZXUlU1VUlGTklRVXhNSUZSSVJTQkJWVlJJVDFKVElFOVNJRU5QVUZsU1NVZElWQ0JJVDB4RVJWSlRJRUpGSUV4SlFVSk1SU0JHVDFJZ1FVNVpJRU5NUVVsTkxGeHVMeThnUkVGTlFVZEZVeUJQVWlCUFZFaEZVaUJNU1VGQ1NVeEpWRmtzSUZkSVJWUklSVklnU1U0Z1FVNGdRVU5VU1U5T0lFOUdJRU5QVGxSU1FVTlVMQ0JVVDFKVUlFOVNYRzR2THlCUFZFaEZVbGRKVTBVc0lFRlNTVk5KVGtjZ1JsSlBUU3dnVDFWVUlFOUdJRTlTSUVsT0lFTlBUazVGUTFSSlQwNGdWMGxVU0NCVVNFVWdVMDlHVkZkQlVrVWdUMUlnVkVoRlhHNHZMeUJWVTBVZ1QxSWdUMVJJUlZJZ1JFVkJURWxPUjFNZ1NVNGdWRWhGSUZOUFJsUlhRVkpGTGx4dVhHNTJZWElnWm05eWJXRjBVbVZuUlhod0lEMGdMeVZiYzJScUpWMHZaenRjYm1WNGNHOXlkSE11Wm05eWJXRjBJRDBnWm5WdVkzUnBiMjRvWmlrZ2UxeHVJQ0JwWmlBb0lXbHpVM1J5YVc1bktHWXBLU0I3WEc0Z0lDQWdkbUZ5SUc5aWFtVmpkSE1nUFNCYlhUdGNiaUFnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJQ0FnYjJKcVpXTjBjeTV3ZFhOb0tHbHVjM0JsWTNRb1lYSm5kVzFsYm5SelcybGRLU2s3WEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCdlltcGxZM1J6TG1wdmFXNG9KeUFuS1R0Y2JpQWdmVnh1WEc0Z0lIWmhjaUJwSUQwZ01UdGNiaUFnZG1GeUlHRnlaM01nUFNCaGNtZDFiV1Z1ZEhNN1hHNGdJSFpoY2lCc1pXNGdQU0JoY21kekxteGxibWQwYUR0Y2JpQWdkbUZ5SUhOMGNpQTlJRk4wY21sdVp5aG1LUzV5WlhCc1lXTmxLR1p2Y20xaGRGSmxaMFY0Y0N3Z1puVnVZM1JwYjI0b2VDa2dlMXh1SUNBZ0lHbG1JQ2g0SUQwOVBTQW5KU1VuS1NCeVpYUjFjbTRnSnlVbk8xeHVJQ0FnSUdsbUlDaHBJRDQ5SUd4bGJpa2djbVYwZFhKdUlIZzdYRzRnSUNBZ2MzZHBkR05vSUNoNEtTQjdYRzRnSUNBZ0lDQmpZWE5sSUNjbGN5YzZJSEpsZEhWeWJpQlRkSEpwYm1jb1lYSm5jMXRwS3l0ZEtUdGNiaUFnSUNBZ0lHTmhjMlVnSnlWa0p6b2djbVYwZFhKdUlFNTFiV0psY2loaGNtZHpXMmtySzEwcE8xeHVJQ0FnSUNBZ1kyRnpaU0FuSldvbk9seHVJQ0FnSUNBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCS1UwOU9Mbk4wY21sdVoybG1lU2hoY21kelcya3JLMTBwTzF4dUlDQWdJQ0FnSUNCOUlHTmhkR05vSUNoZktTQjdYRzRnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2RiUTJseVkzVnNZWEpkSnp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhnN1hHNGdJQ0FnZlZ4dUlDQjlLVHRjYmlBZ1ptOXlJQ2gyWVhJZ2VDQTlJR0Z5WjNOYmFWMDdJR2tnUENCc1pXNDdJSGdnUFNCaGNtZHpXeXNyYVYwcElIdGNiaUFnSUNCcFppQW9hWE5PZFd4c0tIZ3BJSHg4SUNGcGMwOWlhbVZqZENoNEtTa2dlMXh1SUNBZ0lDQWdjM1J5SUNzOUlDY2dKeUFySUhnN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSE4wY2lBclBTQW5JQ2NnS3lCcGJuTndaV04wS0hncE8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNCeVpYUjFjbTRnYzNSeU8xeHVmVHRjYmx4dVhHNHZMeUJOWVhKcklIUm9ZWFFnWVNCdFpYUm9iMlFnYzJodmRXeGtJRzV2ZENCaVpTQjFjMlZrTGx4dUx5OGdVbVYwZFhKdWN5QmhJRzF2WkdsbWFXVmtJR1oxYm1OMGFXOXVJSGRvYVdOb0lIZGhjbTV6SUc5dVkyVWdZbmtnWkdWbVlYVnNkQzVjYmk4dklFbG1JQzB0Ym04dFpHVndjbVZqWVhScGIyNGdhWE1nYzJWMExDQjBhR1Z1SUdsMElHbHpJR0VnYm04dGIzQXVYRzVsZUhCdmNuUnpMbVJsY0hKbFkyRjBaU0E5SUdaMWJtTjBhVzl1S0dadUxDQnRjMmNwSUh0Y2JpQWdMeThnUVd4c2IzY2dabTl5SUdSbGNISmxZMkYwYVc1bklIUm9hVzVuY3lCcGJpQjBhR1VnY0hKdlkyVnpjeUJ2WmlCemRHRnlkR2x1WnlCMWNDNWNiaUFnYVdZZ0tHbHpWVzVrWldacGJtVmtLR2RzYjJKaGJDNXdjbTlqWlhOektTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCbGVIQnZjblJ6TG1SbGNISmxZMkYwWlNobWJpd2diWE5uS1M1aGNIQnNlU2gwYUdsekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lIMDdYRzRnSUgxY2JseHVJQ0JwWmlBb2NISnZZMlZ6Y3k1dWIwUmxjSEpsWTJGMGFXOXVJRDA5UFNCMGNuVmxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHWnVPMXh1SUNCOVhHNWNiaUFnZG1GeUlIZGhjbTVsWkNBOUlHWmhiSE5sTzF4dUlDQm1kVzVqZEdsdmJpQmtaWEJ5WldOaGRHVmtLQ2tnZTF4dUlDQWdJR2xtSUNnaGQyRnlibVZrS1NCN1hHNGdJQ0FnSUNCcFppQW9jSEp2WTJWemN5NTBhSEp2ZDBSbGNISmxZMkYwYVc5dUtTQjdYRzRnSUNBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpaHRjMmNwTzF4dUlDQWdJQ0FnZlNCbGJITmxJR2xtSUNod2NtOWpaWE56TG5SeVlXTmxSR1Z3Y21WallYUnBiMjRwSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1MGNtRmpaU2h0YzJjcE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1bGNuSnZjaWh0YzJjcE8xeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2QyRnlibVZrSUQwZ2RISjFaVHRjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1SUdadUxtRndjR3g1S0hSb2FYTXNJR0Z5WjNWdFpXNTBjeWs3WEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnWkdWd2NtVmpZWFJsWkR0Y2JuMDdYRzVjYmx4dWRtRnlJR1JsWW5WbmN5QTlJSHQ5TzF4dWRtRnlJR1JsWW5WblJXNTJhWEp2Ymp0Y2JtVjRjRzl5ZEhNdVpHVmlkV2RzYjJjZ1BTQm1kVzVqZEdsdmJpaHpaWFFwSUh0Y2JpQWdhV1lnS0dselZXNWtaV1pwYm1Wa0tHUmxZblZuUlc1MmFYSnZiaWtwWEc0Z0lDQWdaR1ZpZFdkRmJuWnBjbTl1SUQwZ2NISnZZMlZ6Y3k1bGJuWXVUazlFUlY5RVJVSlZSeUI4ZkNBbkp6dGNiaUFnYzJWMElEMGdjMlYwTG5SdlZYQndaWEpEWVhObEtDazdYRzRnSUdsbUlDZ2haR1ZpZFdkelczTmxkRjBwSUh0Y2JpQWdJQ0JwWmlBb2JtVjNJRkpsWjBWNGNDZ25YRnhjWEdJbklDc2djMlYwSUNzZ0oxeGNYRnhpSnl3Z0oya25LUzUwWlhOMEtHUmxZblZuUlc1MmFYSnZiaWtwSUh0Y2JpQWdJQ0FnSUhaaGNpQndhV1FnUFNCd2NtOWpaWE56TG5CcFpEdGNiaUFnSUNBZ0lHUmxZblZuYzF0elpYUmRJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ0YzJjZ1BTQmxlSEJ2Y25SekxtWnZjbTFoZEM1aGNIQnNlU2hsZUhCdmNuUnpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLQ2NsY3lBbFpEb2dKWE1uTENCelpYUXNJSEJwWkN3Z2JYTm5LVHRjYmlBZ0lDQWdJSDA3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lHUmxZblZuYzF0elpYUmRJRDBnWm5WdVkzUnBiMjRvS1NCN2ZUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUdSbFluVm5jMXR6WlhSZE8xeHVmVHRjYmx4dVhHNHZLaXBjYmlBcUlFVmphRzl6SUhSb1pTQjJZV3gxWlNCdlppQmhJSFpoYkhWbExpQlVjbmx6SUhSdklIQnlhVzUwSUhSb1pTQjJZV3gxWlNCdmRYUmNiaUFxSUdsdUlIUm9aU0JpWlhOMElIZGhlU0J3YjNOemFXSnNaU0JuYVhabGJpQjBhR1VnWkdsbVptVnlaVzUwSUhSNWNHVnpMbHh1SUNwY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbW9nVkdobElHOWlhbVZqZENCMGJ5QndjbWx1ZENCdmRYUXVYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnYjNCMGN5QlBjSFJwYjI1aGJDQnZjSFJwYjI1eklHOWlhbVZqZENCMGFHRjBJR0ZzZEdWeWN5QjBhR1VnYjNWMGNIVjBMbHh1SUNvdlhHNHZLaUJzWldkaFkzazZJRzlpYWl3Z2MyaHZkMGhwWkdSbGJpd2daR1Z3ZEdnc0lHTnZiRzl5Y3lvdlhHNW1kVzVqZEdsdmJpQnBibk53WldOMEtHOWlhaXdnYjNCMGN5a2dlMXh1SUNBdkx5QmtaV1poZFd4MElHOXdkR2x2Ym5OY2JpQWdkbUZ5SUdOMGVDQTlJSHRjYmlBZ0lDQnpaV1Z1T2lCYlhTeGNiaUFnSUNCemRIbHNhWHBsT2lCemRIbHNhWHBsVG05RGIyeHZjbHh1SUNCOU8xeHVJQ0F2THlCc1pXZGhZM2t1TGk1Y2JpQWdhV1lnS0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnUGowZ015a2dZM1I0TG1SbGNIUm9JRDBnWVhKbmRXMWxiblJ6V3pKZE8xeHVJQ0JwWmlBb1lYSm5kVzFsYm5SekxteGxibWQwYUNBK1BTQTBLU0JqZEhndVkyOXNiM0p6SUQwZ1lYSm5kVzFsYm5Seld6TmRPMXh1SUNCcFppQW9hWE5DYjI5c1pXRnVLRzl3ZEhNcEtTQjdYRzRnSUNBZ0x5OGdiR1ZuWVdONUxpNHVYRzRnSUNBZ1kzUjRMbk5vYjNkSWFXUmtaVzRnUFNCdmNIUnpPMXh1SUNCOUlHVnNjMlVnYVdZZ0tHOXdkSE1wSUh0Y2JpQWdJQ0F2THlCbmIzUWdZVzRnWENKdmNIUnBiMjV6WENJZ2IySnFaV04wWEc0Z0lDQWdaWGh3YjNKMGN5NWZaWGgwWlc1a0tHTjBlQ3dnYjNCMGN5azdYRzRnSUgxY2JpQWdMeThnYzJWMElHUmxabUYxYkhRZ2IzQjBhVzl1YzF4dUlDQnBaaUFvYVhOVmJtUmxabWx1WldRb1kzUjRMbk5vYjNkSWFXUmtaVzRwS1NCamRIZ3VjMmh2ZDBocFpHUmxiaUE5SUdaaGJITmxPMXh1SUNCcFppQW9hWE5WYm1SbFptbHVaV1FvWTNSNExtUmxjSFJvS1NrZ1kzUjRMbVJsY0hSb0lEMGdNanRjYmlBZ2FXWWdLR2x6Vlc1a1pXWnBibVZrS0dOMGVDNWpiMnh2Y25NcEtTQmpkSGd1WTI5c2IzSnpJRDBnWm1Gc2MyVTdYRzRnSUdsbUlDaHBjMVZ1WkdWbWFXNWxaQ2hqZEhndVkzVnpkRzl0U1c1emNHVmpkQ2twSUdOMGVDNWpkWE4wYjIxSmJuTndaV04wSUQwZ2RISjFaVHRjYmlBZ2FXWWdLR04wZUM1amIyeHZjbk1wSUdOMGVDNXpkSGxzYVhwbElEMGdjM1I1YkdsNlpWZHBkR2hEYjJ4dmNqdGNiaUFnY21WMGRYSnVJR1p2Y20xaGRGWmhiSFZsS0dOMGVDd2diMkpxTENCamRIZ3VaR1Z3ZEdncE8xeHVmVnh1Wlhod2IzSjBjeTVwYm5Od1pXTjBJRDBnYVc1emNHVmpkRHRjYmx4dVhHNHZMeUJvZEhSd09pOHZaVzR1ZDJscmFYQmxaR2xoTG05eVp5OTNhV3RwTDBGT1UwbGZaWE5qWVhCbFgyTnZaR1VqWjNKaGNHaHBZM05jYm1sdWMzQmxZM1F1WTI5c2IzSnpJRDBnZTF4dUlDQW5ZbTlzWkNjZ09pQmJNU3dnTWpKZExGeHVJQ0FuYVhSaGJHbGpKeUE2SUZzekxDQXlNMTBzWEc0Z0lDZDFibVJsY214cGJtVW5JRG9nV3pRc0lESTBYU3hjYmlBZ0oybHVkbVZ5YzJVbklEb2dXemNzSURJM1hTeGNiaUFnSjNkb2FYUmxKeUE2SUZzek55d2dNemxkTEZ4dUlDQW5aM0psZVNjZ09pQmJPVEFzSURNNVhTeGNiaUFnSjJKc1lXTnJKeUE2SUZzek1Dd2dNemxkTEZ4dUlDQW5ZbXgxWlNjZ09pQmJNelFzSURNNVhTeGNiaUFnSjJONVlXNG5JRG9nV3pNMkxDQXpPVjBzWEc0Z0lDZG5jbVZsYmljZ09pQmJNeklzSURNNVhTeGNiaUFnSjIxaFoyVnVkR0VuSURvZ1d6TTFMQ0F6T1Ywc1hHNGdJQ2R5WldRbklEb2dXek14TENBek9WMHNYRzRnSUNkNVpXeHNiM2NuSURvZ1d6TXpMQ0F6T1YxY2JuMDdYRzVjYmk4dklFUnZiaWQwSUhWelpTQW5ZbXgxWlNjZ2JtOTBJSFpwYzJsaWJHVWdiMjRnWTIxa0xtVjRaVnh1YVc1emNHVmpkQzV6ZEhsc1pYTWdQU0I3WEc0Z0lDZHpjR1ZqYVdGc0p6b2dKMk41WVc0bkxGeHVJQ0FuYm5WdFltVnlKem9nSjNsbGJHeHZkeWNzWEc0Z0lDZGliMjlzWldGdUp6b2dKM2xsYkd4dmR5Y3NYRzRnSUNkMWJtUmxabWx1WldRbk9pQW5aM0psZVNjc1hHNGdJQ2R1ZFd4c0p6b2dKMkp2YkdRbkxGeHVJQ0FuYzNSeWFXNW5Kem9nSjJkeVpXVnVKeXhjYmlBZ0oyUmhkR1VuT2lBbmJXRm5aVzUwWVNjc1hHNGdJQzh2SUZ3aWJtRnRaVndpT2lCcGJuUmxiblJwYjI1aGJHeDVJRzV2ZENCemRIbHNhVzVuWEc0Z0lDZHlaV2RsZUhBbk9pQW5jbVZrSjF4dWZUdGNibHh1WEc1bWRXNWpkR2x2YmlCemRIbHNhWHBsVjJsMGFFTnZiRzl5S0hOMGNpd2djM1I1YkdWVWVYQmxLU0I3WEc0Z0lIWmhjaUJ6ZEhsc1pTQTlJR2x1YzNCbFkzUXVjM1I1YkdWelczTjBlV3hsVkhsd1pWMDdYRzVjYmlBZ2FXWWdLSE4wZVd4bEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUNkY1hIVXdNREZpV3ljZ0t5QnBibk53WldOMExtTnZiRzl5YzF0emRIbHNaVjFiTUYwZ0t5QW5iU2NnS3lCemRISWdLMXh1SUNBZ0lDQWdJQ0FnSUNBblhGeDFNREF4WWxzbklDc2dhVzV6Y0dWamRDNWpiMnh2Y25OYmMzUjViR1ZkV3pGZElDc2dKMjBuTzF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUhKbGRIVnliaUJ6ZEhJN1hHNGdJSDFjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJ6ZEhsc2FYcGxUbTlEYjJ4dmNpaHpkSElzSUhOMGVXeGxWSGx3WlNrZ2UxeHVJQ0J5WlhSMWNtNGdjM1J5TzF4dWZWeHVYRzVjYm1aMWJtTjBhVzl1SUdGeWNtRjVWRzlJWVhOb0tHRnljbUY1S1NCN1hHNGdJSFpoY2lCb1lYTm9JRDBnZTMwN1hHNWNiaUFnWVhKeVlYa3VabTl5UldGamFDaG1kVzVqZEdsdmJpaDJZV3dzSUdsa2VDa2dlMXh1SUNBZ0lHaGhjMmhiZG1Gc1hTQTlJSFJ5ZFdVN1hHNGdJSDBwTzF4dVhHNGdJSEpsZEhWeWJpQm9ZWE5vTzF4dWZWeHVYRzVjYm1aMWJtTjBhVzl1SUdadmNtMWhkRlpoYkhWbEtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3lrZ2UxeHVJQ0F2THlCUWNtOTJhV1JsSUdFZ2FHOXZheUJtYjNJZ2RYTmxjaTF6Y0dWamFXWnBaV1FnYVc1emNHVmpkQ0JtZFc1amRHbHZibk11WEc0Z0lDOHZJRU5vWldOcklIUm9ZWFFnZG1Gc2RXVWdhWE1nWVc0Z2IySnFaV04wSUhkcGRHZ2dZVzRnYVc1emNHVmpkQ0JtZFc1amRHbHZiaUJ2YmlCcGRGeHVJQ0JwWmlBb1kzUjRMbU4xYzNSdmJVbHVjM0JsWTNRZ0ppWmNiaUFnSUNBZ0lIWmhiSFZsSUNZbVhHNGdJQ0FnSUNCcGMwWjFibU4wYVc5dUtIWmhiSFZsTG1sdWMzQmxZM1FwSUNZbVhHNGdJQ0FnSUNBdkx5QkdhV3gwWlhJZ2IzVjBJSFJvWlNCMWRHbHNJRzF2WkhWc1pTd2dhWFFuY3lCcGJuTndaV04wSUdaMWJtTjBhVzl1SUdseklITndaV05wWVd4Y2JpQWdJQ0FnSUhaaGJIVmxMbWx1YzNCbFkzUWdJVDA5SUdWNGNHOXlkSE11YVc1emNHVmpkQ0FtSmx4dUlDQWdJQ0FnTHk4Z1FXeHpieUJtYVd4MFpYSWdiM1YwSUdGdWVTQndjbTkwYjNSNWNHVWdiMkpxWldOMGN5QjFjMmx1WnlCMGFHVWdZMmx5WTNWc1lYSWdZMmhsWTJzdVhHNGdJQ0FnSUNBaEtIWmhiSFZsTG1OdmJuTjBjblZqZEc5eUlDWW1JSFpoYkhWbExtTnZibk4wY25WamRHOXlMbkJ5YjNSdmRIbHdaU0E5UFQwZ2RtRnNkV1VwS1NCN1hHNGdJQ0FnZG1GeUlISmxkQ0E5SUhaaGJIVmxMbWx1YzNCbFkzUW9jbVZqZFhKelpWUnBiV1Z6TENCamRIZ3BPMXh1SUNBZ0lHbG1JQ2doYVhOVGRISnBibWNvY21WMEtTa2dlMXh1SUNBZ0lDQWdjbVYwSUQwZ1ptOXliV0YwVm1Gc2RXVW9ZM1I0TENCeVpYUXNJSEpsWTNWeWMyVlVhVzFsY3lrN1hHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQnlaWFE3WEc0Z0lIMWNibHh1SUNBdkx5QlFjbWx0YVhScGRtVWdkSGx3WlhNZ1kyRnVibTkwSUdoaGRtVWdjSEp2Y0dWeWRHbGxjMXh1SUNCMllYSWdjSEpwYldsMGFYWmxJRDBnWm05eWJXRjBVSEpwYldsMGFYWmxLR04wZUN3Z2RtRnNkV1VwTzF4dUlDQnBaaUFvY0hKcGJXbDBhWFpsS1NCN1hHNGdJQ0FnY21WMGRYSnVJSEJ5YVcxcGRHbDJaVHRjYmlBZ2ZWeHVYRzRnSUM4dklFeHZiMnNnZFhBZ2RHaGxJR3RsZVhNZ2IyWWdkR2hsSUc5aWFtVmpkQzVjYmlBZ2RtRnlJR3RsZVhNZ1BTQlBZbXBsWTNRdWEyVjVjeWgyWVd4MVpTazdYRzRnSUhaaGNpQjJhWE5wWW14bFMyVjVjeUE5SUdGeWNtRjVWRzlJWVhOb0tHdGxlWE1wTzF4dVhHNGdJR2xtSUNoamRIZ3VjMmh2ZDBocFpHUmxiaWtnZTF4dUlDQWdJR3RsZVhNZ1BTQlBZbXBsWTNRdVoyVjBUM2R1VUhKdmNHVnlkSGxPWVcxbGN5aDJZV3gxWlNrN1hHNGdJSDFjYmx4dUlDQXZMeUJKUlNCa2IyVnpiaWQwSUcxaGEyVWdaWEp5YjNJZ1ptbGxiR1J6SUc1dmJpMWxiblZ0WlhKaFlteGxYRzRnSUM4dklHaDBkSEE2THk5dGMyUnVMbTFwWTNKdmMyOW1kQzVqYjIwdlpXNHRkWE12YkdsaWNtRnllUzlwWlM5a2QzYzFNbk5pZENoMlBYWnpMamswS1M1aGMzQjRYRzRnSUdsbUlDaHBjMFZ5Y205eUtIWmhiSFZsS1Z4dUlDQWdJQ0FnSmlZZ0tHdGxlWE11YVc1a1pYaFBaaWduYldWemMyRm5aU2NwSUQ0OUlEQWdmSHdnYTJWNWN5NXBibVJsZUU5bUtDZGtaWE5qY21sd2RHbHZiaWNwSUQ0OUlEQXBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHWnZjbTFoZEVWeWNtOXlLSFpoYkhWbEtUdGNiaUFnZlZ4dVhHNGdJQzh2SUZOdmJXVWdkSGx3WlNCdlppQnZZbXBsWTNRZ2QybDBhRzkxZENCd2NtOXdaWEowYVdWeklHTmhiaUJpWlNCemFHOXlkR04xZEhSbFpDNWNiaUFnYVdZZ0tHdGxlWE11YkdWdVozUm9JRDA5UFNBd0tTQjdYRzRnSUNBZ2FXWWdLR2x6Um5WdVkzUnBiMjRvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdJQ0IyWVhJZ2JtRnRaU0E5SUhaaGJIVmxMbTVoYldVZ1B5QW5PaUFuSUNzZ2RtRnNkV1V1Ym1GdFpTQTZJQ2NuTzF4dUlDQWdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NkYlJuVnVZM1JwYjI0bklDc2dibUZ0WlNBcklDZGRKeXdnSjNOd1pXTnBZV3duS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0dselVtVm5SWGh3S0haaGJIVmxLU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0ZKbFowVjRjQzV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWN1WTJGc2JDaDJZV3gxWlNrc0lDZHlaV2RsZUhBbktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHbHpSR0YwWlNoMllXeDFaU2twSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNoRVlYUmxMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaeTVqWVd4c0tIWmhiSFZsS1N3Z0oyUmhkR1VuS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0dselJYSnliM0lvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdabTl5YldGMFJYSnliM0lvZG1Gc2RXVXBPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJSFpoY2lCaVlYTmxJRDBnSnljc0lHRnljbUY1SUQwZ1ptRnNjMlVzSUdKeVlXTmxjeUE5SUZzbmV5Y3NJQ2Q5SjEwN1hHNWNiaUFnTHk4Z1RXRnJaU0JCY25KaGVTQnpZWGtnZEdoaGRDQjBhR1Y1SUdGeVpTQkJjbkpoZVZ4dUlDQnBaaUFvYVhOQmNuSmhlU2gyWVd4MVpTa3BJSHRjYmlBZ0lDQmhjbkpoZVNBOUlIUnlkV1U3WEc0Z0lDQWdZbkpoWTJWeklEMGdXeWRiSnl3Z0oxMG5YVHRjYmlBZ2ZWeHVYRzRnSUM4dklFMWhhMlVnWm5WdVkzUnBiMjV6SUhOaGVTQjBhR0YwSUhSb1pYa2dZWEpsSUdaMWJtTjBhVzl1YzF4dUlDQnBaaUFvYVhOR2RXNWpkR2x2YmloMllXeDFaU2twSUh0Y2JpQWdJQ0IyWVhJZ2JpQTlJSFpoYkhWbExtNWhiV1VnUHlBbk9pQW5JQ3NnZG1Gc2RXVXVibUZ0WlNBNklDY25PMXh1SUNBZ0lHSmhjMlVnUFNBbklGdEdkVzVqZEdsdmJpY2dLeUJ1SUNzZ0oxMG5PMXh1SUNCOVhHNWNiaUFnTHk4Z1RXRnJaU0JTWldkRmVIQnpJSE5oZVNCMGFHRjBJSFJvWlhrZ1lYSmxJRkpsWjBWNGNITmNiaUFnYVdZZ0tHbHpVbVZuUlhod0tIWmhiSFZsS1NrZ2UxeHVJQ0FnSUdKaGMyVWdQU0FuSUNjZ0t5QlNaV2RGZUhBdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBPMXh1SUNCOVhHNWNiaUFnTHk4Z1RXRnJaU0JrWVhSbGN5QjNhWFJvSUhCeWIzQmxjblJwWlhNZ1ptbHljM1FnYzJGNUlIUm9aU0JrWVhSbFhHNGdJR2xtSUNocGMwUmhkR1VvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdZbUZ6WlNBOUlDY2dKeUFySUVSaGRHVXVjSEp2ZEc5MGVYQmxMblJ2VlZSRFUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcE8xeHVJQ0I5WEc1Y2JpQWdMeThnVFdGclpTQmxjbkp2Y2lCM2FYUm9JRzFsYzNOaFoyVWdabWx5YzNRZ2MyRjVJSFJvWlNCbGNuSnZjbHh1SUNCcFppQW9hWE5GY25KdmNpaDJZV3gxWlNrcElIdGNiaUFnSUNCaVlYTmxJRDBnSnlBbklDc2dabTl5YldGMFJYSnliM0lvZG1Gc2RXVXBPMXh1SUNCOVhHNWNiaUFnYVdZZ0tHdGxlWE11YkdWdVozUm9JRDA5UFNBd0lDWW1JQ2doWVhKeVlYa2dmSHdnZG1Gc2RXVXViR1Z1WjNSb0lEMDlJREFwS1NCN1hHNGdJQ0FnY21WMGRYSnVJR0p5WVdObGMxc3dYU0FySUdKaGMyVWdLeUJpY21GalpYTmJNVjA3WEc0Z0lIMWNibHh1SUNCcFppQW9jbVZqZFhKelpWUnBiV1Z6SUR3Z01Da2dlMXh1SUNBZ0lHbG1JQ2hwYzFKbFowVjRjQ2gyWVd4MVpTa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2hTWldkRmVIQXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwTENBbmNtVm5aWGh3SnlrN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2duVzA5aWFtVmpkRjBuTENBbmMzQmxZMmxoYkNjcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lHTjBlQzV6WldWdUxuQjFjMmdvZG1Gc2RXVXBPMXh1WEc0Z0lIWmhjaUJ2ZFhSd2RYUTdYRzRnSUdsbUlDaGhjbkpoZVNrZ2UxeHVJQ0FnSUc5MWRIQjFkQ0E5SUdadmNtMWhkRUZ5Y21GNUtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3l3Z2RtbHphV0pzWlV0bGVYTXNJR3RsZVhNcE8xeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHOTFkSEIxZENBOUlHdGxlWE11YldGd0tHWjFibU4wYVc5dUtHdGxlU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR1p2Y20xaGRGQnliM0JsY25SNUtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3l3Z2RtbHphV0pzWlV0bGVYTXNJR3RsZVN3Z1lYSnlZWGtwTzF4dUlDQWdJSDBwTzF4dUlDQjlYRzVjYmlBZ1kzUjRMbk5sWlc0dWNHOXdLQ2s3WEc1Y2JpQWdjbVYwZFhKdUlISmxaSFZqWlZSdlUybHVaMnhsVTNSeWFXNW5LRzkxZEhCMWRDd2dZbUZ6WlN3Z1luSmhZMlZ6S1R0Y2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCbWIzSnRZWFJRY21sdGFYUnBkbVVvWTNSNExDQjJZV3gxWlNrZ2UxeHVJQ0JwWmlBb2FYTlZibVJsWm1sdVpXUW9kbUZzZFdVcEtWeHVJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNnbmRXNWtaV1pwYm1Wa0p5d2dKM1Z1WkdWbWFXNWxaQ2NwTzF4dUlDQnBaaUFvYVhOVGRISnBibWNvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdkbUZ5SUhOcGJYQnNaU0E5SUNkY1hDY25JQ3NnU2xOUFRpNXpkSEpwYm1kcFpua29kbUZzZFdVcExuSmxjR3hoWTJVb0wxNWNJbnhjSWlRdlp5d2dKeWNwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdWNtVndiR0ZqWlNndkp5OW5MQ0JjSWx4Y1hGd25YQ0lwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdWNtVndiR0ZqWlNndlhGeGNYRndpTDJjc0lDZGNJaWNwSUNzZ0oxeGNKeWM3WEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLSE5wYlhCc1pTd2dKM04wY21sdVp5Y3BPMXh1SUNCOVhHNGdJR2xtSUNocGMwNTFiV0psY2loMllXeDFaU2twWEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2NuSUNzZ2RtRnNkV1VzSUNkdWRXMWlaWEluS1R0Y2JpQWdhV1lnS0dselFtOXZiR1ZoYmloMllXeDFaU2twWEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2NuSUNzZ2RtRnNkV1VzSUNkaWIyOXNaV0Z1SnlrN1hHNGdJQzh2SUVadmNpQnpiMjFsSUhKbFlYTnZiaUIwZVhCbGIyWWdiblZzYkNCcGN5QmNJbTlpYW1WamRGd2lMQ0J6YnlCemNHVmphV0ZzSUdOaGMyVWdhR1Z5WlM1Y2JpQWdhV1lnS0dselRuVnNiQ2gyWVd4MVpTa3BYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDZHVkV3hzSnl3Z0oyNTFiR3duS1R0Y2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCbWIzSnRZWFJGY25KdmNpaDJZV3gxWlNrZ2UxeHVJQ0J5WlhSMWNtNGdKMXNuSUNzZ1JYSnliM0l1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcElDc2dKMTBuTzF4dWZWeHVYRzVjYm1aMWJtTjBhVzl1SUdadmNtMWhkRUZ5Y21GNUtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3l3Z2RtbHphV0pzWlV0bGVYTXNJR3RsZVhNcElIdGNiaUFnZG1GeUlHOTFkSEIxZENBOUlGdGRPMXh1SUNCbWIzSWdLSFpoY2lCcElEMGdNQ3dnYkNBOUlIWmhiSFZsTG14bGJtZDBhRHNnYVNBOElHdzdJQ3NyYVNrZ2UxeHVJQ0FnSUdsbUlDaG9ZWE5QZDI1UWNtOXdaWEowZVNoMllXeDFaU3dnVTNSeWFXNW5LR2twS1NrZ2UxeHVJQ0FnSUNBZ2IzVjBjSFYwTG5CMWMyZ29abTl5YldGMFVISnZjR1Z5ZEhrb1kzUjRMQ0IyWVd4MVpTd2djbVZqZFhKelpWUnBiV1Z6TENCMmFYTnBZbXhsUzJWNWN5eGNiaUFnSUNBZ0lDQWdJQ0JUZEhKcGJtY29hU2tzSUhSeWRXVXBLVHRjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2IzVjBjSFYwTG5CMWMyZ29KeWNwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0JyWlhsekxtWnZja1ZoWTJnb1puVnVZM1JwYjI0b2EyVjVLU0I3WEc0Z0lDQWdhV1lnS0NGclpYa3ViV0YwWTJnb0wxNWNYR1FySkM4cEtTQjdYRzRnSUNBZ0lDQnZkWFJ3ZFhRdWNIVnphQ2htYjNKdFlYUlFjbTl3WlhKMGVTaGpkSGdzSUhaaGJIVmxMQ0J5WldOMWNuTmxWR2x0WlhNc0lIWnBjMmxpYkdWTFpYbHpMRnh1SUNBZ0lDQWdJQ0FnSUd0bGVTd2dkSEoxWlNrcE8xeHVJQ0FnSUgxY2JpQWdmU2s3WEc0Z0lISmxkSFZ5YmlCdmRYUndkWFE3WEc1OVhHNWNibHh1Wm5WdVkzUnBiMjRnWm05eWJXRjBVSEp2Y0dWeWRIa29ZM1I0TENCMllXeDFaU3dnY21WamRYSnpaVlJwYldWekxDQjJhWE5wWW14bFMyVjVjeXdnYTJWNUxDQmhjbkpoZVNrZ2UxeHVJQ0IyWVhJZ2JtRnRaU3dnYzNSeUxDQmtaWE5qTzF4dUlDQmtaWE5qSUQwZ1QySnFaV04wTG1kbGRFOTNibEJ5YjNCbGNuUjVSR1Z6WTNKcGNIUnZjaWgyWVd4MVpTd2dhMlY1S1NCOGZDQjdJSFpoYkhWbE9pQjJZV3gxWlZ0clpYbGRJSDA3WEc0Z0lHbG1JQ2hrWlhOakxtZGxkQ2tnZTF4dUlDQWdJR2xtSUNoa1pYTmpMbk5sZENrZ2UxeHVJQ0FnSUNBZ2MzUnlJRDBnWTNSNExuTjBlV3hwZW1Vb0oxdEhaWFIwWlhJdlUyVjBkR1Z5WFNjc0lDZHpjR1ZqYVdGc0p5azdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhOMGNpQTlJR04wZUM1emRIbHNhWHBsS0NkYlIyVjBkR1Z5WFNjc0lDZHpjR1ZqYVdGc0p5azdYRzRnSUNBZ2ZWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHbG1JQ2hrWlhOakxuTmxkQ2tnZTF4dUlDQWdJQ0FnYzNSeUlEMGdZM1I0TG5OMGVXeHBlbVVvSjF0VFpYUjBaWEpkSnl3Z0ozTndaV05wWVd3bktUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2FXWWdLQ0ZvWVhOUGQyNVFjbTl3WlhKMGVTaDJhWE5wWW14bFMyVjVjeXdnYTJWNUtTa2dlMXh1SUNBZ0lHNWhiV1VnUFNBbld5Y2dLeUJyWlhrZ0t5QW5YU2M3WEc0Z0lIMWNiaUFnYVdZZ0tDRnpkSElwSUh0Y2JpQWdJQ0JwWmlBb1kzUjRMbk5sWlc0dWFXNWtaWGhQWmloa1pYTmpMblpoYkhWbEtTQThJREFwSUh0Y2JpQWdJQ0FnSUdsbUlDaHBjMDUxYkd3b2NtVmpkWEp6WlZScGJXVnpLU2tnZTF4dUlDQWdJQ0FnSUNCemRISWdQU0JtYjNKdFlYUldZV3gxWlNoamRIZ3NJR1JsYzJNdWRtRnNkV1VzSUc1MWJHd3BPMXh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdjM1J5SUQwZ1ptOXliV0YwVm1Gc2RXVW9ZM1I0TENCa1pYTmpMblpoYkhWbExDQnlaV04xY25ObFZHbHRaWE1nTFNBeEtUdGNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lHbG1JQ2h6ZEhJdWFXNWtaWGhQWmlnblhGeHVKeWtnUGlBdE1Ta2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb1lYSnlZWGtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQnpkSElnUFNCemRISXVjM0JzYVhRb0oxeGNiaWNwTG0xaGNDaG1kVzVqZEdsdmJpaHNhVzVsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdKeUFnSnlBcklHeHBibVU3WEc0Z0lDQWdJQ0FnSUNBZ2ZTa3VhbTlwYmlnblhGeHVKeWt1YzNWaWMzUnlLRElwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lITjBjaUE5SUNkY1hHNG5JQ3NnYzNSeUxuTndiR2wwS0NkY1hHNG5LUzV0WVhBb1puVnVZM1JwYjI0b2JHbHVaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlDY2dJQ0FuSUNzZ2JHbHVaVHRjYmlBZ0lDQWdJQ0FnSUNCOUtTNXFiMmx1S0NkY1hHNG5LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQnpkSElnUFNCamRIZ3VjM1I1YkdsNlpTZ25XME5wY21OMWJHRnlYU2NzSUNkemNHVmphV0ZzSnlrN1hHNGdJQ0FnZlZ4dUlDQjlYRzRnSUdsbUlDaHBjMVZ1WkdWbWFXNWxaQ2h1WVcxbEtTa2dlMXh1SUNBZ0lHbG1JQ2hoY25KaGVTQW1KaUJyWlhrdWJXRjBZMmdvTDE1Y1hHUXJKQzhwS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnYzNSeU8xeHVJQ0FnSUgxY2JpQWdJQ0J1WVcxbElEMGdTbE5QVGk1emRISnBibWRwWm5rb0p5Y2dLeUJyWlhrcE8xeHVJQ0FnSUdsbUlDaHVZVzFsTG0xaGRHTm9LQzllWENJb1cyRXRla0V0V2w5ZFcyRXRla0V0V2w4d0xUbGRLaWxjSWlRdktTa2dlMXh1SUNBZ0lDQWdibUZ0WlNBOUlHNWhiV1V1YzNWaWMzUnlLREVzSUc1aGJXVXViR1Z1WjNSb0lDMGdNaWs3WEc0Z0lDQWdJQ0J1WVcxbElEMGdZM1I0TG5OMGVXeHBlbVVvYm1GdFpTd2dKMjVoYldVbktUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYm1GdFpTQTlJRzVoYldVdWNtVndiR0ZqWlNndkp5OW5MQ0JjSWx4Y1hGd25YQ0lwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUM1eVpYQnNZV05sS0M5Y1hGeGNYQ0l2Wnl3Z0oxd2lKeWxjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTG5KbGNHeGhZMlVvTHloZVhDSjhYQ0lrS1M5bkxDQmNJaWRjSWlrN1hHNGdJQ0FnSUNCdVlXMWxJRDBnWTNSNExuTjBlV3hwZW1Vb2JtRnRaU3dnSjNOMGNtbHVaeWNwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJ1WVcxbElDc2dKem9nSnlBcklITjBjanRjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJ5WldSMVkyVlViMU5wYm1kc1pWTjBjbWx1WnlodmRYUndkWFFzSUdKaGMyVXNJR0p5WVdObGN5a2dlMXh1SUNCMllYSWdiblZ0VEdsdVpYTkZjM1FnUFNBd08xeHVJQ0IyWVhJZ2JHVnVaM1JvSUQwZ2IzVjBjSFYwTG5KbFpIVmpaU2htZFc1amRHbHZiaWh3Y21WMkxDQmpkWElwSUh0Y2JpQWdJQ0J1ZFcxTWFXNWxjMFZ6ZENzck8xeHVJQ0FnSUdsbUlDaGpkWEl1YVc1a1pYaFBaaWduWEZ4dUp5a2dQajBnTUNrZ2JuVnRUR2x1WlhORmMzUXJLenRjYmlBZ0lDQnlaWFIxY200Z2NISmxkaUFySUdOMWNpNXlaWEJzWVdObEtDOWNYSFV3TURGaVhGeGJYRnhrWEZ4a1AyMHZaeXdnSnljcExteGxibWQwYUNBcklERTdYRzRnSUgwc0lEQXBPMXh1WEc0Z0lHbG1JQ2hzWlc1bmRHZ2dQaUEyTUNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJpY21GalpYTmJNRjBnSzF4dUlDQWdJQ0FnSUNBZ0lDQW9ZbUZ6WlNBOVBUMGdKeWNnUHlBbkp5QTZJR0poYzJVZ0t5QW5YRnh1SUNjcElDdGNiaUFnSUNBZ0lDQWdJQ0FnSnlBbklDdGNiaUFnSUNBZ0lDQWdJQ0FnYjNWMGNIVjBMbXB2YVc0b0p5eGNYRzRnSUNjcElDdGNiaUFnSUNBZ0lDQWdJQ0FnSnlBbklDdGNiaUFnSUNBZ0lDQWdJQ0FnWW5KaFkyVnpXekZkTzF4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUdKeVlXTmxjMXN3WFNBcklHSmhjMlVnS3lBbklDY2dLeUJ2ZFhSd2RYUXVhbTlwYmlnbkxDQW5LU0FySUNjZ0p5QXJJR0p5WVdObGMxc3hYVHRjYm4xY2JseHVYRzR2THlCT1QxUkZPaUJVYUdWelpTQjBlWEJsSUdOb1pXTnJhVzVuSUdaMWJtTjBhVzl1Y3lCcGJuUmxiblJwYjI1aGJHeDVJR1J2YmlkMElIVnpaU0JnYVc1emRHRnVZMlZ2Wm1CY2JpOHZJR0psWTJGMWMyVWdhWFFnYVhNZ1puSmhaMmxzWlNCaGJtUWdZMkZ1SUdKbElHVmhjMmxzZVNCbVlXdGxaQ0IzYVhSb0lHQlBZbXBsWTNRdVkzSmxZWFJsS0NsZ0xseHVablZ1WTNScGIyNGdhWE5CY25KaGVTaGhjaWtnZTF4dUlDQnlaWFIxY200Z1FYSnlZWGt1YVhOQmNuSmhlU2hoY2lrN1hHNTlYRzVsZUhCdmNuUnpMbWx6UVhKeVlYa2dQU0JwYzBGeWNtRjVPMXh1WEc1bWRXNWpkR2x2YmlCcGMwSnZiMnhsWVc0b1lYSm5LU0I3WEc0Z0lISmxkSFZ5YmlCMGVYQmxiMllnWVhKbklEMDlQU0FuWW05dmJHVmhiaWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpRbTl2YkdWaGJpQTlJR2x6UW05dmJHVmhianRjYmx4dVpuVnVZM1JwYjI0Z2FYTk9kV3hzS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnWVhKbklEMDlQU0J1ZFd4c08xeHVmVnh1Wlhod2IzSjBjeTVwYzA1MWJHd2dQU0JwYzA1MWJHdzdYRzVjYm1aMWJtTjBhVzl1SUdselRuVnNiRTl5Vlc1a1pXWnBibVZrS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnWVhKbklEMDlJRzUxYkd3N1hHNTlYRzVsZUhCdmNuUnpMbWx6VG5Wc2JFOXlWVzVrWldacGJtVmtJRDBnYVhOT2RXeHNUM0pWYm1SbFptbHVaV1E3WEc1Y2JtWjFibU4wYVc5dUlHbHpUblZ0WW1WeUtHRnlaeWtnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUdGeVp5QTlQVDBnSjI1MWJXSmxjaWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpUblZ0WW1WeUlEMGdhWE5PZFcxaVpYSTdYRzVjYm1aMWJtTjBhVzl1SUdselUzUnlhVzVuS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKM04wY21sdVp5YzdYRzU5WEc1bGVIQnZjblJ6TG1selUzUnlhVzVuSUQwZ2FYTlRkSEpwYm1jN1hHNWNibVoxYm1OMGFXOXVJR2x6VTNsdFltOXNLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0ozTjViV0p2YkNjN1hHNTlYRzVsZUhCdmNuUnpMbWx6VTNsdFltOXNJRDBnYVhOVGVXMWliMnc3WEc1Y2JtWjFibU4wYVc5dUlHbHpWVzVrWldacGJtVmtLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdZWEpuSUQwOVBTQjJiMmxrSURBN1hHNTlYRzVsZUhCdmNuUnpMbWx6Vlc1a1pXWnBibVZrSUQwZ2FYTlZibVJsWm1sdVpXUTdYRzVjYm1aMWJtTjBhVzl1SUdselVtVm5SWGh3S0hKbEtTQjdYRzRnSUhKbGRIVnliaUJwYzA5aWFtVmpkQ2h5WlNrZ0ppWWdiMkpxWldOMFZHOVRkSEpwYm1jb2NtVXBJRDA5UFNBblcyOWlhbVZqZENCU1pXZEZlSEJkSnp0Y2JuMWNibVY0Y0c5eWRITXVhWE5TWldkRmVIQWdQU0JwYzFKbFowVjRjRHRjYmx4dVpuVnVZM1JwYjI0Z2FYTlBZbXBsWTNRb1lYSm5LU0I3WEc0Z0lISmxkSFZ5YmlCMGVYQmxiMllnWVhKbklEMDlQU0FuYjJKcVpXTjBKeUFtSmlCaGNtY2dJVDA5SUc1MWJHdzdYRzU5WEc1bGVIQnZjblJ6TG1selQySnFaV04wSUQwZ2FYTlBZbXBsWTNRN1hHNWNibVoxYm1OMGFXOXVJR2x6UkdGMFpTaGtLU0I3WEc0Z0lISmxkSFZ5YmlCcGMwOWlhbVZqZENoa0tTQW1KaUJ2WW1wbFkzUlViMU4wY21sdVp5aGtLU0E5UFQwZ0oxdHZZbXBsWTNRZ1JHRjBaVjBuTzF4dWZWeHVaWGh3YjNKMGN5NXBjMFJoZEdVZ1BTQnBjMFJoZEdVN1hHNWNibVoxYm1OMGFXOXVJR2x6UlhKeWIzSW9aU2tnZTF4dUlDQnlaWFIxY200Z2FYTlBZbXBsWTNRb1pTa2dKaVpjYmlBZ0lDQWdJQ2h2WW1wbFkzUlViMU4wY21sdVp5aGxLU0E5UFQwZ0oxdHZZbXBsWTNRZ1JYSnliM0pkSnlCOGZDQmxJR2x1YzNSaGJtTmxiMllnUlhKeWIzSXBPMXh1ZlZ4dVpYaHdiM0owY3k1cGMwVnljbTl5SUQwZ2FYTkZjbkp2Y2p0Y2JseHVablZ1WTNScGIyNGdhWE5HZFc1amRHbHZiaWhoY21jcElIdGNiaUFnY21WMGRYSnVJSFI1Y0dWdlppQmhjbWNnUFQwOUlDZG1kVzVqZEdsdmJpYzdYRzU5WEc1bGVIQnZjblJ6TG1selJuVnVZM1JwYjI0Z1BTQnBjMFoxYm1OMGFXOXVPMXh1WEc1bWRXNWpkR2x2YmlCcGMxQnlhVzFwZEdsMlpTaGhjbWNwSUh0Y2JpQWdjbVYwZFhKdUlHRnlaeUE5UFQwZ2JuVnNiQ0I4ZkZ4dUlDQWdJQ0FnSUNBZ2RIbHdaVzltSUdGeVp5QTlQVDBnSjJKdmIyeGxZVzRuSUh4OFhHNGdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSm5JRDA5UFNBbmJuVnRZbVZ5SnlCOGZGeHVJQ0FnSUNBZ0lDQWdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0ozTjBjbWx1WnljZ2ZIeGNiaUFnSUNBZ0lDQWdJSFI1Y0dWdlppQmhjbWNnUFQwOUlDZHplVzFpYjJ3bklIeDhJQ0F2THlCRlV6WWdjM2x0WW05c1hHNGdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSm5JRDA5UFNBbmRXNWtaV1pwYm1Wa0p6dGNibjFjYm1WNGNHOXlkSE11YVhOUWNtbHRhWFJwZG1VZ1BTQnBjMUJ5YVcxcGRHbDJaVHRjYmx4dVpYaHdiM0owY3k1cGMwSjFabVpsY2lBOUlISmxjWFZwY21Vb0p5NHZjM1Z3Y0c5eWRDOXBjMEoxWm1abGNpY3BPMXh1WEc1bWRXNWpkR2x2YmlCdlltcGxZM1JVYjFOMGNtbHVaeWh2S1NCN1hHNGdJSEpsZEhWeWJpQlBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvYnlrN1hHNTlYRzVjYmx4dVpuVnVZM1JwYjI0Z2NHRmtLRzRwSUh0Y2JpQWdjbVYwZFhKdUlHNGdQQ0F4TUNBL0lDY3dKeUFySUc0dWRHOVRkSEpwYm1jb01UQXBJRG9nYmk1MGIxTjBjbWx1WnlneE1DazdYRzU5WEc1Y2JseHVkbUZ5SUcxdmJuUm9jeUE5SUZzblNtRnVKeXdnSjBabFlpY3NJQ2ROWVhJbkxDQW5RWEJ5Snl3Z0owMWhlU2NzSUNkS2RXNG5MQ0FuU25Wc0p5d2dKMEYxWnljc0lDZFRaWEFuTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FuVDJOMEp5d2dKMDV2ZGljc0lDZEVaV01uWFR0Y2JseHVMeThnTWpZZ1JtVmlJREUyT2pFNU9qTTBYRzVtZFc1amRHbHZiaUIwYVcxbGMzUmhiWEFvS1NCN1hHNGdJSFpoY2lCa0lEMGdibVYzSUVSaGRHVW9LVHRjYmlBZ2RtRnlJSFJwYldVZ1BTQmJjR0ZrS0dRdVoyVjBTRzkxY25Nb0tTa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lIQmhaQ2hrTG1kbGRFMXBiblYwWlhNb0tTa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lIQmhaQ2hrTG1kbGRGTmxZMjl1WkhNb0tTbGRMbXB2YVc0b0p6b25LVHRjYmlBZ2NtVjBkWEp1SUZ0a0xtZGxkRVJoZEdVb0tTd2diVzl1ZEdoelcyUXVaMlYwVFc5dWRHZ29LVjBzSUhScGJXVmRMbXB2YVc0b0p5QW5LVHRjYm4xY2JseHVYRzR2THlCc2IyY2dhWE1nYW5WemRDQmhJSFJvYVc0Z2QzSmhjSEJsY2lCMGJ5QmpiMjV6YjJ4bExteHZaeUIwYUdGMElIQnlaWEJsYm1SeklHRWdkR2x0WlhOMFlXMXdYRzVsZUhCdmNuUnpMbXh2WnlBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNCamIyNXpiMnhsTG14dlp5Z25KWE1nTFNBbGN5Y3NJSFJwYldWemRHRnRjQ2dwTENCbGVIQnZjblJ6TG1admNtMWhkQzVoY0hCc2VTaGxlSEJ2Y25SekxDQmhjbWQxYldWdWRITXBLVHRjYm4wN1hHNWNibHh1THlvcVhHNGdLaUJKYm1obGNtbDBJSFJvWlNCd2NtOTBiM1I1Y0dVZ2JXVjBhRzlrY3lCbWNtOXRJRzl1WlNCamIyNXpkSEoxWTNSdmNpQnBiblJ2SUdGdWIzUm9aWEl1WEc0Z0tseHVJQ29nVkdobElFWjFibU4wYVc5dUxuQnliM1J2ZEhsd1pTNXBibWhsY21sMGN5Qm1jbTl0SUd4aGJtY3Vhbk1nY21WM2NtbDBkR1Z1SUdGeklHRWdjM1JoYm1SaGJHOXVaVnh1SUNvZ1puVnVZM1JwYjI0Z0tHNXZkQ0J2YmlCR2RXNWpkR2x2Ymk1d2NtOTBiM1I1Y0dVcExpQk9UMVJGT2lCSlppQjBhR2x6SUdacGJHVWdhWE1nZEc4Z1ltVWdiRzloWkdWa1hHNGdLaUJrZFhKcGJtY2dZbTl2ZEhOMGNtRndjR2x1WnlCMGFHbHpJR1oxYm1OMGFXOXVJRzVsWldSeklIUnZJR0psSUhKbGQzSnBkSFJsYmlCMWMybHVaeUJ6YjIxbElHNWhkR2wyWlZ4dUlDb2dablZ1WTNScGIyNXpJR0Z6SUhCeWIzUnZkSGx3WlNCelpYUjFjQ0IxYzJsdVp5QnViM0p0WVd3Z1NtRjJZVk5qY21sd2RDQmtiMlZ6SUc1dmRDQjNiM0pySUdGelhHNGdLaUJsZUhCbFkzUmxaQ0JrZFhKcGJtY2dZbTl2ZEhOMGNtRndjR2x1WnlBb2MyVmxJRzFwY25KdmNpNXFjeUJwYmlCeU1URTBPVEF6S1M1Y2JpQXFYRzRnS2lCQWNHRnlZVzBnZTJaMWJtTjBhVzl1ZlNCamRHOXlJRU52Ym5OMGNuVmpkRzl5SUdaMWJtTjBhVzl1SUhkb2FXTm9JRzVsWldSeklIUnZJR2x1YUdWeWFYUWdkR2hsWEc0Z0tpQWdJQ0FnY0hKdmRHOTBlWEJsTGx4dUlDb2dRSEJoY21GdElIdG1kVzVqZEdsdmJuMGdjM1Z3WlhKRGRHOXlJRU52Ym5OMGNuVmpkRzl5SUdaMWJtTjBhVzl1SUhSdklHbHVhR1Z5YVhRZ2NISnZkRzkwZVhCbElHWnliMjB1WEc0Z0tpOWNibVY0Y0c5eWRITXVhVzVvWlhKcGRITWdQU0J5WlhGMWFYSmxLQ2RwYm1obGNtbDBjeWNwTzF4dVhHNWxlSEJ2Y25SekxsOWxlSFJsYm1RZ1BTQm1kVzVqZEdsdmJpaHZjbWxuYVc0c0lHRmtaQ2tnZTF4dUlDQXZMeUJFYjI0bmRDQmtieUJoYm5sMGFHbHVaeUJwWmlCaFpHUWdhWE51SjNRZ1lXNGdiMkpxWldOMFhHNGdJR2xtSUNnaFlXUmtJSHg4SUNGcGMwOWlhbVZqZENoaFpHUXBLU0J5WlhSMWNtNGdiM0pwWjJsdU8xeHVYRzRnSUhaaGNpQnJaWGx6SUQwZ1QySnFaV04wTG10bGVYTW9ZV1JrS1R0Y2JpQWdkbUZ5SUdrZ1BTQnJaWGx6TG14bGJtZDBhRHRjYmlBZ2QyaHBiR1VnS0drdExTa2dlMXh1SUNBZ0lHOXlhV2RwYmx0clpYbHpXMmxkWFNBOUlHRmtaRnRyWlhselcybGRYVHRjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdiM0pwWjJsdU8xeHVmVHRjYmx4dVpuVnVZM1JwYjI0Z2FHRnpUM2R1VUhKdmNHVnlkSGtvYjJKcUxDQndjbTl3S1NCN1hHNGdJSEpsZEhWeWJpQlBZbXBsWTNRdWNISnZkRzkwZVhCbExtaGhjMDkzYmxCeWIzQmxjblI1TG1OaGJHd29iMkpxTENCd2NtOXdLVHRjYm4xY2JpSmRmUT09IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiJdfQ==
