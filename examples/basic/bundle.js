webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var DkcpGl            = __webpack_require__(1)

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


/***/ }
]);