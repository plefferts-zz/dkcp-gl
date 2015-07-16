require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/sprite/index.js":[function(require,module,exports){
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



},{"../../src/dkcp-gl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/dkcp-gl.js"}]},{},["/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/sprite/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9zcHJpdGUvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRGtjcEdsICAgICAgICAgICAgPSByZXF1aXJlKCcuLi8uLi9zcmMvZGtjcC1nbCcpXG5cbnZhciBSZW5kZXJhYmxlICAgICAgICA9IERrY3BHbC5SZW5kZXJhYmxlXG52YXIgTW9kZWwgICAgICAgICAgICAgPSBEa2NwR2wuTW9kZWxcbnZhciBzaGFkZXJzICAgICAgICAgICA9IERrY3BHbC5zaGFkZXJzXG52YXIgU2hhZGVyICAgICAgICAgICAgPSBEa2NwR2wuU2hhZGVyXG52YXIgVGV4dHVyZSAgICAgICAgICAgPSBEa2NwR2wuVGV4dHVyZVxuXG52YXIgbWFpbiA9IG5ldyBEa2NwR2woe1xuICBjYW52YXMgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG4gIGZyYW1lUmF0ZSA6IHtcbiAgICBlbGVtZW50IDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZyYW1lcmF0ZScpXG4gIH0sXG4gIHdhc2QgOiB7XG4gICAgZG9jdW1lbnQgOiBkb2N1bWVudCxcbiAgICBkZWx0YSA6IC4wNSxcbiAgICB0aGV0YSA6IC1NYXRoLlBJIC8gMTIwXG4gIH1cbn0pXG52YXIgY2FtZXJhID0gbWFpbi5jYW1lcmE7XG52YXIgc2NyZWVuID0gbWFpbi5zY3JlZW47XG52YXIgZ2wgICAgID0gbWFpbi5zY3JlZW4uZ2w7XG5cbnZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuXG5mdW5jdGlvbiBnZXRSZW5kZXJhYmxlKCkge1xuICByZXR1cm4gbmV3IFJlbmRlcmFibGUoe1xuICAgIGJlZm9yZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGdsLmNsZWFyQ29sb3IoMC45LDAuOSwwLjksMS4wKTtcbiAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKVxuICAgIH0sXG4gICAgZ2V0VW5pZm9ybXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjYW1lcmEgOiBjYW1lcmEuY29tcHV0ZU1hdHJpeCgpLFxuICAgICAgICB0ZXh0dXJlIDogdGhpcy50ZXh0dXJlLmdldFRleHR1cmUoKS50ZXh0dXJlXG4gICAgICB9XG4gICAgfSxcbiAgICBmYWN0b3J5IDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLnRleHR1cmUpIHtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gbmV3IFRleHR1cmUobWFpbi5zY3JlZW4uZ2wsIGltZylcbiAgICAgIH1cblxuICAgICAgdmFyIHNoYWRlciA9IG5ldyBTaGFkZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJyAgZ2xfUG9zaXRpb24gPSBjYW1lcmEgKiBwb3NpdGlvbjsgXFxuJyArIFxuICAgICAgICAgICAgICAgJyAgZl90ZXhDb29yZCA9IHRleENvb3JkOyBcXG4nXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgJyAgZmxvYXQgdHhXaWR0aCAgPSAyNTYuMDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJytcbiAgICAgICAgICAnICBmbG9hdCB0eEhlaWdodCA9IDI1Ni4wOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nK1xuICAgICAgICAgICcgIHZlYzIgY2xhbXBlZCA9IHZlYzIoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcbicrXG4gICAgICAgICAgJyAgICAgKGZsb2F0KGludChmX3RleENvb3JkLnggKiAodHhXaWR0aCAtIDEuMCkgKSkpLyh0eFdpZHRoIC0gMS4wKSwgIFxcbicrXG4gICAgICAgICAgJyAgICAgKGZsb2F0KGludChmX3RleENvb3JkLnkgKiAodHhIZWlnaHQgLSAxLjApKSkpLyh0eEhlaWdodCAtIDEuMCkgIFxcbicrXG4gICAgICAgICAgJyAgKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJytcbiAgICAgICAgICAnICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodGV4dHVyZSwgY2xhbXBlZCk7ICAgICAgICAgICAgICBcXG4nK1xuICAgICAgICAgICcgICBpZiAoZ2xfRnJhZ0NvbG9yLmEgPCAwLjk5OSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcbicrXG4gICAgICAgICAgJyAgICAgZGlzY2FyZDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJytcbiAgICAgICAgICAnJ1xuICAgICAgICApXG4gICAgICB9KVxuICAgICAgc2hhZGVyLmZyYWdtZW50X3VuaWZvcm1zLnRleHR1cmUgPSAnc2FtcGxlcjJEJztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLnBvc2l0aW9uICAgICAgID0gJ3ZlYzQnO1xuICAgICAgc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmQgICAgICAgPSAndmVjMic7XG4gICAgICBzaGFkZXIudmFyeWluZ3MuZl90ZXhDb29yZCAgICAgICA9ICd2ZWMyJztcbiAgICAgIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXMuY2FtZXJhICAgID0gJ21hdDQnO1xuXG4gICAgICB2YXIgbSAgICAgICAgICAgICAgICAgICAgPSBuZXcgTW9kZWwodGhpcywgc2hhZGVyLCAxMDApXG4gICAgICBtLmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCA0LCAnRmxvYXQzMkFycmF5JywgZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udmVydGljZXNbaV1cbiAgICAgIH0pO1xuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ3RleENvb3JkJywgMiwgJ0Zsb2F0MzJBcnJheScsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBbWzAsMF0sWzAsMV0sWzEsMF0sWzEsMV1dW2ldXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgbS50ZXh0dXJlRGF0YSA9IHt0ZXh0dXJlIDogdGhpcy50ZXh0dXJlLmdldFRleHR1cmUoKX1cbiAgXG4gICAgICByZXR1cm4gbVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0U3ByaXRlUmVuZGVyYWJsZSgpIHtcbiAgcmV0dXJuIG5ldyBSZW5kZXJhYmxlKHtcbiAgICBnZXRVbmlmb3JtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNhbWVyYSA6IGNhbWVyYS5jb21wdXRlTWF0cml4KCksXG4gICAgICAgIGFzcGVjdCA6IGNhbWVyYS5nZXRBc3BlY3QoKSxcbiAgICAgICAgdGV4dHVyZSA6IHRoaXMudGV4dHVyZS5nZXRUZXh0dXJlKCkudGV4dHVyZVxuICAgICAgfVxuICAgIH0sXG4gICAgZmFjdG9yeSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy50ZXh0dXJlKSB7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IG5ldyBUZXh0dXJlKG1haW4uc2NyZWVuLmdsLCBpbWcpXG4gICAgICB9XG5cbiAgICAgIHZhciBzaGFkZXIgPSBuZXcgU2hhZGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAnIHZlYzQgcG9zID0gY2FtZXJhICogcG9zaXRpb247IFxcbicgKyBcbiAgICAgICAgICAvLyAnIHZlYzQgcG9zMiA9IHZlYzQocG9zLnggLyBwb3MudywgcG9zLnkgLyBwb3MudywgcG9zLnogLyBwb3MudywgMS4wKTsgXFxuJyArXG4gICAgICAgICAgJyBnbF9Qb3NpdGlvbiA9IHBvcyArIG9mZnNldCAqIGFzcGVjdDsgXFxuJyArIFxuICAgICAgICAgICcgZl90ZXhDb29yZCA9IHRleENvb3JkOyBcXG4nXG4gICAgICAgIClcbiAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAnICBmbG9hdCB0eFdpZHRoICA9IDI1Ni4wOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nK1xuICAgICAgICAgICcgIGZsb2F0IHR4SGVpZ2h0ID0gMjU2LjA7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcbicrXG4gICAgICAgICAgJyAgdmVjMiBjbGFtcGVkID0gdmVjMiggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJytcbiAgICAgICAgICAnICAgICAoZmxvYXQoaW50KGZfdGV4Q29vcmQueCAqICh0eFdpZHRoIC0gMS4wKSApKSkvKHR4V2lkdGggLSAxLjApLCAgXFxuJytcbiAgICAgICAgICAnICAgICAoZmxvYXQoaW50KGZfdGV4Q29vcmQueSAqICh0eEhlaWdodCAtIDEuMCkpKSkvKHR4SGVpZ2h0IC0gMS4wKSAgXFxuJytcbiAgICAgICAgICAnICApOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nK1xuICAgICAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0ZXh0dXJlLCBjbGFtcGVkKTsgICAgICAgICAgICAgIFxcbicrXG4gICAgICAgICAgJyAgIGlmIChnbF9GcmFnQ29sb3IuYSA8IDAuOTk5KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuJytcbiAgICAgICAgICAnICAgICBkaXNjYXJkOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG4nK1xuICAgICAgICAgICcnXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICBzaGFkZXIuZnJhZ21lbnRfdW5pZm9ybXMudGV4dHVyZSA9ICdzYW1wbGVyMkQnO1xuICAgICAgc2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24gICAgICAgPSAndmVjNCc7XG4gICAgICBzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZCAgICAgICA9ICd2ZWMyJztcbiAgICAgIHNoYWRlci52YXJ5aW5ncy5mX3RleENvb3JkICAgICAgID0gJ3ZlYzInO1xuICAgICAgc2hhZGVyLnZlcnRleF91bmlmb3Jtcy5jYW1lcmEgICAgPSAnbWF0NCc7XG4gICAgICBzaGFkZXIudmVydGV4X3VuaWZvcm1zLmFzcGVjdCAgICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLm9mZnNldCAgICAgICAgID0gJ3ZlYzQnO1xuXG4gICAgICB2YXIgbSAgICAgICAgICAgICAgICAgICAgPSBuZXcgTW9kZWwodGhpcywgc2hhZGVyLCAxMDApXG4gICAgICBtLmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCA0LCAnRmxvYXQzMkFycmF5JywgZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udmVydGljZXNcbiAgICAgIH0pO1xuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ29mZnNldCcsIDQsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICB2YXIgdyA9IGl0ZW0ud2lkdGhcbiAgICAgICAgdmFyIGggPSBpdGVtLmhlaWdodFxuICAgICAgICByZXR1cm4gW1stdywgLWgsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFstdywgIGgsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsgdywgLWgsIDAsIDBdLFxuICAgICAgICAgICAgICAgIFsgdywgIGgsIDAsIDBdXG4gICAgICAgIF1baV1cbiAgICAgIH0pO1xuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ3RleENvb3JkJywgMiwgJ0Zsb2F0MzJBcnJheScsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBbWzAsMF0sWzAsMV0sWzEsMF0sWzEsMV1dW2ldXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgbS50ZXh0dXJlRGF0YSA9IHt0ZXh0dXJlIDogdGhpcy50ZXh0dXJlLmdldFRleHR1cmUoKX1cbiAgXG4gICAgICByZXR1cm4gbVxuICAgIH1cbiAgfSlcbn1cblxuXG52YXIgc3F1YXJlID0gZnVuY3Rpb24gKHgsIHksIHosIHcpIHtcbiAgcmV0dXJuIFtcbiAgICBbeCAtIHcsICB5IC0gdywgeiwgMV0sXG4gICAgW3ggLSB3LCAgeSArIHcsIHosIDFdLFxuICAgIFt4ICsgdywgIHkgLSB3LCB6LCAxXSxcbiAgICBbeCArIHcsICB5ICsgdywgeiwgMV1cbiAgXVxufVxuXG5cbnZhciBzcHJpdGUgPSBmdW5jdGlvbiAoeCwgeSwgeikge1xuICByZXR1cm4gW3gsIHksIHosIDFdXG59XG5cbnZhciBxdWFkcyAgPSBnZXRSZW5kZXJhYmxlKClcbnNjcmVlbi5hZGRSZW5kZXJhYmxlKHF1YWRzKVxudmFyIHNwcml0ZVF1YWRzICA9IGdldFNwcml0ZVJlbmRlcmFibGUoKVxuc2NyZWVuLmFkZFJlbmRlcmFibGUoc3ByaXRlUXVhZHMpXG5cbnZhciBzdGFydGVkID0gZmFsc2VcbnZhciBzdGFydCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoc3RhcnRlZCkgcmV0dXJuXG4gIHN0YXJ0ZWQgPSB0cnVlXG5cbiAgcXVhZHMuYWRkKHtcbiAgICBjb2xvciA6IDEsXG4gICAgYWxsb2NhdGlvbnMgOiB7fSxcbiAgICB2ZXJ0aWNlcyA6IHNxdWFyZSguMjUsIDAsIC43LCAuMDUpXG4gIH0pXG4gIHF1YWRzLmFkZCh7XG4gICAgY29sb3IgOiAyLFxuICAgIGFsbG9jYXRpb25zIDoge30sXG4gICAgdmVydGljZXMgOiBzcXVhcmUoMCwgLjI1LCAuNywgLjA1KVxuICB9KVxuICBxdWFkcy5hZGQoe1xuICAgIGNvbG9yIDogMyxcbiAgICBhbGxvY2F0aW9ucyA6IHt9LFxuICAgIHZlcnRpY2VzIDogc3F1YXJlKDAsIDAsIC45LCAuMDUpXG4gIH0pXG4gIHNwcml0ZVF1YWRzLmFkZCh7XG4gICAgY29sb3IgOiA0LFxuICAgIGFsbG9jYXRpb25zIDoge30sXG4gICAgdmVydGljZXMgOiBzcHJpdGUoMCwgMCwgLjcsIC4wNSksXG4gICAgd2lkdGg6IC4wNCxcbiAgICBoZWlnaHQ6IC4wNFxuICB9KVxufVxuXG5pbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ2ltZyBsb2FkZWQnKVxuICBzdGFydCgpXG4gIHNjcmVlbi5iZWdpbkZyYW1lUmVuZGVyaW5nKGZhbHNlKVxufSlcbmltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsICcuLi9pbWcvaW1nLnBuZycpXG5cblxuIl19
