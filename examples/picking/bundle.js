require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/picking/index.js":[function(require,module,exports){
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
},{"../../lib/twgl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/lib/twgl.js","../../src/dkcp-gl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/dkcp-gl.js","util":"/Users/peterlefferts/Sites/localhost/dkcp-gl/node_modules/browserify/node_modules/util/util.js"}]},{},["/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/picking/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9waWNraW5nL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB0d2dsICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4uLy4uL2xpYi90d2dsJylcbnZhciBtNCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4uLy4uL2xpYi90d2dsJykubTRcbnZhciBEa2NwR2wgICAgICAgICAgICA9IHJlcXVpcmUoJy4uLy4uL3NyYy9ka2NwLWdsJylcblxudmFyIFJlbmRlcmFibGUgICAgICAgID0gRGtjcEdsLlJlbmRlcmFibGVcbnZhciBNb2RlbCAgICAgICAgICAgICA9IERrY3BHbC5Nb2RlbFxudmFyIFBsYXRlICAgICAgICAgICAgID0gRGtjcEdsLlBsYXRlXG52YXIgc2hhZGVycyAgICAgICAgICAgPSBEa2NwR2wuc2hhZGVyc1xudmFyIFNoYWRlciAgICAgICAgICAgID0gRGtjcEdsLlNoYWRlclxudmFyIEFsbG9jYXRpb24gICAgICAgID0gRGtjcEdsLkFsbG9jYXRpb25cblxudmFyIHV0aWwgICAgICAgID0gcmVxdWlyZSgndXRpbCcpXG52YXIgUmVuZGVyU2V0ICAgPSBEa2NwR2wuUmVuZGVyU2V0XG52YXIgQmFzaWNDYW1lcmEgPSBEa2NwR2wuY2FtZXJhLkJhc2ljQ2FtZXJhXG5cbnZhciBtYWluID0gbmV3IERrY3BHbCh7XG4gIGNhbnZhcyA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgZnJhbWVSYXRlIDoge1xuICAgIGVsZW1lbnQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVyYXRlJylcbiAgfSxcbiAgd2FzZCA6IHtcbiAgICBkb2N1bWVudCA6IGRvY3VtZW50LFxuICAgIGRlbHRhIDogLjA1LFxuICAgIHRoZXRhIDogLU1hdGguUEkgLyAxMjBcbiAgfVxufSlcbnZhciBjYW1lcmEgPSBtYWluLmNhbWVyYTtcbnZhciBzY3JlZW4gPSBtYWluLnNjcmVlbjtcbnZhciBnbCAgICAgPSBtYWluLnNjcmVlbi5nbDtcblxuZnVuY3Rpb24gZ2V0UmVuZGVyYWJsZSgpIHtcbiAgcmV0dXJuIG5ldyBSZW5kZXJhYmxlKHtcbiAgICBiZWZvcmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBnbC5jbGVhckNvbG9yKDAsMCwwLDApO1xuICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpXG4gICAgfSxcbiAgICByZW5kZXJPcmRlciA6IDEsXG4gICAgZ2V0VW5pZm9ybXMgOiBmdW5jdGlvbiAocmVuZGVyU2V0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjYW1lcmEgOiByZW5kZXJTZXQgPT0gc2NyZWVuID8gY2FtZXJhLmNvbXB1dGVNYXRyaXgoKSA6IHJlbmRlclNldC5jYW1lcmEuY29tcHV0ZU1hdHJpeCgpXG4gICAgICB9XG4gICAgfSxcbiAgICBmYWN0b3J5IDogZnVuY3Rpb24gKCkge1xuICAgICAgXG4gICAgICB2YXIgbWF4Q29sb3JzID0gMTAwXG4gICAgICB2YXIgY29sb3JBbGxvY2F0aW9uID0gbmV3IEFsbG9jYXRpb24uRmxvYXQobWF4Q29sb3JzLCA0KVxuXG4gICAgICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9Qb3NpdGlvbiA9IGNhbWVyYSAqIHBvc2l0aW9uOyBcXG4nICsgXG4gICAgICAgICAgICAgICAnICBmX2NvbG9yID0gY29sb3JzW2ludChjb2xvcildOyBcXG4nXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9GcmFnQ29sb3IgPSBmX2NvbG9yIDtcXG4nXG4gICAgICB9KVxuICAgICAgc2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24gICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLmNvbG9yICAgICAgPSAnZmxvYXQnO1xuICAgICAgc2hhZGVyLnZhcnlpbmdzLmZfY29sb3IgICAgICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXMuY2FtZXJhID0gJ21hdDQnO1xuICAgICAgc2hhZGVyLnZlcnRleF91bmlmb3Jtc1snY29sb3JzWycgKyBtYXhDb2xvcnMgKyAnXSddID0gJ3ZlYzQnO1xuXG4gICAgICB2YXIgbSA9IG5ldyBNb2RlbCh0aGlzLCBzaGFkZXIsIDEwMClcbiAgICAgIG0uYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIDQsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS52ZXJ0aWNlc1tpXVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIG0uYWRkQXR0cmlidXRlKCdjb2xvcicsIDEsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIGNvbG9yQWxsb2NhdGlvbi5hZGQoaXRlbS5jb2xvciwgaXRlbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uY29sb3IuY29sb3JcbiAgICAgICAgICB9KVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgXG4gICAgICBtLnVuaWZvcm1zLmNvbG9ycyA9IGNvbG9yQWxsb2NhdGlvbi5idWZmZXI7XG4gIFxuICAgICAgcmV0dXJuIG1cbiAgICB9XG4gIH0pXG59XG5cbnZhciBzcXVhcmUgPSBmdW5jdGlvbiAoeCwgeSwgeiwgdykge1xuICByZXR1cm4gW1xuICAgIFt4IC0gdywgIHkgLSB3LCB6LCAxXSxcbiAgICBbeCAtIHcsICB5ICsgdywgeiwgMV0sXG4gICAgW3ggKyB3LCAgeSAtIHcsIHosIDFdLFxuICAgIFt4ICsgdywgIHkgKyB3LCB6LCAxXVxuICBdXG59XG5cbnZhciByZWQgICA9IHtpZDogJ3JlZCcsICAgY29sb3I6IFsxLCAwLCAwLCAxXX1cbnZhciBncmVlbiA9IHtpZDogJ2dyZWVuJywgY29sb3I6IFswLCAxLCAwLCAxXX1cbnZhciBibHVlICA9IHtpZDogJ2JsdWUnLCAgY29sb3I6IFswLCAwLCAxLCAxXX1cbnZhciB3aGl0ZSA9IHtpZDogJ3doaXRlJywgY29sb3I6IFsxLCAxLCAxLCAxXX1cblxuICBcbnZhciBxdWFkcyAgPSBnZXRSZW5kZXJhYmxlKClcbnNjcmVlbi5hZGRSZW5kZXJhYmxlKHF1YWRzKVxucXVhZHMuYWRkKHtcbiAgY29sb3IgOiByZWQsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHZlcnRpY2VzIDogc3F1YXJlKC4yNSwgMCwgLjcsIC4wNSlcbn0pXG5xdWFkcy5hZGQoe1xuICBjb2xvciA6IGdyZWVuLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAuMjUsIC43LCAuMDUpXG59KVxucXVhZHMuYWRkKHtcbiAgY29sb3IgOiBibHVlLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAwLCAuOSwgLjA1KVxufSlcbnF1YWRzLmFkZCh7XG4gIGNvbG9yIDogd2hpdGUsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHZlcnRpY2VzIDogc3F1YXJlKDAsIDAsIC43LCAuMDEpXG59KVxuXG5mdW5jdGlvbiBNeVJlbmRlclNldChmcmFtZWJ1ZmZlcnMpIHtcblxuICB0aGlzLmZyYW1lYnVmZmVycyA9IGZyYW1lYnVmZmVycztcbiAgdGhpcy5jYW1lcmFzID0gW107XG4gIHRoaXMuY2FtZXJhID0gbnVsbDtcbiAgXG4gIGZvciAodmFyIGZmID0gMDsgZmYgPCAxOyArK2ZmKSB7XG4gICAgdmFyIGM7XG4gICAgdGhpcy5jYW1lcmFzLnB1c2goYyA9IG5ldyBCYXNpY0NhbWVyYShmcmFtZWJ1ZmZlcnMuc2l6ZSwgZnJhbWVidWZmZXJzLnNpemUsIC4xLCA0MDk2KSk7XG4gICAgYy5zZXRGT1YoOTAsIHRydWUpO1xuICB9XG4gIFxuICAvLyB0aGlzLmNhbWVyYXNbMl0ucm90YXRlQnkoMCwgTWF0aC5QSS8yLCAwKTtcbiAgLy8gdGhpcy5jYW1lcmFzWzNdLnJvdGF0ZUJ5KDAsIC1NYXRoLlBJLzIsIDApO1xuICAvLyB0aGlzLmNhbWVyYXNbNV0ucm90YXRlQnkoMCwgTWF0aC5QSSwgTWF0aC5QSSk7XG4gIC8vIHRoaXMuY2FtZXJhc1sxXS5yb3RhdGVCeSgwLCBNYXRoLlBJLCAtTWF0aC5QSS8yKTtcbiAgLy8gdGhpcy5jYW1lcmFzWzRdLnJvdGF0ZUJ5KDAsIE1hdGguUEksIDApO1xuICAvLyB0aGlzLmNhbWVyYXNbMF0ucm90YXRlQnkoMCwgTWF0aC5QSSwgTWF0aC5QSS8yKTtcblxuICB0aGlzLmNhbWVyYXNbMF0ucm90YXRlQnkoMCwgTWF0aC5QSSwgMCk7XG4gIFxuICBSZW5kZXJTZXQuY2FsbCh0aGlzKVxufVxudXRpbC5pbmhlcml0cyhNeVJlbmRlclNldCwgUmVuZGVyU2V0KVxuXG5NeVJlbmRlclNldC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKGdsKSB7XG4gIGZvciAodmFyIGZmID0gMDsgZmYgPCAxOyArK2ZmKSB7XG4gICAgdGhpcy5mcmFtZWJ1ZmZlcnMuYmluZChmZik7XG4gICAgdGhpcy5jYW1lcmEgPSB0aGlzLmNhbWVyYXNbZmZdO1xuICAgIFJlbmRlclNldC5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcywgZ2wpO1xuICB9XG4gIHRoaXMuZnJhbWVidWZmZXJzLnVuYmluZCgpO1xufVxuXG5mdW5jdGlvbiBNeUZyYW1lYnVmZmVyKHNpemUsIG9wdF9kZXB0aCkge1xuICB0aGlzLnNpemUgPSBzaXplO1xuICB0aGlzLmRlcHRoID0gb3B0X2RlcHRoO1xuICB2YXIgdGV4ID0ge1xuICAgIHRleHR1cmUgOiB0d2dsLmNyZWF0ZVRleHR1cmUoZ2wsIHtcbiAgICAgIHRhcmdldCA6IGdsLlRFWFRVUkVfMkQsXG4gICAgICB3aWR0aCAgOiB0aGlzLnNpemUsXG4gICAgICBoZWlnaHQgOiB0aGlzLnNpemUsXG4gICAgICBtaW4gICAgOiBnbC5MSU5FQVIsXG4gICAgICBtYWcgICAgOiBnbC5MSU5FQVIsXG4gICAgICBmb3JtYXQgOiBnbC5SR0JBLFxuICAgICAgdHlwZSAgIDogZ2wuVU5TSUdORURfQllURSxcbiAgICAgIHdyYXBTICA6IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICB3cmFwVCAgOiBnbC5DTEFNUF9UT19FREdFXG4gICAgfSlcbiAgfVxuICBpZiAodGhpcy5kZXB0aCkge1xuICAgIHZhciBkYiA9IGdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBkYik7XG4gICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZShcbiAgICAgICAgZ2wuUkVOREVSQlVGRkVSLCBnbC5ERVBUSF9DT01QT05FTlQxNiwgdGhpcy5zaXplLCB0aGlzLnNpemUpO1xuICB9XG4gIHRoaXMuZnJhbWVidWZmZXJzID0gW107XG4gIGZvciAodmFyIGZmID0gMDsgZmYgPCAxOyArK2ZmKSB7XG4gICAgdmFyIGZiID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGZiKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChcbiAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXG4gICAgICAgIGdsLkNPTE9SX0FUVEFDSE1FTlQwLFxuICAgICAgICBnbC5URVhUVVJFXzJELFxuICAgICAgICB0ZXgudGV4dHVyZSxcbiAgICAgICAgMCk7XG4gICAgaWYgKHRoaXMuZGVwdGgpIHtcbiAgICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKFxuICAgICAgICAgIGdsLkZSQU1FQlVGRkVSLFxuICAgICAgICAgIGdsLkRFUFRIX0FUVEFDSE1FTlQsXG4gICAgICAgICAgZ2wuUkVOREVSQlVGRkVSLFxuICAgICAgICAgIGRiKTtcbiAgICB9XG4gICAgdmFyIHN0YXR1cyA9IGdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMoZ2wuRlJBTUVCVUZGRVIpO1xuICAgIGlmIChzdGF0dXMgIT0gZ2wuRlJBTUVCVUZGRVJfQ09NUExFVEUpIHtcbiAgICAgIHRocm93KFwiZ2wuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cygpIHJldHVybmVkIFwiICsgc3RhdHVzKTtcbiAgICB9XG4gICAgdGhpcy5mcmFtZWJ1ZmZlcnMucHVzaChmYik7XG4gIH1cbiAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICB0aGlzLnRleHR1cmUgPSB0ZXg7XG59XG5cbk15RnJhbWVidWZmZXIucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihmYWNlKSB7XG4gIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mcmFtZWJ1ZmZlcnNbZmFjZV0pO1xuICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XG59O1xuXG5NeUZyYW1lYnVmZmVyLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgZ2wudmlld3BvcnQoXG4gICAgICAwLCAwLFxuICAgICAgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoIHx8IGdsLmNhbnZhcy53aWR0aCxcbiAgICAgIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQgfHwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG5cbnZhciBteUZCTyA9IG5ldyBNeUZyYW1lYnVmZmVyKDEwMjQsIHRydWUpO1xubXlGQk8udW5iaW5kKClcblxuOyhmdW5jdGlvbiAoKSB7XG5cbiAgXG4gIHZhciBteVJlbmRlclNldCA9IG5ldyBNeVJlbmRlclNldChteUZCTylcblxuICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICcgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247IFxcbicgK1xuICAgICAgJyAgdl9wb3NpdGlvbiAgPSBpbnZlcnNlX2NhbWVyYSAqIHBvc2l0aW9uOyBcXG4nXG4gICAgKVxuICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nICtcbiAgICAgICcgICAodl9wb3NpdGlvbi54ICsgMS4wKSAvIDIuMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nICtcbiAgICAgICcgICAodl9wb3NpdGlvbi55ICsgMS4wKSAvIDIuMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nICtcbiAgICAgICcgICAodl9wb3NpdGlvbi56ICsgMS4wKSAvIDIuMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nICtcbiAgICAgICcgICAxLjApOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nXG4gICAgKVxuICAgIFxuICB9KVxuICBzaGFkZXIuYXR0cmlidXRlcy5wb3NpdGlvbiAgICA9ICd2ZWM0JztcbiAgc2hhZGVyLnZlcnRleF91bmlmb3Jtcy5pbnZlcnNlX2NhbWVyYSA9ICdtYXQ0JztcbiAgc2hhZGVyLnZhcnlpbmdzLnZfcG9zaXRpb24gICAgPSAndmVjNCc7XG5cbiAgdmFyIHBsYXRlID0gbmV3IFBsYXRlKHNoYWRlcik7XG4gIHBsYXRlLmFkZCh7ejogLS41fSlcbiAgXG4gIHZhciB1bmlmb3JtcyA9IHt9O1xuICB2YXIgbWF0MSA9IG00LmlkZW50aXR5KG5ldyBGbG9hdDMyQXJyYXkoMTYpKTtcbiAgdmFyIG1hdDIgPSBtNC5pZGVudGl0eShuZXcgRmxvYXQzMkFycmF5KDE2KSk7XG4gIHZhciBtYXQzID0gbTQuaWRlbnRpdHkobmV3IEZsb2F0MzJBcnJheSgxNikpO1xuICBcbiAgbXlSZW5kZXJTZXQuYWRkUmVuZGVyYWJsZShxdWFkcylcbiAgLy8gbXlSZW5kZXJTZXQuYWRkUmVuZGVyYWJsZSh7XG4gIC8vICAgcmVuZGVyT3JkZXI6IDEwLFxuICAvLyAgIHJlbmRlciA6IGZ1bmN0aW9uIChnbCkge1xuICAvLyAgICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgLy9cbiAgLy8gICAgIG15UmVuZGVyU2V0LmNhbWVyYS5jb21wdXRlTWF0cml4KClcbiAgLy8gICAgIG00LmludmVyc2UobXlSZW5kZXJTZXQuY2FtZXJhLnBlcnNwZWN0aXZlLCBtYXQxKTtcbiAgLy8gICAgIG00LmludmVyc2UobXlSZW5kZXJTZXQuY2FtZXJhLnNreW9yaWVudGF0aW9uLCBtYXQyKTtcbiAgLy8gICAgIG00Lm11bHRpcGx5KG1hdDEsIG1hdDIsIG1hdDMpO1xuICAvLyAgICAgdW5pZm9ybXMuaW52ZXJzZV9jYW1lcmEgPSBtYXQzO1xuICAvL1xuICAvLyAgICAgdmFyIGdlb20gPSBwbGF0ZS5nZXRHZW9tZXRyeShnbCk7XG4gIC8vICAgICBwbGF0ZS5kcmF3UHJlcChnZW9tLCB1bmlmb3Jtcyk7XG4gIC8vICAgICBnZW9tLmRyYXcoKTtcbiAgLy9cbiAgLy8gICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgLy8gICB9XG4gIC8vIH0pXG4gIFxuXG4gIHNjcmVlbi5hZGRSZW5kZXJhYmxlKHtcbiAgICByZW5kZXJPcmRlciA6IDIsXG4gICAgcmVuZGVyIDogZnVuY3Rpb24gKGdsKSB7XG4gICAgICBteVJlbmRlclNldC5yZW5kZXIoZ2wpXG4gICAgfVxuICB9KVxuXG59KCkpXG4gIFxuOyhmdW5jdGlvbiAoKSB7XG4gIFxuICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICcgIHZfcG9zICAgICAgID0gY2FtZXJhICogcG9zaXRpb247IFxcbicgK1xuICAgICAgJyAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIDAuNSwgMS4wKTsgXFxuJ1xuICAgICkgXG4gIH0sIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgJyAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcbicrXG4gICAgICAnICAgICAgdGV4dHVyZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJytcbiAgICAgICcgICAgICB2ZWMyKHZfcG9zLngsIHZfcG9zLnkpKTsgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nXG4gICAgKVxuICB9KVxuICBzaGFkZXIuYXR0cmlidXRlcy5wb3NpdGlvbiAgICAgICAgICAgICAgPSAndmVjNCc7XG4gIHNoYWRlci5mcmFnbWVudF91bmlmb3Jtcy50ZXh0dXJlICAgICAgICA9ICdzYW1wbGVyMkQnO1xuICBzaGFkZXIudmVydGV4X3VuaWZvcm1zLmNhbWVyYSAgICAgICAgICAgPSAnbWF0NCc7XG4gIHNoYWRlci52YXJ5aW5ncy52X3BvcyAgICAgICAgICAgICAgICAgICA9ICd2ZWM0JztcbiAgXG4gIHZhciBwbGF0ZSA9IG5ldyBQbGF0ZShzaGFkZXIpO1xuICBwbGF0ZS50ZXh0dXJlRGF0YSA9IHt0ZXh0dXJlIDogbXlGQk8udGV4dHVyZX1cbiAgcGxhdGUuYWRkKHt6OiAxfSlcbiAgXG4gIHZhciB1bmlmb3JtcyA9IHt9O1xuXG4gIHZhciBpbnZlcnNlID0gbTQuaWRlbnRpdHkobmV3IEZsb2F0MzJBcnJheSgxNikpO1xuICBcbiAgXG4gIHNjcmVlbi5hZGRSZW5kZXJhYmxlKHtcbiAgICByZW5kZXJPcmRlciA6IDMsXG4gICAgcmVuZGVyIDogZnVuY3Rpb24gKGdsKSB7XG4gICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgIGdsLmJsZW5kRXF1YXRpb25TZXBhcmF0ZSggZ2wuRlVOQ19BREQsIGdsLkZVTkNfQUREICk7XG4gICAgICBnbC5ibGVuZEZ1bmNTZXBhcmF0ZShnbC5PTkVfTUlOVVNfRFNUX0FMUEhBLCBnbC5EU1RfQUxQSEEsIGdsLk9ORSwgZ2wuT05FKTtcbiAgICAgIGNhbWVyYS5jb21wdXRlTWF0cml4KClcbiAgICAgIG00LmludmVyc2UoY2FtZXJhLnNreW1hdHJpeCwgaW52ZXJzZSk7XG4gICAgICB1bmlmb3Jtcy5jYW1lcmEgPSBpbnZlcnNlO1xuICAgICAgdW5pZm9ybXMudGV4dHVyZSA9IHBsYXRlLnRleHR1cmVEYXRhLnRleHR1cmUudGV4dHVyZTtcbiAgICAgIHZhciBnZW9tID0gcGxhdGUuZ2V0R2VvbWV0cnkoZ2wpO1xuICAgICAgcGxhdGUuZHJhd1ByZXAoZ2VvbSwgdW5pZm9ybXMpO1xuICAgICAgZ2VvbS5kcmF3KCk7XG4gICAgICBnbC5kaXNhYmxlKGdsLkJMRU5EKTtcbiAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICB9XG4gIH0pXG5cbn0oKSk7XG5cbnNjcmVlbi5iZWdpbkZyYW1lUmVuZGVyaW5nKGZhbHNlKVxuXG5cbmZ1bmN0aW9uIGNsaWNrKHgsIHkpIHtcbiAgY29uc29sZS5sb2coTWF0aC5mbG9vcih4KSwgTWF0aC5mbG9vcih5KSlcbn1cblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgdmFyIHJlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY2xpY2soKGUuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoICogY2FtZXJhLmZyYW1lV2lkdGgsIChlLmNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCAqIGNhbWVyYS5mcmFtZUhlaWdodClcbn0pIl19
