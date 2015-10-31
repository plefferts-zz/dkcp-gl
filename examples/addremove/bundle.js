webpackJsonp([0],[
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


/***/ }
]);