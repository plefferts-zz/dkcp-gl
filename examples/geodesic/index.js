var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation
var geodesic          = DkcpGl.geodesic

var main = new DkcpGl({
  canvas : document.getElementById('canvas'),
  frameRate : {
    element : document.getElementById('framerate')
  },
  wasd : {
    document : document,
    delta : .5,
    theta : -Math.PI / 30
  }
})
var camera = main.camera;
var screen = main.screen;

var subdivisions = 11;

function getRenderable() {
  return new Renderable({
    before : function () {
    },
    getUniforms : function () {
      return {
        camera : camera.computeMatrix()
      }
    },
    factory : function () {
      
      var maxColors = 10
      var colorAllocation = new Allocation.Float(maxColors, 4)
      
      var shader = new Shader(function () {
        return '  gl_Position = camera * position; \n' + 
               '  f_color = colors[int(color)]; \n'
      }, function () {
        return '  gl_FragColor = f_color ;\n'
      })
      shader.attributes.position   = 'vec4';
      shader.attributes.color      = 'float';
      shader.varyings.f_color      = 'vec4';
      shader.vertex_uniforms.camera = 'mat4';
      shader.vertex_uniforms['colors[' + maxColors + ']'] = 'vec4';

      var m = new Model.Geodesics(this, shader, 2, subdivisions)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      
      m.addAttribute('color', 1, 'Float32Array', function (i, item) {
        return [
          colorAllocation.add(item.color[i], item, function () {
            return item.color[i].color
          })
        ]
      });
  
      m.uniforms.colors = colorAllocation.buffer;
  
      return m
    }
  })
}

var red     = {id: 'red',     color: [1, 0, 0, 1]}
var yellow  = {id: 'yellow',  color: [1, 1, 0, 1]}
var green   = {id: 'green',   color: [0, 1, 0, 1]}
var cyan    = {id: 'cyan',    color: [0, 1, 1, 1]}
var blue    = {id: 'blue',    color: [0, 0, 1, 1]}
var magenta = {id: 'magenta', color: [1, 0, 1, 1]}
var white   = {id: 'white',   color: [1, 1, 1, 1]}

var colors  = [red, yellow, green, cyan, blue, magenta, white];

  
var geos  = getRenderable()
screen.addRenderable(geos)

var g = geodesic(subdivisions).getGeometry();
var color_ints = [];
for (var i = 0; i < g.points.length; i ++) {
  color_ints.push(colors[Math.random() * colors.length | 0])
}
var vertices = []
g.points.forEach(function (point) {
  vertices.push([
    point[0],
    point[1],
    point[2] + 5,
    1
  ])
})
geos.add({
  color       : color_ints,
  allocations : {},
  tris        : g.tris,
  vertices    : vertices
})

var g = geodesic(subdivisions).getGeometry();
var color_ints = [];
for (var i = 0; i < g.points.length; i ++) {
  color_ints.push(colors[Math.random() * colors.length | 0])
}
var vertices = []
g.points.forEach(function (point) {
  vertices.push([
    point[0] / 3 + 4,
    point[1] / 3 + 4,
    point[2] / 3 + 10,
    1
  ])
})
geos.add({
  color       : color_ints,
  allocations : {},
  tris        : g.tris,
  vertices    : vertices
})

screen.beginFrameRendering(false)
