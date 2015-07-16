require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/noise/index.js":[function(require,module,exports){
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

},{"../../lib/twgl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/lib/twgl.js","../../src/dkcp-gl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/dkcp-gl.js","../../src/glsl/noise.min.glsl":"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/glsl/noise.min.glsl.js"}],"/Users/peterlefferts/Sites/localhost/dkcp-gl/src/glsl/noise.min.glsl.js":[function(require,module,exports){
module.exports=' vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); } vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; } float snoise(vec3 v) { const vec2 C = vec2(1.0/6.0, 1.0/3.0) ; const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy) ); vec3 x0 = v - i + dot(i, C.xxx) ; vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min( g.xyz, l.zxy ); vec3 i2 = max( g.xyz, l.zxy ); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4( x.xy, y.xy ); vec4 b1 = vec4( x.zw, y.zw ); vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m; return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) ); } ';

},{}]},{},["/Users/peterlefferts/Sites/localhost/dkcp-gl/examples/noise/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9ub2lzZS9pbmRleC5qcyIsInNyYy9nbHNsL25vaXNlLm1pbi5nbHNsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIG00ICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vLi4vbGliL3R3Z2wnKS5tNFxudmFyIERrY3BHbCAgICAgICAgICAgID0gcmVxdWlyZSgnLi4vLi4vc3JjL2RrY3AtZ2wnKVxuXG52YXIgUmVuZGVyYWJsZSAgICAgICAgPSBEa2NwR2wuUmVuZGVyYWJsZVxudmFyIFBsYXRlICAgICAgICAgICAgID0gRGtjcEdsLlBsYXRlXG52YXIgc2hhZGVycyAgICAgICAgICAgPSBEa2NwR2wuc2hhZGVyc1xudmFyIFNoYWRlciAgICAgICAgICAgID0gRGtjcEdsLlNoYWRlclxudmFyIEFsbG9jYXRpb24gICAgICAgID0gRGtjcEdsLkFsbG9jYXRpb25cblxudmFyIG1haW4gPSBuZXcgRGtjcEdsKHtcbiAgY2FudmFzIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLFxuICBmcmFtZVJhdGUgOiB7XG4gICAgZWxlbWVudCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmFtZXJhdGUnKVxuICB9LFxuICB3YXNkIDoge1xuICAgIGRvY3VtZW50IDogZG9jdW1lbnQsXG4gICAgZGVsdGEgOiAuMDEyLFxuICAgIHRoZXRhIDogLU1hdGguUEkgLyA2MFxuICB9XG59KVxudmFyIGNhbWVyYSA9IG1haW4uY2FtZXJhO1xudmFyIHNjcmVlbiA9IG1haW4uc2NyZWVuO1xuXG5mdW5jdGlvbiBnZXRSZW5kZXJhYmxlKCkge1xuICB2YXIgaW52ZXJzZSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuICByZXR1cm4gbmV3IFJlbmRlcmFibGUoe1xuICAgIGdldFVuaWZvcm1zIDogZnVuY3Rpb24gKCkge1xuICAgICAgbTQuaW52ZXJzZShjYW1lcmEuY29tcHV0ZU1hdHJpeCgpLCBpbnZlcnNlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNhbWVyYSA6IGludmVyc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIGZhY3RvcnkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2hhZGVyID0gbmV3IFNoYWRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgJyAgdl9wb3NpdGlvbiAgPSBjYW1lcmEgKiAocG9zaXRpb24gKiB2ZWM0KDEwLjAsIDEwLjAsIDAuMCwgMS4wKSk7IFxcbicgK1xuICAgICAgICAgICcgIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCAwLjUsIDEuMCk7IFxcbidcbiAgICAgICAgKSBcbiAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAnICBmbG9hdCBuMiA9IHNub2lzZSh2ZWMzKHZfcG9zaXRpb24ueCAvIDQuMCwgdl9wb3NpdGlvbi55IC8gNC4wLCB2X3Bvc2l0aW9uLnogLyA0LjApKTtcXG4nICtcbiAgICAgICAgICAnICBuMiA9ICgxLjAgLSBwb3coMS4wIC0gYWJzKG4yKSwgMi4wKSkgKiAobjIgPiAwLjAgPyAxLjAgOiAtMS4wKTtcXG4nICtcbiAgICAgICAgICAnICBuMiA9IGNsYW1wKChuMiArIDEuMCkgLyAyLjAsIDAuMCwgMS4wKTtcXG4nICtcbiAgICAgICAgICAnICBuMiA9IHBvdyhuMiwgMC41KTtcXG4nICtcbiAgICAgICAgICAnICBuMiA9IDAuMTI1ICsgbjIgKiAwLjg3NTtcXG4nICtcblxuICAgICAgICAgICcgIGZsb2F0IG4gPSBzbm9pc2UodmVjMygxMjM0NS42NyArIHZfcG9zaXRpb24ueCAvIDEuMCwgdl9wb3NpdGlvbi55IC8gMS4wLCB2X3Bvc2l0aW9uLnogLyAxLjApKTtcXG4nICtcbiAgICAgICAgICAnICBuID0gKG4gKiAwLjUgKyAobjIgLSAwLjUpKSAvIDQuMDtcXG4nICtcblxuICAgICAgICAgICcgIG4gPSAoMS4wIC0gcG93KDEuMCAtIGFicyhuKSwgMjAuMCkpICogKG4gPiAwLjAgPyAxLjAgOiAtMS4wKTtcXG4nICtcbiAgICAgICAgICAnICBuID0gY2xhbXAoKG4gKyAxLjApIC8gMi4wLCAwLjAsIDEuMCk7XFxuJyArXG4gICAgICAgICAgJyAgbiA9IHBvdyhuLCAyLjEpO1xcbicgK1xuICAgICAgICAgICcgIG4gPSAwLjEyNSArIG4gKiAwLjg3NTtcXG4nICtcblxuICAgICAgICAgICcgIG4gPSAxLjAgLSBuO1xcbicgK1xuICAgICAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQobiwgbiwgbiwgMS4wKTtcXG4nXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICBzaGFkZXIuZnJhZ21lbnRfaGVhZGVyICs9IHJlcXVpcmUoJy4uLy4uL3NyYy9nbHNsL25vaXNlLm1pbi5nbHNsJyk7XG4gICAgICBzaGFkZXIuYXR0cmlidXRlcy5wb3NpdGlvbiAgICA9ICd2ZWM0JztcbiAgICAgIHNoYWRlci52ZXJ0ZXhfdW5pZm9ybXMuY2FtZXJhID0gJ21hdDQnO1xuICAgICAgc2hhZGVyLnZhcnlpbmdzLnZfcG9zaXRpb24gICAgPSAndmVjNCc7XG4gICAgICBcbiAgICAgIFxuICAgICAgdmFyIHBsYXRlID0gbmV3IFBsYXRlKHNoYWRlcik7XG4gICAgICByZXR1cm4gcGxhdGU7XG4gICAgfVxuICAgIFxuICB9KVxufVxuXG52YXIgbm9pc2UgID0gZ2V0UmVuZGVyYWJsZSgpXG5zY3JlZW4uYWRkUmVuZGVyYWJsZShub2lzZSlcbm5vaXNlLmFkZCh7XG4gIHo6IC41XG59KVxuXG5zY3JlZW4uYmVnaW5GcmFtZVJlbmRlcmluZyhmYWxzZSlcbiIsIm1vZHVsZS5leHBvcnRzPScgdmVjMyBtb2QyODkodmVjMyB4KSB7IHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7IH0gdmVjNCBtb2QyODkodmVjNCB4KSB7IHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7IH0gdmVjNCBwZXJtdXRlKHZlYzQgeCkgeyByZXR1cm4gbW9kMjg5KCgoeCozNC4wKSsxLjApKngpOyB9IHZlYzQgdGF5bG9ySW52U3FydCh2ZWM0IHIpIHsgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjsgfSBmbG9hdCBzbm9pc2UodmVjMyB2KSB7IGNvbnN0IHZlYzIgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgOyBjb25zdCB2ZWM0IEQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7IHZlYzMgaSA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7IHZlYzMgeDAgPSB2IC0gaSArIGRvdChpLCBDLnh4eCkgOyB2ZWMzIGcgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTsgdmVjMyBsID0gMS4wIC0gZzsgdmVjMyBpMSA9IG1pbiggZy54eXosIGwuenh5ICk7IHZlYzMgaTIgPSBtYXgoIGcueHl6LCBsLnp4eSApOyB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4OyB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyB2ZWMzIHgzID0geDAgLSBELnl5eTsgaSA9IG1vZDI4OShpKTsgdmVjNCBwID0gcGVybXV0ZSggcGVybXV0ZSggcGVybXV0ZSggaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKSArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSkgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpOyBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyB2ZWMzIG5zID0gbl8gKiBELnd5eiAtIEQueHp4OyB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7IHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7IHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5OyB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7IHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTsgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTsgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTsgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7IHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wOyB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTsgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgOyB2ZWM0IGExID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7IHZlYzMgcDAgPSB2ZWMzKGEwLnh5LGgueCk7IHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7IHZlYzMgcDIgPSB2ZWMzKGExLnh5LGgueik7IHZlYzMgcDMgPSB2ZWMzKGExLnp3LGgudyk7IHZlYzQgbm9ybSA9IHRheWxvckludlNxcnQodmVjNChkb3QocDAscDApLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpOyBwMCAqPSBub3JtLng7IHAxICo9IG5vcm0ueTsgcDIgKj0gbm9ybS56OyBwMyAqPSBub3JtLnc7IHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApOyBtID0gbSAqIG07IHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMCx4MCksIGRvdChwMSx4MSksIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApOyB9ICc7XG4iXX0=
