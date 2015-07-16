require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
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

      var m = new Model(this, shader, maxColors)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      
      m.addAttribute('color', 1, 'Float32Array', function (i, item) {
        var color_indices = []
        var colors = item.allocations.color
        colors.forEach(function (color) {
          color_indices.push(
            colorAllocation.add(color, item, function () {
              return color.color
            })
          )
        })
        return color_indices
      });

      m.allocations.color = colorAllocation;
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

var quads  = getRenderable()
screen.addRenderable(quads)

var used = []
setInterval(function () {
  var item = quads.add({
    allocations : {
      color : [{id: Math.random(), color: [Math.random(), Math.random(), Math.random(), 1]}],
    },
    vertices : square(Math.random() * 2 - 1, Math.random() * 2 - 1, .7, .05)
  })
  
  used.push(item)
  if (used.length > 200) {
    for (var i = 0; i < 25; i ++) {
      item = used.shift()
      item.remove()
    }
    quads.removeUnused()
  }
  return arguments.callee
}(), 20)

screen.beginFrameRendering(false)

},{"../../src/dkcp-gl":15}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9hZGRyZW1vdmUvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRGtjcEdsICAgICAgICAgICAgPSByZXF1aXJlKCcuLi8uLi9zcmMvZGtjcC1nbCcpXG5cbnZhciBSZW5kZXJhYmxlICAgICAgICA9IERrY3BHbC5SZW5kZXJhYmxlXG52YXIgTW9kZWwgICAgICAgICAgICAgPSBEa2NwR2wuTW9kZWxcbnZhciBzaGFkZXJzICAgICAgICAgICA9IERrY3BHbC5zaGFkZXJzXG52YXIgU2hhZGVyICAgICAgICAgICAgPSBEa2NwR2wuU2hhZGVyXG52YXIgQWxsb2NhdGlvbiAgICAgICAgPSBEa2NwR2wuQWxsb2NhdGlvblxuXG52YXIgbWFpbiA9IG5ldyBEa2NwR2woe1xuICBjYW52YXMgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG4gIGZyYW1lUmF0ZSA6IHtcbiAgICBlbGVtZW50IDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZyYW1lcmF0ZScpXG4gIH0sXG4gIHdhc2QgOiB7XG4gICAgZG9jdW1lbnQgOiBkb2N1bWVudCxcbiAgICBkZWx0YSA6IC4wNSxcbiAgICB0aGV0YSA6IC1NYXRoLlBJIC8gMTIwXG4gIH1cbn0pXG52YXIgY2FtZXJhID0gbWFpbi5jYW1lcmE7XG52YXIgc2NyZWVuID0gbWFpbi5zY3JlZW47XG5cbmZ1bmN0aW9uIGdldFJlbmRlcmFibGUoKSB7XG4gIHJldHVybiBuZXcgUmVuZGVyYWJsZSh7XG4gICAgZ2V0VW5pZm9ybXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjYW1lcmEgOiBjYW1lcmEuY29tcHV0ZU1hdHJpeCgpXG4gICAgICB9XG4gICAgfSxcbiAgICBmYWN0b3J5IDogZnVuY3Rpb24gKCkge1xuICAgICAgXG4gICAgICB2YXIgbWF4Q29sb3JzID0gMTAwXG4gICAgICB2YXIgY29sb3JBbGxvY2F0aW9uID0gbmV3IEFsbG9jYXRpb24uRmxvYXQobWF4Q29sb3JzLCA0KVxuXG4gICAgICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9Qb3NpdGlvbiA9IGNhbWVyYSAqIHBvc2l0aW9uOyBcXG4nICsgXG4gICAgICAgICAgICAgICAnICBmX2NvbG9yID0gY29sb3JzW2ludChjb2xvcildOyBcXG4nXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9GcmFnQ29sb3IgPSBmX2NvbG9yIDtcXG4nXG4gICAgICB9KVxuICAgICAgc2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb24gICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLmNvbG9yICAgICAgPSAnZmxvYXQnO1xuICAgICAgc2hhZGVyLnZhcnlpbmdzLmZfY29sb3IgICAgICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXMuY2FtZXJhID0gJ21hdDQnO1xuICAgICAgc2hhZGVyLnZlcnRleF91bmlmb3Jtc1snY29sb3JzWycgKyBtYXhDb2xvcnMgKyAnXSddID0gJ3ZlYzQnO1xuXG4gICAgICB2YXIgbSA9IG5ldyBNb2RlbCh0aGlzLCBzaGFkZXIsIG1heENvbG9ycylcbiAgICAgIG0uYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIDQsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS52ZXJ0aWNlc1tpXVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIG0uYWRkQXR0cmlidXRlKCdjb2xvcicsIDEsICdGbG9hdDMyQXJyYXknLCBmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICB2YXIgY29sb3JfaW5kaWNlcyA9IFtdXG4gICAgICAgIHZhciBjb2xvcnMgPSBpdGVtLmFsbG9jYXRpb25zLmNvbG9yXG4gICAgICAgIGNvbG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgIGNvbG9yX2luZGljZXMucHVzaChcbiAgICAgICAgICAgIGNvbG9yQWxsb2NhdGlvbi5hZGQoY29sb3IsIGl0ZW0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yLmNvbG9yXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGNvbG9yX2luZGljZXNcbiAgICAgIH0pO1xuXG4gICAgICBtLmFsbG9jYXRpb25zLmNvbG9yID0gY29sb3JBbGxvY2F0aW9uO1xuICAgICAgbS51bmlmb3Jtcy5jb2xvcnMgPSBjb2xvckFsbG9jYXRpb24uYnVmZmVyO1xuXG4gICAgICByZXR1cm4gbVxuICAgIH1cbiAgfSlcbn1cblxudmFyIHNxdWFyZSA9IGZ1bmN0aW9uICh4LCB5LCB6LCB3KSB7XG4gIHJldHVybiBbXG4gICAgW3ggLSB3LCAgeSAtIHcsIHosIDFdLFxuICAgIFt4IC0gdywgIHkgKyB3LCB6LCAxXSxcbiAgICBbeCArIHcsICB5IC0gdywgeiwgMV0sXG4gICAgW3ggKyB3LCAgeSArIHcsIHosIDFdXG4gIF1cbn1cblxudmFyIHF1YWRzICA9IGdldFJlbmRlcmFibGUoKVxuc2NyZWVuLmFkZFJlbmRlcmFibGUocXVhZHMpXG5cbnZhciB1c2VkID0gW11cbnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGl0ZW0gPSBxdWFkcy5hZGQoe1xuICAgIGFsbG9jYXRpb25zIDoge1xuICAgICAgY29sb3IgOiBbe2lkOiBNYXRoLnJhbmRvbSgpLCBjb2xvcjogW01hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCksIDFdfV0sXG4gICAgfSxcbiAgICB2ZXJ0aWNlcyA6IHNxdWFyZShNYXRoLnJhbmRvbSgpICogMiAtIDEsIE1hdGgucmFuZG9tKCkgKiAyIC0gMSwgLjcsIC4wNSlcbiAgfSlcbiAgXG4gIHVzZWQucHVzaChpdGVtKVxuICBpZiAodXNlZC5sZW5ndGggPiAyMDApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1OyBpICsrKSB7XG4gICAgICBpdGVtID0gdXNlZC5zaGlmdCgpXG4gICAgICBpdGVtLnJlbW92ZSgpXG4gICAgfVxuICAgIHF1YWRzLnJlbW92ZVVudXNlZCgpXG4gIH1cbiAgcmV0dXJuIGFyZ3VtZW50cy5jYWxsZWVcbn0oKSwgMjApXG5cbnNjcmVlbi5iZWdpbkZyYW1lUmVuZGVyaW5nKGZhbHNlKVxuIl19
