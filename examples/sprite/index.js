var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Texture           = DkcpGl.Texture

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

var img = document.createElement('img')

function getRenderable() {
  return new Renderable({
    before : function () {
      gl.clearColor(0.9,0.9,0.9,1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    },
    getUniforms : function () {
      return {
        camera : camera.computeMatrix(),
        texture : this.texture.getTexture().texture
      }
    },
    factory : function () {
      if (!this.texture) {
        this.texture = new Texture(main.screen.gl, img)
      }

      var shader = new Shader(function () {
        return '  gl_Position = camera * position; \n' + 
               '  f_texCoord = texCoord; \n'
      }, function () {
        return (
          '  float txWidth  = 256.0;                                  \n'+
          '  float txHeight = 256.0;                                  \n'+
          '  vec2 clamped = vec2(                                     \n'+
          '     (float(int(f_texCoord.x * (txWidth - 1.0) )))/(txWidth - 1.0),  \n'+
          '     (float(int(f_texCoord.y * (txHeight - 1.0))))/(txHeight - 1.0)  \n'+
          '  );                                                       \n'+
          '  gl_FragColor = texture2D(texture, clamped);              \n'+
          '   if (gl_FragColor.a < 0.999)                             \n'+
          '     discard;                                              \n'+
          ''
        )
      })
      shader.fragment_uniforms.texture = 'sampler2D';
      shader.attributes.position       = 'vec4';
      shader.attributes.texCoord       = 'vec2';
      shader.varyings.f_texCoord       = 'vec2';
      shader.vertex_uniforms.camera    = 'mat4';

      var m                    = new Model(this, shader, 100)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      m.addAttribute('texCoord', 2, 'Float32Array', function (i, item) {
        return [[0,0],[0,1],[1,0],[1,1]][i]
      });
      
      m.textureData = {texture : this.texture.getTexture()}
  
      return m
    }
  })
}

function getSpriteRenderable() {
  return new Renderable({
    getUniforms : function () {
      return {
        camera : camera.computeMatrix(),
        aspect : camera.getAspect(),
        texture : this.texture.getTexture().texture
      }
    },
    factory : function () {
      if (!this.texture) {
        this.texture = new Texture(main.screen.gl, img)
      }

      var shader = new Shader(function () {
        return (
          ' vec4 pos = camera * position; \n' + 
          // ' vec4 pos2 = vec4(pos.x / pos.w, pos.y / pos.w, pos.z / pos.w, 1.0); \n' +
          ' gl_Position = pos + offset * aspect; \n' + 
          ' f_texCoord = texCoord; \n'
        )
      }, function () {
        return (
          '  float txWidth  = 256.0;                                  \n'+
          '  float txHeight = 256.0;                                  \n'+
          '  vec2 clamped = vec2(                                     \n'+
          '     (float(int(f_texCoord.x * (txWidth - 1.0) )))/(txWidth - 1.0),  \n'+
          '     (float(int(f_texCoord.y * (txHeight - 1.0))))/(txHeight - 1.0)  \n'+
          '  );                                                       \n'+
          '  gl_FragColor = texture2D(texture, clamped);              \n'+
          '   if (gl_FragColor.a < 0.999)                             \n'+
          '     discard;                                              \n'+
          ''
        )
      })
      shader.fragment_uniforms.texture = 'sampler2D';
      shader.attributes.position       = 'vec4';
      shader.attributes.texCoord       = 'vec2';
      shader.varyings.f_texCoord       = 'vec2';
      shader.vertex_uniforms.camera    = 'mat4';
      shader.vertex_uniforms.aspect    = 'vec4';
      shader.attributes.offset         = 'vec4';

      var m                    = new Model(this, shader, 100)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices
      });
      m.addAttribute('offset', 4, 'Float32Array', function (i, item) {
        var w = item.width
        var h = item.height
        return [[-w, -h, 0, 0],
                [-w,  h, 0, 0],
                [ w, -h, 0, 0],
                [ w,  h, 0, 0]
        ][i]
      });
      m.addAttribute('texCoord', 2, 'Float32Array', function (i, item) {
        return [[0,0],[0,1],[1,0],[1,1]][i]
      });
      
      m.textureData = {texture : this.texture.getTexture()}
  
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


var sprite = function (x, y, z) {
  return [x, y, z, 1]
}

var quads  = getRenderable()
screen.addRenderable(quads)
var spriteQuads  = getSpriteRenderable()
screen.addRenderable(spriteQuads)

var started = false
var start = function() {
  if (started) return
  started = true

  quads.add({
    color : 1,
    allocations : {},
    vertices : square(.25, 0, .7, .05)
  })
  quads.add({
    color : 2,
    allocations : {},
    vertices : square(0, .25, .7, .05)
  })
  quads.add({
    color : 3,
    allocations : {},
    vertices : square(0, 0, .9, .05)
  })
  spriteQuads.add({
    color : 4,
    allocations : {},
    vertices : sprite(0, 0, .7, .05),
    width: .04,
    height: .04
  })
}

img.addEventListener('load', function () {
  console.log('img loaded')
  start()
  screen.beginFrameRendering(false)
})
img.setAttribute('src', '../img/img.png')


