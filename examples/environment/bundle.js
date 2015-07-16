require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/environment/index.js":[function(require,module,exports){
var twgl              = require('../../lib/twgl')
var m4                = require('../../lib/twgl').m4
var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var Plate             = DkcpGl.Plate
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation
var Environment       = DkcpGl.Environment

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
    getUniforms : function () {
      return {
        camera : camera.computeMatrix()
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

function CubeFramebuffer(size, opt_depth) {
  var faceTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];

  this.size = size;
  this.depth = opt_depth;
  var tex = {
    texture : twgl.createTexture(gl, {
      target : gl.TEXTURE_CUBE_MAP,
      width  : this.size,
      height : this.size,
      min    : gl.LINEAR,
      mag    : gl.LINEAR,
      format : gl.RGBA,
      type   : gl.UNSIGNED_BYTE,
      wrapS  : gl.CLAMP_TO_EDGE,
      wrapT  : gl.CLAMP_TO_EDGE,
      // unpackAlignment
      // premultiplyAlpha
      // flipY
      // colorspaceConversion
      // color
      // src    : undefined,
    })
  }
  // gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex.texture);
  // tex.setParameter(gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // tex.setParameter(gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // tex.setParameter(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // tex.setParameter(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // for (var ff = 0; ff < 6; ++ff) {
  //   gl.texImage2D(faceTargets[ff],
  //                 0,                 // level
  //                 gl.RGBA,           // internalFormat
  //                 this.size,         // width
  //                 this.size,         // height
  //                 0,                 // border
  //                 gl.RGBA,           // format
  //                 gl.UNSIGNED_BYTE,  // type
  //                 null);             // data
  // }
  if (this.depth) {
    var db = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, db);
    gl.renderbufferStorage(
        gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);
  }
  this.framebuffers = [];
  for (var ff = 0; ff < 6; ++ff) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        faceTargets[ff],
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
      throw("gl.checkFramebufferStatus() returned " + WebGLDebugUtils.glEnumToString(status));
    }
    this.framebuffers.push(fb);
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  this.texture = tex;
}
/**
 * Binds a face as the current render target.
 * @param {number} face The face to use as the render target.
 */
CubeFramebuffer.prototype.bind = function(face) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[face]);
  gl.viewport(0, 0, this.size, this.size);
};

/**
 * Unbinds this framebuffer as the current render target.
 */
CubeFramebuffer.prototype.unbind = function() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(
      0, 0,
      gl.drawingBufferWidth || gl.canvas.width,
      gl.drawingBufferHeight || gl.canvas.height);
};


var cubeFBO = new CubeFramebuffer(1024, true);
cubeFBO.unbind()

;(function () {

  
  var environment = new Environment(cubeFBO)

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
  environment.addRenderable({
    renderOrder: 10,
    render : function (gl) {
      gl.disable(gl.DEPTH_TEST);

      environment.camera.computeMatrix()
      m4.inverse(environment.camera.perspective, mat1);
      m4.inverse(environment.camera.skyorientation, mat2);
      m4.multiply(mat1, mat2, mat3);
      uniforms.inverse_camera = mat3;

      var geom = plate.getGeometry(gl);
      plate.drawPrep(geom, uniforms);
      geom.draw();

      gl.enable(gl.DEPTH_TEST);
    }
  })
  
  screen.addRenderable({
    renderOrder : 2,
    render : function (gl) {
      environment.render(gl)
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
      '  gl_FragColor = textureCube(                            \n'+
      '      texture,                                           \n'+
      '      vec3(v_pos.xyz / v_pos.w));                        \n'
    )
  })
  shader.attributes.position              = 'vec4';
  shader.fragment_uniforms.texture        = 'samplerCube';
  shader.vertex_uniforms.camera           = 'mat4';
  shader.varyings.v_pos                   = 'vec4';
  
  var plate = new Plate(shader);
  plate.textureData = {texture : cubeFBO.texture}
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

},{"../../lib/twgl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/lib/twgl.js","../../src/dkcp-gl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/dkcp-gl.js"}]},{},["/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/environment/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9lbnZpcm9ubWVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHR3Z2wgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vLi4vbGliL3R3Z2wnKVxudmFyIG00ICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vLi4vbGliL3R3Z2wnKS5tNFxudmFyIERrY3BHbCAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vLi4vc3JjL2RrY3AtZ2wnKVxuXG52YXIgUmVuZGVyYWJsZSAgICAgICAgPSBEa2NwR2wuUmVuZGVyYWJsZVxudmFyIE1vZGVsICAgICAgICAgICAgID0gRGtjcEdsLk1vZGVsXG52YXIgUGxhdGUgICAgICAgICAgICAgPSBEa2NwR2wuUGxhdGVcbnZhciBzaGFkZXJzICAgICAgICAgICA9IERrY3BHbC5zaGFkZXJzXG52YXIgU2hhZGVyICAgICAgICAgICAgPSBEa2NwR2wuU2hhZGVyXG52YXIgQWxsb2NhdGlvbiAgICAgICAgPSBEa2NwR2wuQWxsb2NhdGlvblxudmFyIEVudmlyb25tZW50ICAgICAgID0gRGtjcEdsLkVudmlyb25tZW50XG5cbnZhciBtYWluID0gbmV3IERrY3BHbCh7XG4gIGNhbnZhcyA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgZnJhbWVSYXRlIDoge1xuICAgIGVsZW1lbnQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVyYXRlJylcbiAgfSxcbiAgd2FzZCA6IHtcbiAgICBkb2N1bWVudCA6IGRvY3VtZW50LFxuICAgIGRlbHRhIDogLjA1LFxuICAgIHRoZXRhIDogLU1hdGguUEkgLyAxMjBcbiAgfVxufSlcbnZhciBjYW1lcmEgPSBtYWluLmNhbWVyYTtcbnZhciBzY3JlZW4gPSBtYWluLnNjcmVlbjtcbnZhciBnbCAgICAgPSBtYWluLnNjcmVlbi5nbDtcblxuZnVuY3Rpb24gZ2V0UmVuZGVyYWJsZSgpIHtcbiAgcmV0dXJuIG5ldyBSZW5kZXJhYmxlKHtcbiAgICBiZWZvcmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBnbC5jbGVhckNvbG9yKDAsMCwwLDApO1xuICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpXG4gICAgfSxcbiAgICByZW5kZXJPcmRlciA6IDEsXG4gICAgZ2V0VW5pZm9ybXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjYW1lcmEgOiBjYW1lcmEuY29tcHV0ZU1hdHJpeCgpXG4gICAgICB9XG4gICAgfSxcbiAgICBmYWN0b3J5IDogZnVuY3Rpb24gKCkge1xuICAgICAgXG4gICAgICB2YXIgbWF4Q29sb3JzID0gMTAwXG4gICAgICB2YXIgY29sb3JBbGxvY2F0aW9uID0gbmV3IEFsbG9jYXRpb24uRmxvYXQobWF4Q29sb3JzLCA0KVxuXG4gICAgICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9Qb3NpdGlvbiA9IGNhbWVyYSAqIHBvc2l0aW9uOyBcXG4nICsgXG4gICAgICAgICAgICAgICAnICBmX2NvbG9yID0gY29sb3JzW2ludChjb2xvcildOyBcXG4nXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9GcmFnQ29sb3IgPSBmX2NvbG9yIDtcXG4nXG4gICAgICB9KVxuICAgICAgc2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24gICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLmNvbG9yICAgICAgPSAnZmxvYXQnO1xuICAgICAgc2hhZGVyLnZhcnlpbmdzLmZfY29sb3IgICAgICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXMuY2FtZXJhID0gJ21hdDQnO1xuICAgICAgc2hhZGVyLnZlcnRleF91bmlmb3Jtc1snY29sb3JzWycgKyBtYXhDb2xvcnMgKyAnXSddID0gJ3ZlYzQnO1xuXG4gICAgICB2YXIgbSA9IG5ldyBNb2RlbCh0aGlzLCBzaGFkZXIsIDEwMClcbiAgICAgIG0uYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIDQsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS52ZXJ0aWNlc1tpXVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIG0uYWRkQXR0cmlidXRlKCdjb2xvcicsIDEsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIGNvbG9yQWxsb2NhdGlvbi5hZGQoaXRlbS5jb2xvciwgaXRlbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uY29sb3IuY29sb3JcbiAgICAgICAgICB9KVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgXG4gICAgICBtLnVuaWZvcm1zLmNvbG9ycyA9IGNvbG9yQWxsb2NhdGlvbi5idWZmZXI7XG4gIFxuICAgICAgcmV0dXJuIG1cbiAgICB9XG4gIH0pXG59XG5cbnZhciBzcXVhcmUgPSBmdW5jdGlvbiAoeCwgeSwgeiwgdykge1xuICByZXR1cm4gW1xuICAgIFt4IC0gdywgIHkgLSB3LCB6LCAxXSxcbiAgICBbeCAtIHcsICB5ICsgdywgeiwgMV0sXG4gICAgW3ggKyB3LCAgeSAtIHcsIHosIDFdLFxuICAgIFt4ICsgdywgIHkgKyB3LCB6LCAxXVxuICBdXG59XG5cbnZhciByZWQgICA9IHtpZDogJ3JlZCcsICAgY29sb3I6IFsxLCAwLCAwLCAxXX1cbnZhciBncmVlbiA9IHtpZDogJ2dyZWVuJywgY29sb3I6IFswLCAxLCAwLCAxXX1cbnZhciBibHVlICA9IHtpZDogJ2JsdWUnLCAgY29sb3I6IFswLCAwLCAxLCAxXX1cbnZhciB3aGl0ZSA9IHtpZDogJ3doaXRlJywgY29sb3I6IFsxLCAxLCAxLCAxXX1cblxuICBcbnZhciBxdWFkcyAgPSBnZXRSZW5kZXJhYmxlKClcbnNjcmVlbi5hZGRSZW5kZXJhYmxlKHF1YWRzKVxucXVhZHMuYWRkKHtcbiAgY29sb3IgOiByZWQsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHZlcnRpY2VzIDogc3F1YXJlKC4yNSwgMCwgLjcsIC4wNSlcbn0pXG5xdWFkcy5hZGQoe1xuICBjb2xvciA6IGdyZWVuLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAuMjUsIC43LCAuMDUpXG59KVxucXVhZHMuYWRkKHtcbiAgY29sb3IgOiBibHVlLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAwLCAuOSwgLjA1KVxufSlcbnF1YWRzLmFkZCh7XG4gIGNvbG9yIDogd2hpdGUsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHZlcnRpY2VzIDogc3F1YXJlKDAsIDAsIC43LCAuMDEpXG59KVxuXG5mdW5jdGlvbiBDdWJlRnJhbWVidWZmZXIoc2l6ZSwgb3B0X2RlcHRoKSB7XG4gIHZhciBmYWNlVGFyZ2V0cyA9IFtcbiAgICBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1gsXG4gICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLFxuICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWSxcbiAgICBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1ksXG4gICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aLFxuICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWl07XG5cbiAgdGhpcy5zaXplID0gc2l6ZTtcbiAgdGhpcy5kZXB0aCA9IG9wdF9kZXB0aDtcbiAgdmFyIHRleCA9IHtcbiAgICB0ZXh0dXJlIDogdHdnbC5jcmVhdGVUZXh0dXJlKGdsLCB7XG4gICAgICB0YXJnZXQgOiBnbC5URVhUVVJFX0NVQkVfTUFQLFxuICAgICAgd2lkdGggIDogdGhpcy5zaXplLFxuICAgICAgaGVpZ2h0IDogdGhpcy5zaXplLFxuICAgICAgbWluICAgIDogZ2wuTElORUFSLFxuICAgICAgbWFnICAgIDogZ2wuTElORUFSLFxuICAgICAgZm9ybWF0IDogZ2wuUkdCQSxcbiAgICAgIHR5cGUgICA6IGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICB3cmFwUyAgOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgd3JhcFQgIDogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgIC8vIHVucGFja0FsaWdubWVudFxuICAgICAgLy8gcHJlbXVsdGlwbHlBbHBoYVxuICAgICAgLy8gZmxpcFlcbiAgICAgIC8vIGNvbG9yc3BhY2VDb252ZXJzaW9uXG4gICAgICAvLyBjb2xvclxuICAgICAgLy8gc3JjICAgIDogdW5kZWZpbmVkLFxuICAgIH0pXG4gIH1cbiAgLy8gZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV9DVUJFX01BUCwgdGV4LnRleHR1cmUpO1xuICAvLyB0ZXguc2V0UGFyYW1ldGVyKGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgLy8gdGV4LnNldFBhcmFtZXRlcihnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gIC8vIHRleC5zZXRQYXJhbWV0ZXIoZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAvLyB0ZXguc2V0UGFyYW1ldGVyKGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgLy8gZm9yICh2YXIgZmYgPSAwOyBmZiA8IDY7ICsrZmYpIHtcbiAgLy8gICBnbC50ZXhJbWFnZTJEKGZhY2VUYXJnZXRzW2ZmXSxcbiAgLy8gICAgICAgICAgICAgICAgIDAsICAgICAgICAgICAgICAgICAvLyBsZXZlbFxuICAvLyAgICAgICAgICAgICAgICAgZ2wuUkdCQSwgICAgICAgICAgIC8vIGludGVybmFsRm9ybWF0XG4gIC8vICAgICAgICAgICAgICAgICB0aGlzLnNpemUsICAgICAgICAgLy8gd2lkdGhcbiAgLy8gICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSwgICAgICAgICAvLyBoZWlnaHRcbiAgLy8gICAgICAgICAgICAgICAgIDAsICAgICAgICAgICAgICAgICAvLyBib3JkZXJcbiAgLy8gICAgICAgICAgICAgICAgIGdsLlJHQkEsICAgICAgICAgICAvLyBmb3JtYXRcbiAgLy8gICAgICAgICAgICAgICAgIGdsLlVOU0lHTkVEX0JZVEUsICAvLyB0eXBlXG4gIC8vICAgICAgICAgICAgICAgICBudWxsKTsgICAgICAgICAgICAgLy8gZGF0YVxuICAvLyB9XG4gIGlmICh0aGlzLmRlcHRoKSB7XG4gICAgdmFyIGRiID0gZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIGRiKTtcbiAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKFxuICAgICAgICBnbC5SRU5ERVJCVUZGRVIsIGdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XG4gIH1cbiAgdGhpcy5mcmFtZWJ1ZmZlcnMgPSBbXTtcbiAgZm9yICh2YXIgZmYgPSAwOyBmZiA8IDY7ICsrZmYpIHtcbiAgICB2YXIgZmIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZmIpO1xuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgZ2wuQ09MT1JfQVRUQUNITUVOVDAsXG4gICAgICAgIGZhY2VUYXJnZXRzW2ZmXSxcbiAgICAgICAgdGV4LnRleHR1cmUsXG4gICAgICAgIDApO1xuICAgIGlmICh0aGlzLmRlcHRoKSB7XG4gICAgICBnbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihcbiAgICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICBnbC5ERVBUSF9BVFRBQ0hNRU5ULFxuICAgICAgICAgIGdsLlJFTkRFUkJVRkZFUixcbiAgICAgICAgICBkYik7XG4gICAgfVxuICAgIHZhciBzdGF0dXMgPSBnbC5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzKGdsLkZSQU1FQlVGRkVSKTtcbiAgICBpZiAoc3RhdHVzICE9IGdsLkZSQU1FQlVGRkVSX0NPTVBMRVRFKSB7XG4gICAgICB0aHJvdyhcImdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMoKSByZXR1cm5lZCBcIiArIFdlYkdMRGVidWdVdGlscy5nbEVudW1Ub1N0cmluZyhzdGF0dXMpKTtcbiAgICB9XG4gICAgdGhpcy5mcmFtZWJ1ZmZlcnMucHVzaChmYik7XG4gIH1cbiAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICB0aGlzLnRleHR1cmUgPSB0ZXg7XG59XG4vKipcbiAqIEJpbmRzIGEgZmFjZSBhcyB0aGUgY3VycmVudCByZW5kZXIgdGFyZ2V0LlxuICogQHBhcmFtIHtudW1iZXJ9IGZhY2UgVGhlIGZhY2UgdG8gdXNlIGFzIHRoZSByZW5kZXIgdGFyZ2V0LlxuICovXG5DdWJlRnJhbWVidWZmZXIucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihmYWNlKSB7XG4gIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mcmFtZWJ1ZmZlcnNbZmFjZV0pO1xuICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XG59O1xuXG4vKipcbiAqIFVuYmluZHMgdGhpcyBmcmFtZWJ1ZmZlciBhcyB0aGUgY3VycmVudCByZW5kZXIgdGFyZ2V0LlxuICovXG5DdWJlRnJhbWVidWZmZXIucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKCkge1xuICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICBnbC52aWV3cG9ydChcbiAgICAgIDAsIDAsXG4gICAgICBnbC5kcmF3aW5nQnVmZmVyV2lkdGggfHwgZ2wuY2FudmFzLndpZHRoLFxuICAgICAgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodCB8fCBnbC5jYW52YXMuaGVpZ2h0KTtcbn07XG5cblxudmFyIGN1YmVGQk8gPSBuZXcgQ3ViZUZyYW1lYnVmZmVyKDEwMjQsIHRydWUpO1xuY3ViZUZCTy51bmJpbmQoKVxuXG47KGZ1bmN0aW9uICgpIHtcblxuICBcbiAgdmFyIGVudmlyb25tZW50ID0gbmV3IEVudmlyb25tZW50KGN1YmVGQk8pXG5cbiAgdmFyIHNoYWRlciA9IG5ldyBTaGFkZXIoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICAnICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uOyBcXG4nICtcbiAgICAgICcgIHZfcG9zaXRpb24gID0gaW52ZXJzZV9jYW1lcmEgKiBwb3NpdGlvbjsgXFxuJ1xuICAgIClcbiAgfSwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICAnICBnbF9GcmFnQ29sb3IgPSB2ZWM0KCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJyArXG4gICAgICAnICAgKHZfcG9zaXRpb24ueCArIDEuMCkgLyAyLjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJyArXG4gICAgICAnICAgKHZfcG9zaXRpb24ueSArIDEuMCkgLyAyLjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJyArXG4gICAgICAnICAgKHZfcG9zaXRpb24ueiArIDEuMCkgLyAyLjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJyArXG4gICAgICAnICAgMS4wKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJ1xuICAgIClcbiAgICBcbiAgfSlcbiAgc2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24gICAgPSAndmVjNCc7XG4gIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXMuaW52ZXJzZV9jYW1lcmEgPSAnbWF0NCc7XG4gIHNoYWRlci52YXJ5aW5ncy52X3Bvc2l0aW9uICAgID0gJ3ZlYzQnO1xuXG4gIHZhciBwbGF0ZSA9IG5ldyBQbGF0ZShzaGFkZXIpO1xuICBwbGF0ZS5hZGQoe3o6IC0uNX0pXG4gIFxuICB2YXIgdW5pZm9ybXMgPSB7fTtcbiAgdmFyIG1hdDEgPSBtNC5pZGVudGl0eShuZXcgRmxvYXQzMkFycmF5KDE2KSk7XG4gIHZhciBtYXQyID0gbTQuaWRlbnRpdHkobmV3IEZsb2F0MzJBcnJheSgxNikpO1xuICB2YXIgbWF0MyA9IG00LmlkZW50aXR5KG5ldyBGbG9hdDMyQXJyYXkoMTYpKTtcbiAgZW52aXJvbm1lbnQuYWRkUmVuZGVyYWJsZSh7XG4gICAgcmVuZGVyT3JkZXI6IDEwLFxuICAgIHJlbmRlciA6IGZ1bmN0aW9uIChnbCkge1xuICAgICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcblxuICAgICAgZW52aXJvbm1lbnQuY2FtZXJhLmNvbXB1dGVNYXRyaXgoKVxuICAgICAgbTQuaW52ZXJzZShlbnZpcm9ubWVudC5jYW1lcmEucGVyc3BlY3RpdmUsIG1hdDEpO1xuICAgICAgbTQuaW52ZXJzZShlbnZpcm9ubWVudC5jYW1lcmEuc2t5b3JpZW50YXRpb24sIG1hdDIpO1xuICAgICAgbTQubXVsdGlwbHkobWF0MSwgbWF0MiwgbWF0Myk7XG4gICAgICB1bmlmb3Jtcy5pbnZlcnNlX2NhbWVyYSA9IG1hdDM7XG5cbiAgICAgIHZhciBnZW9tID0gcGxhdGUuZ2V0R2VvbWV0cnkoZ2wpO1xuICAgICAgcGxhdGUuZHJhd1ByZXAoZ2VvbSwgdW5pZm9ybXMpO1xuICAgICAgZ2VvbS5kcmF3KCk7XG5cbiAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICB9XG4gIH0pXG4gIFxuICBzY3JlZW4uYWRkUmVuZGVyYWJsZSh7XG4gICAgcmVuZGVyT3JkZXIgOiAyLFxuICAgIHJlbmRlciA6IGZ1bmN0aW9uIChnbCkge1xuICAgICAgZW52aXJvbm1lbnQucmVuZGVyKGdsKVxuICAgIH1cbiAgfSlcblxufSgpKVxuICBcbjsoZnVuY3Rpb24gKCkge1xuICBcbiAgdmFyIHNoYWRlciA9IG5ldyBTaGFkZXIoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICAnICB2X3BvcyAgICAgICA9IGNhbWVyYSAqIHBvc2l0aW9uOyBcXG4nICtcbiAgICAgICcgIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCAwLjUsIDEuMCk7IFxcbidcbiAgICApIFxuICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmVDdWJlKCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nK1xuICAgICAgJyAgICAgIHRleHR1cmUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcbicrXG4gICAgICAnICAgICAgdmVjMyh2X3Bvcy54eXogLyB2X3Bvcy53KSk7ICAgICAgICAgICAgICAgICAgICAgICAgXFxuJ1xuICAgIClcbiAgfSlcbiAgc2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24gICAgICAgICAgICAgID0gJ3ZlYzQnO1xuICBzaGFkZXIuZnJhZ21lbnRfdW5pZm9ybXMudGV4dHVyZSAgICAgICAgPSAnc2FtcGxlckN1YmUnO1xuICBzaGFkZXIudmVydGV4X3VuaWZvcm1zLmNhbWVyYSAgICAgICAgICAgPSAnbWF0NCc7XG4gIHNoYWRlci52YXJ5aW5ncy52X3BvcyAgICAgICAgICAgICAgICAgICA9ICd2ZWM0JztcbiAgXG4gIHZhciBwbGF0ZSA9IG5ldyBQbGF0ZShzaGFkZXIpO1xuICBwbGF0ZS50ZXh0dXJlRGF0YSA9IHt0ZXh0dXJlIDogY3ViZUZCTy50ZXh0dXJlfVxuICBwbGF0ZS5hZGQoe3o6IDF9KVxuICBcbiAgdmFyIHVuaWZvcm1zID0ge307XG5cbiAgdmFyIGludmVyc2UgPSBtNC5pZGVudGl0eShuZXcgRmxvYXQzMkFycmF5KDE2KSk7XG4gIFxuICBcbiAgc2NyZWVuLmFkZFJlbmRlcmFibGUoe1xuICAgIHJlbmRlck9yZGVyIDogMyxcbiAgICByZW5kZXIgOiBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgZ2wuYmxlbmRFcXVhdGlvblNlcGFyYXRlKCBnbC5GVU5DX0FERCwgZ2wuRlVOQ19BREQgKTtcbiAgICAgIGdsLmJsZW5kRnVuY1NlcGFyYXRlKGdsLk9ORV9NSU5VU19EU1RfQUxQSEEsIGdsLkRTVF9BTFBIQSwgZ2wuT05FLCBnbC5PTkUpO1xuICAgICAgY2FtZXJhLmNvbXB1dGVNYXRyaXgoKVxuICAgICAgbTQuaW52ZXJzZShjYW1lcmEuc2t5bWF0cml4LCBpbnZlcnNlKTtcbiAgICAgIHVuaWZvcm1zLmNhbWVyYSA9IGludmVyc2U7XG4gICAgICB1bmlmb3Jtcy50ZXh0dXJlID0gcGxhdGUudGV4dHVyZURhdGEudGV4dHVyZS50ZXh0dXJlO1xuICAgICAgdmFyIGdlb20gPSBwbGF0ZS5nZXRHZW9tZXRyeShnbCk7XG4gICAgICBwbGF0ZS5kcmF3UHJlcChnZW9tLCB1bmlmb3Jtcyk7XG4gICAgICBnZW9tLmRyYXcoKTtcbiAgICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIH1cbiAgfSlcblxufSgpKTtcblxuc2NyZWVuLmJlZ2luRnJhbWVSZW5kZXJpbmcoZmFsc2UpXG4iXX0=
