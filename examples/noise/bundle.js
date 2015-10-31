webpackJsonp([4],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var m4                = __webpack_require__(7).m4
	var DkcpGl            = __webpack_require__(1)

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
	      shader.fragment_header += __webpack_require__(33);
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


/***/ },

/***/ 33:
/***/ function(module, exports) {

	module.exports=' vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); } vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; } float snoise(vec3 v) { const vec2 C = vec2(1.0/6.0, 1.0/3.0) ; const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy) ); vec3 x0 = v - i + dot(i, C.xxx) ; vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min( g.xyz, l.zxy ); vec3 i2 = max( g.xyz, l.zxy ); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4( x.xy, y.xy ); vec4 b1 = vec4( x.zw, y.zw ); vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m; return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) ); } ';


/***/ }

});