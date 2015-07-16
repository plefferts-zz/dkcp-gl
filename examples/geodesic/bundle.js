require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/geodesic/index.js":[function(require,module,exports){
var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation
var geodesic          = DkcpGl.geodesic

var main = new DkcpGl({
  canvas : document.getElementById('canvas'),
  frameRate : {
    element : document.getElementById('framerate')
  },
  wasd : {
    document : document,
    delta : .5,
    theta : -Math.PI / 30
  }
})
var camera = main.camera;
var screen = main.screen;

var subdivisions = 11;

function getRenderable() {
  return new Renderable({
    before : function () {
    },
    getUniforms : function () {
      return {
        camera : camera.computeMatrix()
      }
    },
    factory : function () {
      
      var maxColors = 10
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

      var m = new Model.Geodesics(this, shader, 2, subdivisions)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      
      m.addAttribute('color', 1, 'Float32Array', function (i, item) {
        return [
          colorAllocation.add(item.color[i], item, function () {
            return item.color[i].color
          })
        ]
      });
  
      m.uniforms.colors = colorAllocation.buffer;
  
      return m
    }
  })
}

var red     = {id: 'red',     color: [1, 0, 0, 1]}
var yellow  = {id: 'yellow',  color: [1, 1, 0, 1]}
var green   = {id: 'green',   color: [0, 1, 0, 1]}
var cyan    = {id: 'cyan',    color: [0, 1, 1, 1]}
var blue    = {id: 'blue',    color: [0, 0, 1, 1]}
var magenta = {id: 'magenta', color: [1, 0, 1, 1]}
var white   = {id: 'white',   color: [1, 1, 1, 1]}

var colors  = [red, yellow, green, cyan, blue, magenta, white];

  
var geos  = getRenderable()
screen.addRenderable(geos)

var g = geodesic(subdivisions).getGeometry();
var color_ints = [];
for (var i = 0; i < g.points.length; i ++) {
  color_ints.push(colors[Math.random() * colors.length | 0])
}
var vertices = []
g.points.forEach(function (point) {
  vertices.push([
    point[0],
    point[1],
    point[2] + 5,
    1
  ])
})
geos.add({
  color       : color_ints,
  allocations : {},
  tris        : g.tris,
  vertices    : vertices
})

var g = geodesic(subdivisions).getGeometry();
var color_ints = [];
for (var i = 0; i < g.points.length; i ++) {
  color_ints.push(colors[Math.random() * colors.length | 0])
}
var vertices = []
g.points.forEach(function (point) {
  vertices.push([
    point[0] / 3 + 4,
    point[1] / 3 + 4,
    point[2] / 3 + 10,
    1
  ])
})
geos.add({
  color       : color_ints,
  allocations : {},
  tris        : g.tris,
  vertices    : vertices
})

screen.beginFrameRendering(false)

},{"../../src/dkcp-gl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/dkcp-gl.js"}]},{},["/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/geodesic/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9nZW9kZXNpYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRGtjcEdsICAgICAgICAgICAgPSByZXF1aXJlKCcuLi8uLi9zcmMvZGtjcC1nbCcpXG5cbnZhciBSZW5kZXJhYmxlICAgICAgICA9IERrY3BHbC5SZW5kZXJhYmxlXG52YXIgTW9kZWwgICAgICAgICAgICAgPSBEa2NwR2wuTW9kZWxcbnZhciBzaGFkZXJzICAgICAgICAgICA9IERrY3BHbC5zaGFkZXJzXG52YXIgU2hhZGVyICAgICAgICAgICAgPSBEa2NwR2wuU2hhZGVyXG52YXIgQWxsb2NhdGlvbiAgICAgICAgPSBEa2NwR2wuQWxsb2NhdGlvblxudmFyIGdlb2Rlc2ljICAgICAgICAgID0gRGtjcEdsLmdlb2Rlc2ljXG5cbnZhciBtYWluID0gbmV3IERrY3BHbCh7XG4gIGNhbnZhcyA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgZnJhbWVSYXRlIDoge1xuICAgIGVsZW1lbnQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVyYXRlJylcbiAgfSxcbiAgd2FzZCA6IHtcbiAgICBkb2N1bWVudCA6IGRvY3VtZW50LFxuICAgIGRlbHRhIDogLjUsXG4gICAgdGhldGEgOiAtTWF0aC5QSSAvIDMwXG4gIH1cbn0pXG52YXIgY2FtZXJhID0gbWFpbi5jYW1lcmE7XG52YXIgc2NyZWVuID0gbWFpbi5zY3JlZW47XG5cbnZhciBzdWJkaXZpc2lvbnMgPSAxMTtcblxuZnVuY3Rpb24gZ2V0UmVuZGVyYWJsZSgpIHtcbiAgcmV0dXJuIG5ldyBSZW5kZXJhYmxlKHtcbiAgICBiZWZvcmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcbiAgICBnZXRVbmlmb3JtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNhbWVyYSA6IGNhbWVyYS5jb21wdXRlTWF0cml4KClcbiAgICAgIH1cbiAgICB9LFxuICAgIGZhY3RvcnkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBcbiAgICAgIHZhciBtYXhDb2xvcnMgPSAxMFxuICAgICAgdmFyIGNvbG9yQWxsb2NhdGlvbiA9IG5ldyBBbGxvY2F0aW9uLkZsb2F0KG1heENvbG9ycywgNClcbiAgICAgIFxuICAgICAgdmFyIHNoYWRlciA9IG5ldyBTaGFkZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJyAgZ2xfUG9zaXRpb24gPSBjYW1lcmEgKiBwb3NpdGlvbjsgXFxuJyArIFxuICAgICAgICAgICAgICAgJyAgZl9jb2xvciA9IGNvbG9yc1tpbnQoY29sb3IpXTsgXFxuJ1xuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJyAgZ2xfRnJhZ0NvbG9yID0gZl9jb2xvciA7XFxuJ1xuICAgICAgfSlcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLnBvc2l0aW9uICAgPSAndmVjNCc7XG4gICAgICBzaGFkZXIuYXR0cmlidXRlcy5jb2xvciAgICAgID0gJ2Zsb2F0JztcbiAgICAgIHNoYWRlci52YXJ5aW5ncy5mX2NvbG9yICAgICAgPSAndmVjNCc7XG4gICAgICBzaGFkZXIudmVydGV4X3VuaWZvcm1zLmNhbWVyYSA9ICdtYXQ0JztcbiAgICAgIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXNbJ2NvbG9yc1snICsgbWF4Q29sb3JzICsgJ10nXSA9ICd2ZWM0JztcblxuICAgICAgdmFyIG0gPSBuZXcgTW9kZWwuR2VvZGVzaWNzKHRoaXMsIHNoYWRlciwgMiwgc3ViZGl2aXNpb25zKVxuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgNCwgJ0Zsb2F0MzJBcnJheScsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnZlcnRpY2VzW2ldXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgbS5hZGRBdHRyaWJ1dGUoJ2NvbG9yJywgMSwgJ0Zsb2F0MzJBcnJheScsIGZ1bmN0aW9uIChpLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgY29sb3JBbGxvY2F0aW9uLmFkZChpdGVtLmNvbG9yW2ldLCBpdGVtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5jb2xvcltpXS5jb2xvclxuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH0pO1xuICBcbiAgICAgIG0udW5pZm9ybXMuY29sb3JzID0gY29sb3JBbGxvY2F0aW9uLmJ1ZmZlcjtcbiAgXG4gICAgICByZXR1cm4gbVxuICAgIH1cbiAgfSlcbn1cblxudmFyIHJlZCAgICAgPSB7aWQ6ICdyZWQnLCAgICAgY29sb3I6IFsxLCAwLCAwLCAxXX1cbnZhciB5ZWxsb3cgID0ge2lkOiAneWVsbG93JywgIGNvbG9yOiBbMSwgMSwgMCwgMV19XG52YXIgZ3JlZW4gICA9IHtpZDogJ2dyZWVuJywgICBjb2xvcjogWzAsIDEsIDAsIDFdfVxudmFyIGN5YW4gICAgPSB7aWQ6ICdjeWFuJywgICAgY29sb3I6IFswLCAxLCAxLCAxXX1cbnZhciBibHVlICAgID0ge2lkOiAnYmx1ZScsICAgIGNvbG9yOiBbMCwgMCwgMSwgMV19XG52YXIgbWFnZW50YSA9IHtpZDogJ21hZ2VudGEnLCBjb2xvcjogWzEsIDAsIDEsIDFdfVxudmFyIHdoaXRlICAgPSB7aWQ6ICd3aGl0ZScsICAgY29sb3I6IFsxLCAxLCAxLCAxXX1cblxudmFyIGNvbG9ycyAgPSBbcmVkLCB5ZWxsb3csIGdyZWVuLCBjeWFuLCBibHVlLCBtYWdlbnRhLCB3aGl0ZV07XG5cbiAgXG52YXIgZ2VvcyAgPSBnZXRSZW5kZXJhYmxlKClcbnNjcmVlbi5hZGRSZW5kZXJhYmxlKGdlb3MpXG5cbnZhciBnID0gZ2VvZGVzaWMoc3ViZGl2aXNpb25zKS5nZXRHZW9tZXRyeSgpO1xudmFyIGNvbG9yX2ludHMgPSBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwgZy5wb2ludHMubGVuZ3RoOyBpICsrKSB7XG4gIGNvbG9yX2ludHMucHVzaChjb2xvcnNbTWF0aC5yYW5kb20oKSAqIGNvbG9ycy5sZW5ndGggfCAwXSlcbn1cbnZhciB2ZXJ0aWNlcyA9IFtdXG5nLnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCkge1xuICB2ZXJ0aWNlcy5wdXNoKFtcbiAgICBwb2ludFswXSxcbiAgICBwb2ludFsxXSxcbiAgICBwb2ludFsyXSArIDUsXG4gICAgMVxuICBdKVxufSlcbmdlb3MuYWRkKHtcbiAgY29sb3IgICAgICAgOiBjb2xvcl9pbnRzLFxuICBhbGxvY2F0aW9ucyA6IHt9LFxuICB0cmlzICAgICAgICA6IGcudHJpcyxcbiAgdmVydGljZXMgICAgOiB2ZXJ0aWNlc1xufSlcblxudmFyIGcgPSBnZW9kZXNpYyhzdWJkaXZpc2lvbnMpLmdldEdlb21ldHJ5KCk7XG52YXIgY29sb3JfaW50cyA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBnLnBvaW50cy5sZW5ndGg7IGkgKyspIHtcbiAgY29sb3JfaW50cy5wdXNoKGNvbG9yc1tNYXRoLnJhbmRvbSgpICogY29sb3JzLmxlbmd0aCB8IDBdKVxufVxudmFyIHZlcnRpY2VzID0gW11cbmcucG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50KSB7XG4gIHZlcnRpY2VzLnB1c2goW1xuICAgIHBvaW50WzBdIC8gMyArIDQsXG4gICAgcG9pbnRbMV0gLyAzICsgNCxcbiAgICBwb2ludFsyXSAvIDMgKyAxMCxcbiAgICAxXG4gIF0pXG59KVxuZ2Vvcy5hZGQoe1xuICBjb2xvciAgICAgICA6IGNvbG9yX2ludHMsXG4gIGFsbG9jYXRpb25zIDoge30sXG4gIHRyaXMgICAgICAgIDogZy50cmlzLFxuICB2ZXJ0aWNlcyAgICA6IHZlcnRpY2VzXG59KVxuXG5zY3JlZW4uYmVnaW5GcmFtZVJlbmRlcmluZyhmYWxzZSlcbiJdfQ==
