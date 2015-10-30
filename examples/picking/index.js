var twgl              = require('../../lib/twgl')
var m4                = require('../../lib/twgl').m4
var DkcpGl            = require('../../src/dkcp-gl')
var picking           = require('../../src/picking')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var Plate             = DkcpGl.Plate
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation

var RenderSet         = DkcpGl.RenderSet
var BasicCamera       = DkcpGl.camera.BasicCamera

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
var gl     = main.screen.gl;

var hitTestManager = new picking.HitTestManager(gl, 100);

function getRenderable() {
  var identity = m4.identity(new Float32Array(16));
  return new Renderable({
    renderOrder : 10,
    getUniforms : function (renderSet) {
      if (renderSet == screen) {
        return {
          camera : camera.computeMatrix(),
          camera2 : identity,
          hit_test : 0
        }
      }
      return {
        camera : camera.computeMatrix(),
        camera2 : renderSet.camera2,
        hit_test : 1
        
      }
    },
    factory : function () {
      
      var maxColors = 100
      var colorAllocation    = new Allocation.Float(maxColors, 4)
      
      var shader = new picking.HitTestShader(hitTestManager.hitColorAllocation, function () {
        return '  gl_Position = camera2 * camera * position; \n' + 
               '  f_color = colors[int(color)];              \n'
      }, function () {
        return '  gl_FragColor = f_color; \n'
      })

      shader.attributes.position     = 'vec4';
      shader.attributes.color        = 'float';
      shader.varyings.f_color        = 'vec4';
      shader.vertex_uniforms.camera  = 'mat4';
      shader.vertex_uniforms.camera2 = 'mat4';
      shader.vertex_uniforms['colors[' + maxColors + ']'] = 'vec4';

      var m = new Model(this, shader, 100)
      hitTestManager.mixinModel(m)
      
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      
      m.addAttribute('color', 1, 'Float32Array', function (i, item) {
        return [
          colorAllocation.add(item.color, item, function () {
            return item.color.color
          })
        ]
      });

      m.uniforms.colors = colorAllocation.buffer;
  
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

var red     = {id: 'red',     color: [1, 0, 0, 1]}
var green   = {id: 'green',   color: [0, 1, 0, 1]}
var blue    = {id: 'blue',    color: [0, 0, 1, 1]}
var white   = {id: 'white',   color: [1, 1, 1, 1]}

var quads  = getRenderable()
screen.addRenderable(quads)
quads.add({
  color : red,
  hit_area : 'red',
  allocations : {},
  vertices : square(.25, 0, .7, .05)
})
quads.add({
  color : green,
  hit_area : 'green',
  allocations : {},
  vertices : square(0, .25, .7, .05)
})
quads.add({
  color : blue,
  hit_area : 'blue',
  allocations : {},
  vertices : square(0, 0, .9, .05)
})
quads.add({
  color : white,
  hit_area : 'white',
  allocations : {},
  vertices : square(0, 0, .7, .01)
})

var hitTestRenderSet;

;(function () {

  
 hitTestRenderSet = hitTestManager.renderSet

  var shader = new Shader(function () {
    return (
      '  gl_Position = position; \n'
    )
  }, function () {
    return (
      '  gl_FragColor = vec4(0.5,0.5,0.5,1.0); \n'
    )
    
  })
  shader.attributes.position    = 'vec4';

  var plate = new Plate(shader);
  plate.add({z: -.5})
  
  var uniforms = {};
  var mat1 = m4.identity(new Float32Array(16));
  var mat2 = m4.identity(new Float32Array(16));
  var mat3 = m4.identity(new Float32Array(16));
  
  
  hitTestRenderSet.addRenderable({
    before : function () {
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    },
    renderOrder : 0
  })
  
  var lastarr;
  hitTestRenderSet.addRenderable({
    before : function () {
      var arr = new Uint8Array(4 * 4)
      gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, arr)
      arr = Array.prototype.slice.call(arr, 0, 3)
      if (arr.join(',') != lastarr) {
        console.log(hitTestManager.hitAreaFor(arr))
      }
      lastarr = arr.join(',')
    },
    renderOrder : 999
  })
  
  hitTestRenderSet.addRenderable({
    renderOrder: 11,
    render : function (gl) {
      gl.disable(gl.DEPTH_TEST);
      
      gl.enable(gl.BLEND);
      gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
      gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.DST_ALPHA, gl.ONE, gl.ONE);

      var geom = plate.getGeometry(gl);
      plate.drawPrep(geom, uniforms);
      geom.draw();

      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
    }
  })
  
  hitTestRenderSet.addRenderable(quads)

  screen.addRenderable({
    before : function () {
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    },
    renderOrder : 0
  })
  
}())
  
;(function () {
  
  var shader = new Shader(function () {
    return (
      '  v_pos       = position; \n' +
      '  gl_Position = camera * vec4(position.x / 4.0, position.y / 4.0, 1.5, 1.0); \n'
    ) 
  }, function () {
    return (
      '  gl_FragColor = texture2D(                            \n'+
      '      texture,                                         \n'+
      '      vec2(v_pos.x / 2.0 + 0.5, v_pos.y / 2.0 + 0.5)); \n'
    )
  })
  shader.attributes.position              = 'vec4';
  shader.fragment_uniforms.texture        = 'sampler2D';
  shader.vertex_uniforms.camera           = 'mat4';
  shader.varyings.v_pos                   = 'vec4';
  
  var plate = new Plate(shader);
  plate.textureData = {texture : hitTestRenderSet.framebuffers.texture}
  plate.add({z: 1})
  
  var uniforms = {};

  var inverse = m4.identity(new Float32Array(16));
  
  
  screen.addRenderable({
    renderOrder : 30,
    render : function (gl) {
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
      gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.DST_ALPHA, gl.ONE, gl.ONE);
      camera.computeMatrix()
      // m4.inverse(camera.skymatrix, inverse);
      uniforms.camera = camera.matrix;
      uniforms.texture = plate.textureData.texture.texture;
      var geom = plate.getGeometry(gl);
      plate.drawPrep(geom, uniforms);
      geom.draw();
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
    }
  })

}());

screen.beginFrameRendering(false)

var mousex, mousey;

screen.on('moved', function () {
  hitTestRenderSet.render(gl, camera, mousex, mousey)
})

function click(x, y) {
  hitTestRenderSet.render(gl, camera, x - 1, y - 1)
}
function mousemove(x, y) {
  hitTestRenderSet.render(gl, camera, mousex = x - 1, mousey = y - 1)
}

document.getElementById('canvas').addEventListener('click', function (e) {
  var rect = document.getElementById('canvas').getBoundingClientRect()
  click((e.clientX - rect.left) / rect.width * camera.frameWidth, (e.clientY - rect.top) / rect.height * camera.frameHeight)
})

document.getElementById('canvas').addEventListener('mousemove', function (e) {
  var rect = document.getElementById('canvas').getBoundingClientRect()
  mousemove((e.clientX - rect.left) / rect.width * camera.frameWidth, (e.clientY - rect.top) / rect.height * camera.frameHeight)
})