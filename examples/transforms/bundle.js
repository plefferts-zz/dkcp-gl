require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DkcpGl            = require('../../src/dkcp-gl')

var Renderable        = DkcpGl.Renderable
var Model             = DkcpGl.Model
var shaders           = DkcpGl.shaders
var Shader            = DkcpGl.Shader
var Allocation        = DkcpGl.Allocation
var Transform         = DkcpGl.Transform

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
      
      var maxColors           = 100
      var colorAllocation     = new Allocation.Float(maxColors, 4)

      var maxTransforms       = 16
      var transformAllocation = new Allocation.Float(maxTransforms, 16)
      
      var shader = new Shader(function () {
        return '  gl_Position = camera * transforms[int(transform)] * position; \n' + 
               '  f_color = colors[int(color)]; \n'
      }, function () {
        return '  gl_FragColor = f_color ;\n'
      })
      shader.attributes.position    = 'vec4';
      shader.attributes.color       = 'float';
      shader.attributes.transform   = 'float';
      shader.varyings.f_color       = 'vec4';
      shader.vertex_uniforms.camera = 'mat4';
      shader.vertex_uniforms['colors[' + maxColors + ']'] = 'vec4';
      shader.vertex_uniforms['transforms[' + maxTransforms + ']'] = 'mat4';

      var m = new Model(this, shader, 100)
      m.addAttribute('position', 4, 'Float32Array', function (i, item) {
        return item.vertices[i]
      });
      
      m.addAttribute('color', 1, 'Float32Array', function (i, item) {
        var color_indices = []
        var colors = item.allocations.colors
        colors.forEach(function (color) {
          color_indices.push(
            colorAllocation.add(color, item, function () {
              return color.color
            })
          )
        })
        return color_indices
      });

      m.addAttribute('transform', 1, 'Float32Array', function (i, item) {
        var transform_indices = []
        var transforms = item.allocations.transforms
        transforms.forEach(function (transform) {
          transform_indices.push(
            transformAllocation.add(transform, item, function () {
              return transform.getValue()
            })
          )
        })
        return transform_indices
      });
  
      m.allocations.colors     = colorAllocation;
      m.uniforms.colors        = colorAllocation.buffer;
      m.allocations.transforms = transformAllocation;
      m.uniforms.transforms    = transformAllocation.buffer;
  
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

var transforms = [];
transforms.push(new Transform());

screen.on('frame', function() {
  transforms[0].rotateBy(Math.PI/8/10, 0, 0);
  transforms[0].trigger('change', transforms[0]);
})

var quads  = getRenderable()
screen.addRenderable(quads)
quads.add({
  allocations : {
    colors : [red],
    transforms : [transforms[0]]
  },
  vertices : square(.25, 0, .7, .05)
})
quads.add({
  allocations : {
    colors : [green],
    transforms : [transforms[0]]
  },
  vertices : square(0, .25, .7, .05)
})
quads.add({
  allocations : {
    colors : [blue],
    transforms : [transforms[0]]
  },
  vertices : square(0, 0, .9, .05)
})
quads.add({
  allocations : {
    colors : [white],
    transforms : [transforms[0]]
  },
  vertices : square(0, 0, .7, .01)
})


screen.beginFrameRendering(false)

},{"../../src/dkcp-gl":15}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy90cmFuc2Zvcm1zL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIERrY3BHbCAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vLi4vc3JjL2RrY3AtZ2wnKVxuXG52YXIgUmVuZGVyYWJsZSAgICAgICAgPSBEa2NwR2wuUmVuZGVyYWJsZVxudmFyIE1vZGVsICAgICAgICAgICAgID0gRGtjcEdsLk1vZGVsXG52YXIgc2hhZGVycyAgICAgICAgICAgPSBEa2NwR2wuc2hhZGVyc1xudmFyIFNoYWRlciAgICAgICAgICAgID0gRGtjcEdsLlNoYWRlclxudmFyIEFsbG9jYXRpb24gICAgICAgID0gRGtjcEdsLkFsbG9jYXRpb25cbnZhciBUcmFuc2Zvcm0gICAgICAgICA9IERrY3BHbC5UcmFuc2Zvcm1cblxudmFyIG1haW4gPSBuZXcgRGtjcEdsKHtcbiAgY2FudmFzIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLFxuICBmcmFtZVJhdGUgOiB7XG4gICAgZWxlbWVudCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmFtZXJhdGUnKVxuICB9LFxuICB3YXNkIDoge1xuICAgIGRvY3VtZW50IDogZG9jdW1lbnQsXG4gICAgZGVsdGEgOiAuMDUsXG4gICAgdGhldGEgOiAtTWF0aC5QSSAvIDEyMFxuICB9XG59KVxudmFyIGNhbWVyYSA9IG1haW4uY2FtZXJhO1xudmFyIHNjcmVlbiA9IG1haW4uc2NyZWVuO1xuXG5mdW5jdGlvbiBnZXRSZW5kZXJhYmxlKCkge1xuICByZXR1cm4gbmV3IFJlbmRlcmFibGUoe1xuICAgIGdldFVuaWZvcm1zIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2FtZXJhIDogY2FtZXJhLmNvbXB1dGVNYXRyaXgoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZmFjdG9yeSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIFxuICAgICAgdmFyIG1heENvbG9ycyAgICAgICAgICAgPSAxMDBcbiAgICAgIHZhciBjb2xvckFsbG9jYXRpb24gICAgID0gbmV3IEFsbG9jYXRpb24uRmxvYXQobWF4Q29sb3JzLCA0KVxuXG4gICAgICB2YXIgbWF4VHJhbnNmb3JtcyAgICAgICA9IDE2XG4gICAgICB2YXIgdHJhbnNmb3JtQWxsb2NhdGlvbiA9IG5ldyBBbGxvY2F0aW9uLkZsb2F0KG1heFRyYW5zZm9ybXMsIDE2KVxuICAgICAgXG4gICAgICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnICBnbF9Qb3NpdGlvbiA9IGNhbWVyYSAqIHRyYW5zZm9ybXNbaW50KHRyYW5zZm9ybSldICogcG9zaXRpb247IFxcbicgKyBcbiAgICAgICAgICAgICAgICcgIGZfY29sb3IgPSBjb2xvcnNbaW50KGNvbG9yKV07IFxcbidcbiAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcgIGdsX0ZyYWdDb2xvciA9IGZfY29sb3IgO1xcbidcbiAgICAgIH0pXG4gICAgICBzaGFkZXIuYXR0cmlidXRlcy5wb3NpdGlvbiAgICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLmNvbG9yICAgICAgID0gJ2Zsb2F0JztcbiAgICAgIHNoYWRlci5hdHRyaWJ1dGVzLnRyYW5zZm9ybSAgID0gJ2Zsb2F0JztcbiAgICAgIHNoYWRlci52YXJ5aW5ncy5mX2NvbG9yICAgICAgID0gJ3ZlYzQnO1xuICAgICAgc2hhZGVyLnZlcnRleF91bmlmb3Jtcy5jYW1lcmEgPSAnbWF0NCc7XG4gICAgICBzaGFkZXIudmVydGV4X3VuaWZvcm1zWydjb2xvcnNbJyArIG1heENvbG9ycyArICddJ10gPSAndmVjNCc7XG4gICAgICBzaGFkZXIudmVydGV4X3VuaWZvcm1zWyd0cmFuc2Zvcm1zWycgKyBtYXhUcmFuc2Zvcm1zICsgJ10nXSA9ICdtYXQ0JztcblxuICAgICAgdmFyIG0gPSBuZXcgTW9kZWwodGhpcywgc2hhZGVyLCAxMDApXG4gICAgICBtLmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCA0LCAnRmxvYXQzMkFycmF5JywgZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udmVydGljZXNbaV1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBtLmFkZEF0dHJpYnV0ZSgnY29sb3InLCAxLCAnRmxvYXQzMkFycmF5JywgZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgdmFyIGNvbG9yX2luZGljZXMgPSBbXVxuICAgICAgICB2YXIgY29sb3JzID0gaXRlbS5hbGxvY2F0aW9ucy5jb2xvcnNcbiAgICAgICAgY29sb3JzLmZvckVhY2goZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgY29sb3JfaW5kaWNlcy5wdXNoKFxuICAgICAgICAgICAgY29sb3JBbGxvY2F0aW9uLmFkZChjb2xvciwgaXRlbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gY29sb3IuY29sb3JcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gY29sb3JfaW5kaWNlc1xuICAgICAgfSk7XG5cbiAgICAgIG0uYWRkQXR0cmlidXRlKCd0cmFuc2Zvcm0nLCAxLCAnRmxvYXQzMkFycmF5JywgZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgdmFyIHRyYW5zZm9ybV9pbmRpY2VzID0gW11cbiAgICAgICAgdmFyIHRyYW5zZm9ybXMgPSBpdGVtLmFsbG9jYXRpb25zLnRyYW5zZm9ybXNcbiAgICAgICAgdHJhbnNmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgICB0cmFuc2Zvcm1faW5kaWNlcy5wdXNoKFxuICAgICAgICAgICAgdHJhbnNmb3JtQWxsb2NhdGlvbi5hZGQodHJhbnNmb3JtLCBpdGVtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm0uZ2V0VmFsdWUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1faW5kaWNlc1xuICAgICAgfSk7XG4gIFxuICAgICAgbS5hbGxvY2F0aW9ucy5jb2xvcnMgICAgID0gY29sb3JBbGxvY2F0aW9uO1xuICAgICAgbS51bmlmb3Jtcy5jb2xvcnMgICAgICAgID0gY29sb3JBbGxvY2F0aW9uLmJ1ZmZlcjtcbiAgICAgIG0uYWxsb2NhdGlvbnMudHJhbnNmb3JtcyA9IHRyYW5zZm9ybUFsbG9jYXRpb247XG4gICAgICBtLnVuaWZvcm1zLnRyYW5zZm9ybXMgICAgPSB0cmFuc2Zvcm1BbGxvY2F0aW9uLmJ1ZmZlcjtcbiAgXG4gICAgICByZXR1cm4gbVxuICAgIH1cbiAgfSlcbn1cblxudmFyIHNxdWFyZSA9IGZ1bmN0aW9uICh4LCB5LCB6LCB3KSB7XG4gIHJldHVybiBbXG4gICAgW3ggLSB3LCAgeSAtIHcsIHosIDFdLFxuICAgIFt4IC0gdywgIHkgKyB3LCB6LCAxXSxcbiAgICBbeCArIHcsICB5IC0gdywgeiwgMV0sXG4gICAgW3ggKyB3LCAgeSArIHcsIHosIDFdXG4gIF1cbn1cbnZhciByZWQgICA9IHtpZDogJ3JlZCcsICAgY29sb3I6IFsxLCAwLCAwLCAxXX1cbnZhciBncmVlbiA9IHtpZDogJ2dyZWVuJywgY29sb3I6IFswLCAxLCAwLCAxXX1cbnZhciBibHVlICA9IHtpZDogJ2JsdWUnLCAgY29sb3I6IFswLCAwLCAxLCAxXX1cbnZhciB3aGl0ZSA9IHtpZDogJ3doaXRlJywgY29sb3I6IFsxLCAxLCAxLCAxXX1cblxudmFyIHRyYW5zZm9ybXMgPSBbXTtcbnRyYW5zZm9ybXMucHVzaChuZXcgVHJhbnNmb3JtKCkpO1xuXG5zY3JlZW4ub24oJ2ZyYW1lJywgZnVuY3Rpb24oKSB7XG4gIHRyYW5zZm9ybXNbMF0ucm90YXRlQnkoTWF0aC5QSS84LzEwLCAwLCAwKTtcbiAgdHJhbnNmb3Jtc1swXS50cmlnZ2VyKCdjaGFuZ2UnLCB0cmFuc2Zvcm1zWzBdKTtcbn0pXG5cbnZhciBxdWFkcyAgPSBnZXRSZW5kZXJhYmxlKClcbnNjcmVlbi5hZGRSZW5kZXJhYmxlKHF1YWRzKVxucXVhZHMuYWRkKHtcbiAgYWxsb2NhdGlvbnMgOiB7XG4gICAgY29sb3JzIDogW3JlZF0sXG4gICAgdHJhbnNmb3JtcyA6IFt0cmFuc2Zvcm1zWzBdXVxuICB9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSguMjUsIDAsIC43LCAuMDUpXG59KVxucXVhZHMuYWRkKHtcbiAgYWxsb2NhdGlvbnMgOiB7XG4gICAgY29sb3JzIDogW2dyZWVuXSxcbiAgICB0cmFuc2Zvcm1zIDogW3RyYW5zZm9ybXNbMF1dXG4gIH0sXG4gIHZlcnRpY2VzIDogc3F1YXJlKDAsIC4yNSwgLjcsIC4wNSlcbn0pXG5xdWFkcy5hZGQoe1xuICBhbGxvY2F0aW9ucyA6IHtcbiAgICBjb2xvcnMgOiBbYmx1ZV0sXG4gICAgdHJhbnNmb3JtcyA6IFt0cmFuc2Zvcm1zWzBdXVxuICB9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAwLCAuOSwgLjA1KVxufSlcbnF1YWRzLmFkZCh7XG4gIGFsbG9jYXRpb25zIDoge1xuICAgIGNvbG9ycyA6IFt3aGl0ZV0sXG4gICAgdHJhbnNmb3JtcyA6IFt0cmFuc2Zvcm1zWzBdXVxuICB9LFxuICB2ZXJ0aWNlcyA6IHNxdWFyZSgwLCAwLCAuNywgLjAxKVxufSlcblxuXG5zY3JlZW4uYmVnaW5GcmFtZVJlbmRlcmluZyhmYWxzZSlcbiJdfQ==
