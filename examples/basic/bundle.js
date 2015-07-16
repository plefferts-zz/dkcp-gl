require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/basic/index.js":[function(require,module,exports){
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


screen.beginFrameRendering(false)

},{"../../src/dkcp-gl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/dkcp-gl.js"}]},{},["/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/basic/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9iYXNpYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBEa2NwR2wgICAgICAgICAgICA9IHJlcXVpcmUoJy4uLy4uL3NyYy9ka2NwLWdsJylcblxudmFyIFJlbmRlcmFibGUgICAgICAgID0gRGtjcEdsLlJlbmRlcmFibGVcbnZhciBNb2RlbCAgICAgICAgICAgICA9IERrY3BHbC5Nb2RlbFxudmFyIHNoYWRlcnMgICAgICAgICAgID0gRGtjcEdsLnNoYWRlcnNcbnZhciBTaGFkZXIgICAgICAgICAgICA9IERrY3BHbC5TaGFkZXJcbnZhciBBbGxvY2F0aW9uICAgICAgICA9IERrY3BHbC5BbGxvY2F0aW9uXG5cbnZhciBtYWluID0gbmV3IERrY3BHbCh7XG4gIGNhbnZhcyA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgZnJhbWVSYXRlIDoge1xuICAgIGVsZW1lbnQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVyYXRlJylcbiAgfSxcbiAgd2FzZCA6IHtcbiAgICBkb2N1bWVudCA6IGRvY3VtZW50LFxuICAgIGRlbHRhIDogLjA1LFxuICAgIHRoZXRhIDogLU1hdGguUEkgLyAxMjBcbiAgfVxufSlcbnZhciBjYW1lcmEgPSBtYWluLmNhbWVyYTtcbnZhciBzY3JlZW4gPSBtYWluLnNjcmVlbjtcblxuZnVuY3Rpb24gZ2V0UmVuZGVyYWJsZSgpIHtcbiAgcmV0dXJuIG5ldyBSZW5kZXJhYmxlKHtcbiAgICBnZXRVbmlmb3JtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNhbWVyYSA6IGNhbWVyYS5jb21wdXRlTWF0cml4KClcbiAgICAgIH1cbiAgICB9LFxuICAgIGZhY3RvcnkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBcbiAgICAgIHZhciBtYXhDb2xvcnMgPSAxMDBcbiAgICAgIHZhciBjb2xvckFsbG9jYXRpb24gPSBuZXcgQWxsb2NhdGlvbi5GbG9hdChtYXhDb2xvcnMsIDQpXG4gICAgICBcbiAgICAgIHZhciBzaGFkZXIgPSBuZXcgU2hhZGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcgIGdsX1Bvc2l0aW9uID0gY2FtZXJhICogcG9zaXRpb247IFxcbicgKyBcbiAgICAgICAgICAgICAgICcgIGZfY29sb3IgPSBjb2xvcnNbaW50KGNvbG9yKV07IFxcbidcbiAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcgIGdsX0ZyYWdDb2xvciA9IGZfY29sb3IgO1xcbidcbiAgICAgIH0pXG4gICAgICBzaGFkZXIuYXR0cmlidXRlcy5wb3NpdGlvbiAgID0gJ3ZlYzQnO1xuICAgICAgc2hhZGVyLmF0dHJpYnV0ZXMuY29sb3IgICAgICA9ICdmbG9hdCc7XG4gICAgICBzaGFkZXIudmFyeWluZ3MuZl9jb2xvciAgICAgID0gJ3ZlYzQnO1xuICAgICAgc2hhZGVyLnZlcnRleF91bmlmb3Jtcy5jYW1lcmEgPSAnbWF0NCc7XG4gICAgICBzaGFkZXIudmVydGV4X3VuaWZvcm1zWydjb2xvcnNbJyArIG1heENvbG9ycyArICddJ10gPSAndmVjNCc7XG5cbiAgICAgIHZhciBtID0gbmV3IE1vZGVsKHRoaXMsIHNoYWRlciwgMTAwKVxuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgNCwgJ0Zsb2F0MzJBcnJheScsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnZlcnRpY2VzW2ldXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ2NvbG9yJywgMSwgJ0Zsb2F0MzJBcnJheScsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgY29sb3JBbGxvY2F0aW9uLmFkZChpdGVtLmNvbG9yLCBpdGVtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5jb2xvci5jb2xvclxuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH0pO1xuICBcbiAgICAgIG0udW5pZm9ybXMuY29sb3JzID0gY29sb3JBbGxvY2F0aW9uLmJ1ZmZlcjtcbiAgXG4gICAgICByZXR1cm4gbVxuICAgIH1cbiAgfSlcbn1cblxudmFyIHNxdWFyZSA9IGZ1bmN0aW9uICh4LCB5LCB6LCB3KSB7XG4gIHJldHVybiBbXG4gICAgW3ggLSB3LCAgeSAtIHcsIHosIDFdLFxuICAgIFt4IC0gdywgIHkgKyB3LCB6LCAxXSxcbiAgICBbeCArIHcsICB5IC0gdywgeiwgMV0sXG4gICAgW3ggKyB3LCAgeSArIHcsIHosIDFdXG4gIF1cbn1cbnZhciByZWQgICA9IHtpZDogJ3JlZCcsICAgY29sb3I6IFsxLCAwLCAwLCAxXX1cbnZhciBncmVlbiA9IHtpZDogJ2dyZWVuJywgY29sb3I6IFswLCAxLCAwLCAxXX1cbnZhciBibHVlICA9IHtpZDogJ2JsdWUnLCAgY29sb3I6IFswLCAwLCAxLCAxXX1cbnZhciB3aGl0ZSA9IHtpZDogJ3doaXRlJywgY29sb3I6IFsxLCAxLCAxLCAxXX1cblxuICBcbnZhciBxdWFkcyAgPSBnZXRSZW5kZXJhYmxlKClcbnNjcmVlbi5hZGRSZW5kZXJhYmxlKHF1YWRzKVxucXVhZHMuYWRkKHtcbiAgY29sb3IgOiByZWQsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHZlcnRpY2VzIDogc3F1YXJlKC4yNSwgMCwgLjcsIC4wNSlcbn0pXG5xdWFkcy5hZGQoe1xuICBjb2xvciA6IGdyZWVuLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAuMjUsIC43LCAuMDUpXG59KVxucXVhZHMuYWRkKHtcbiAgY29sb3IgOiBibHVlLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAwLCAuOSwgLjA1KVxufSlcbnF1YWRzLmFkZCh7XG4gIGNvbG9yIDogd2hpdGUsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHZlcnRpY2VzIDogc3F1YXJlKDAsIDAsIC43LCAuMDEpXG59KVxuXG5cbnNjcmVlbi5iZWdpbkZyYW1lUmVuZGVyaW5nKGZhbHNlKVxuIl19
