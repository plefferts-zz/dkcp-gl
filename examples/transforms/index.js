var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation
var Transform         = DkcpGl.Transform

var main = new DkcpGl({
  canvas : document.getElementById('canvas'),
  frameRate : {
    element : document.getElementById('framerate')
  },
  wasd : {
    document : document,
    delta : .05,
    theta : -Math.PI / 120
  }
})
var camera = main.camera;
var screen = main.screen;

function getRenderable() {
  return new Renderable({
    getUniforms : function () {
      return {
        camera : camera.computeMatrix()
      }
    },
    factory : function () {
      
      var maxColors           = 100
      var colorAllocation     = new Allocation.Float(maxColors, 4)

      var maxTransforms       = 16
      var transformAllocation = new Allocation.Float(maxTransforms, 16)
      
      var shader = new Shader(function () {
        return '  gl_Position = camera * transforms[int(transform)] * position; \n' + 
               '  f_color = colors[int(color)]; \n'
      }, function () {
        return '  gl_FragColor = f_color ;\n'
      })
      shader.attributes.position    = 'vec4';
      shader.attributes.color       = 'float';
      shader.attributes.transform   = 'float';
      shader.varyings.f_color       = 'vec4';
      shader.vertex_uniforms.camera = 'mat4';
      shader.vertex_uniforms['colors[' + maxColors + ']'] = 'vec4';
      shader.vertex_uniforms['transforms[' + maxTransforms + ']'] = 'mat4';

      var m = new Model(this, shader, 100)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      
      m.addAttribute('color', 1, 'Float32Array', function (i, item) {
        var color_indices = []
        var colors = item.allocations.colors
        colors.forEach(function (color) {
          color_indices.push(
            colorAllocation.add(color, item, function () {
              return color.color
            })
          )
        })
        return color_indices
      });

      m.addAttribute('transform', 1, 'Float32Array', function (i, item) {
        var transform_indices = []
        var transforms = item.allocations.transforms
        transforms.forEach(function (transform) {
          transform_indices.push(
            transformAllocation.add(transform, item, function () {
              return transform.getValue()
            })
          )
        })
        return transform_indices
      });
  
      m.allocations.colors     = colorAllocation;
      m.uniforms.colors        = colorAllocation.buffer;
      m.allocations.transforms = transformAllocation;
      m.uniforms.transforms    = transformAllocation.buffer;
  
      return m
    }
  })
}

var square = function (x, y, z, w) {
  return [
    [x - w,  y - w, z, 1],
    [x - w,  y + w, z, 1],
    [x + w,  y - w, z, 1],
    [x + w,  y + w, z, 1]
  ]
}
var red   = {id: 'red',   color: [1, 0, 0, 1]}
var green = {id: 'green', color: [0, 1, 0, 1]}
var blue  = {id: 'blue',  color: [0, 0, 1, 1]}
var white = {id: 'white', color: [1, 1, 1, 1]}

var transforms = [];
transforms.push(new Transform());

screen.on('frame', function() {
  transforms[0].rotateBy(Math.PI/8/10, 0, 0);
  transforms[0].trigger('change', transforms[0]);
})

var quads  = getRenderable()
screen.addRenderable(quads)
quads.add({
  allocations : {
    colors : [red],
    transforms : [transforms[0]]
  },
  vertices : square(.25, 0, .7, .05)
})
quads.add({
  allocations : {
    colors : [green],
    transforms : [transforms[0]]
  },
  vertices : square(0, .25, .7, .05)
})
quads.add({
  allocations : {
    colors : [blue],
    transforms : [transforms[0]]
  },
  vertices : square(0, 0, .9, .05)
})
quads.add({
  allocations : {
    colors : [white],
    transforms : [transforms[0]]
  },
  vertices : square(0, 0, .7, .01)
})


screen.beginFrameRendering(false)
