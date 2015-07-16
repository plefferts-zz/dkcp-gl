var m4                = require('../../lib/twgl').m4
var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Plate             = DkcpGl.Plate
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation

var main = new DkcpGl({
  canvas : document.getElementById('canvas'),
  frameRate : {
    element : document.getElementById('framerate')
  },
  wasd : {
    document : document,
    delta : .012,
    theta : -Math.PI / 60
  }
})
var camera = main.camera;
var screen = main.screen;

function getRenderable() {
  var inverse = new Float32Array(16);
  return new Renderable({
    getUniforms : function () {
      m4.inverse(camera.computeMatrix(), inverse);
      return {
        camera : inverse
      }
    },
    factory : function () {
      var shader = new Shader(function () {
        return (
          '  v_position  = camera * (position * vec4(10.0, 10.0, 0.0, 1.0)); \n' +
          '  gl_Position = vec4(position.x, position.y, 0.5, 1.0); \n'
        ) 
      }, function () {
        return (
          '  float n2 = snoise(vec3(v_position.x / 4.0, v_position.y / 4.0, v_position.z / 4.0));\n' +
          '  n2 = (1.0 - pow(1.0 - abs(n2), 2.0)) * (n2 > 0.0 ? 1.0 : -1.0);\n' +
          '  n2 = clamp((n2 + 1.0) / 2.0, 0.0, 1.0);\n' +
          '  n2 = pow(n2, 0.5);\n' +
          '  n2 = 0.125 + n2 * 0.875;\n' +

          '  float n = snoise(vec3(12345.67 + v_position.x / 1.0, v_position.y / 1.0, v_position.z / 1.0));\n' +
          '  n = (n * 0.5 + (n2 - 0.5)) / 4.0;\n' +

          '  n = (1.0 - pow(1.0 - abs(n), 20.0)) * (n > 0.0 ? 1.0 : -1.0);\n' +
          '  n = clamp((n + 1.0) / 2.0, 0.0, 1.0);\n' +
          '  n = pow(n, 2.1);\n' +
          '  n = 0.125 + n * 0.875;\n' +

          '  n = 1.0 - n;\n' +
          '  gl_FragColor = vec4(n, n, n, 1.0);\n'
        )
      })
      shader.fragment_header += require('../../src/glsl/noise.min.glsl');
      shader.attributes.position    = 'vec4';
      shader.vertex_uniforms.camera = 'mat4';
      shader.varyings.v_position    = 'vec4';
      
      
      var plate = new Plate(shader);
      return plate;
    }
    
  })
}

var noise  = getRenderable()
screen.addRenderable(noise)
noise.add({
  z: .5
})

screen.beginFrameRendering(false)
