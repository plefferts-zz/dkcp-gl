var twgl              = require('../../lib/twgl')
var m4                = require('../../lib/twgl').m4
var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var Plate             = DkcpGl.Plate
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation

var util        = require('util')
var RenderSet   = DkcpGl.RenderSet
var BasicCamera = DkcpGl.camera.BasicCamera

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

function getRenderable() {
  return new Renderable({
    before : function () {
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    },
    renderOrder : 1,
    getUniforms : function (renderSet) {
      console.log(renderSet)
      return {
        camera : renderSet == screen ? camera.computeMatrix() : renderSet.camera.computeMatrix()
      }
    },
    factory : function () {
      
      var maxColors = 100
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

      var m = new Model(this, shader, 100)
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

var red   = {id: 'red',   color: [1, 0, 0, 1]}
var green = {id: 'green', color: [0, 1, 0, 1]}
var blue  = {id: 'blue',  color: [0, 0, 1, 1]}
var white = {id: 'white', color: [1, 1, 1, 1]}

  
var quads  = getRenderable()
screen.addRenderable(quads)
quads.add({
  color : red,
  allocations : {},
  vertices : square(.25, 0, .7, .05)
})
quads.add({
  color : green,
  allocations : {},
  vertices : square(0, .25, .7, .05)
})
quads.add({
  color : blue,
  allocations : {},
  vertices : square(0, 0, .9, .05)
})
quads.add({
  color : white,
  allocations : {},
  vertices : square(0, 0, .7, .01)
})

function MyRenderSet(framebuffers) {

  this.framebuffers = framebuffers;
  this.cameras = [];
  this.camera = null;
  
  for (var ff = 0; ff < 1; ++ff) {
    var c;
    this.cameras.push(c = new BasicCamera(framebuffers.size, framebuffers.size, .1, 4096));
    c.setFOV(90, true);
  }
  
  // this.cameras[2].rotateBy(0, Math.PI/2, 0);
  // this.cameras[3].rotateBy(0, -Math.PI/2, 0);
  // this.cameras[5].rotateBy(0, Math.PI, Math.PI);
  // this.cameras[1].rotateBy(0, Math.PI, -Math.PI/2);
  // this.cameras[4].rotateBy(0, Math.PI, 0);
  // this.cameras[0].rotateBy(0, Math.PI, Math.PI/2);

  this.cameras[0].rotateBy(0, Math.PI, 0);
  
  RenderSet.call(this)
}
util.inherits(MyRenderSet, RenderSet)

MyRenderSet.prototype.render = function (gl) {
  for (var ff = 0; ff < 1; ++ff) {
    this.framebuffers.bind(ff);
    this.camera = this.cameras[ff];
    RenderSet.prototype.render.call(this, gl);
  }
  this.framebuffers.unbind();
}

function MyFramebuffer(size, opt_depth) {
  this.size = size;
  this.depth = opt_depth;
  var tex = {
    texture : twgl.createTexture(gl, {
      target : gl.TEXTURE_2D,
      width  : this.size,
      height : this.size,
      min    : gl.LINEAR,
      mag    : gl.LINEAR,
      format : gl.RGBA,
      type   : gl.UNSIGNED_BYTE,
      wrapS  : gl.CLAMP_TO_EDGE,
      wrapT  : gl.CLAMP_TO_EDGE
    })
  }
  if (this.depth) {
    var db = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, db);
    gl.renderbufferStorage(
        gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);
  }
  this.framebuffers = [];
  for (var ff = 0; ff < 1; ++ff) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex.texture,
        0);
    if (this.depth) {
      gl.framebufferRenderbuffer(
          gl.FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER,
          db);
    }
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      throw("gl.checkFramebufferStatus() returned " + status);
    }
    this.framebuffers.push(fb);
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  this.texture = tex;
}

MyFramebuffer.prototype.bind = function(face) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[face]);
  gl.viewport(0, 0, this.size, this.size);
};

MyFramebuffer.prototype.unbind = function() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(
      0, 0,
      gl.drawingBufferWidth || gl.canvas.width,
      gl.drawingBufferHeight || gl.canvas.height);
};


var myFBO = new MyFramebuffer(1024, true);
myFBO.unbind()

;(function () {

  
  var myRenderSet = new MyRenderSet(myFBO)

  var shader = new Shader(function () {
    return (
      '  gl_Position = position; \n' +
      '  v_position  = inverse_camera * position; \n'
    )
  }, function () {
    return (
      '  gl_FragColor = vec4(                                               \n' +
      '   (v_position.x + 1.0) / 2.0,                                       \n' +
      '   (v_position.y + 1.0) / 2.0,                                       \n' +
      '   (v_position.z + 1.0) / 2.0,                                       \n' +
      '   1.0);                                                             \n'
    )
    
  })
  shader.attributes.position    = 'vec4';
  shader.vertex_uniforms.inverse_camera = 'mat4';
  shader.varyings.v_position    = 'vec4';

  var plate = new Plate(shader);
  plate.add({z: -.5})
  
  var uniforms = {};
  var mat1 = m4.identity(new Float32Array(16));
  var mat2 = m4.identity(new Float32Array(16));
  var mat3 = m4.identity(new Float32Array(16));
  
  myRenderSet.addRenderable(quads)
  // myRenderSet.addRenderable({
  //   renderOrder: 10,
  //   render : function (gl) {
  //     gl.disable(gl.DEPTH_TEST);
  //
  //     myRenderSet.camera.computeMatrix()
  //     m4.inverse(myRenderSet.camera.perspective, mat1);
  //     m4.inverse(myRenderSet.camera.skyorientation, mat2);
  //     m4.multiply(mat1, mat2, mat3);
  //     uniforms.inverse_camera = mat3;
  //
  //     var geom = plate.getGeometry(gl);
  //     plate.drawPrep(geom, uniforms);
  //     geom.draw();
  //
  //     gl.enable(gl.DEPTH_TEST);
  //   }
  // })
  

  screen.addRenderable({
    renderOrder : 2,
    render : function (gl) {
      myRenderSet.render(gl)
    }
  })

}())
  
;(function () {
  
  var shader = new Shader(function () {
    return (
      '  v_pos       = camera * position; \n' +
      '  gl_Position = vec4(position.x, position.y, 0.5, 1.0); \n'
    ) 
  }, function () {
    return (
      '  gl_FragColor = texture2D(                              \n'+
      '      texture,                                           \n'+
      '      vec2(v_pos.x, v_pos.y));                           \n'
    )
  })
  shader.attributes.position              = 'vec4';
  shader.fragment_uniforms.texture        = 'sampler2D';
  shader.vertex_uniforms.camera           = 'mat4';
  shader.varyings.v_pos                   = 'vec4';
  
  var plate = new Plate(shader);
  plate.textureData = {texture : myFBO.texture}
  plate.add({z: 1})
  
  var uniforms = {};

  var inverse = m4.identity(new Float32Array(16));
  
  
  screen.addRenderable({
    renderOrder : 3,
    render : function (gl) {
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
      gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.DST_ALPHA, gl.ONE, gl.ONE);
      camera.computeMatrix()
      m4.inverse(camera.skymatrix, inverse);
      uniforms.camera = inverse;
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


function click(x, y) {
  console.log(Math.floor(x), Math.floor(y))
}

document.getElementById('canvas').addEventListener('click', function (e) {
  var rect = document.getElementById('canvas').getBoundingClientRect()
  click((e.clientX - rect.left) / rect.width * camera.frameWidth, (e.clientY - rect.top) / rect.height * camera.frameHeight)
})