var inherits   = require('inherits')
var DkcpGl     = require('./dkcp-gl')
var Allocation = DkcpGl.Allocation
var Shader     = DkcpGl.Shader
var RenderSet  = DkcpGl.RenderSet
var twgl       = require('../lib/twgl')
var m4         = twgl.m4

var HitColorAllocation = function (max) {
  Allocation.Float.call(this, max, 4)
}
inherits(HitColorAllocation, Allocation.Float)

HitColorAllocation.prototype.add = function (item, owner) {
  return Allocation.Float.prototype.add.call(this, item, owner, function (index) {
    var b = (index >>>  0) % 0x100;
    var g = (index >>>  8) % 0x100;
    var r = (index >>> 16) % 0x100;
    return [r / 255, g / 255, b / 255, 1]
  })
}

HitColorAllocation.prototype.hitAreaFor = function (arr) {
  var c = arr[0] * 0x10000 + arr[1] * 0x100 + arr[2];
  return this.members[c]
}

var HitTestManager = function (gl, max) {
  this.attribute_name     = 'hit_color';
  this.uniform_name       = 'hit_colors';
  this.hitColorAllocation = new HitColorAllocation(max);
  this.renderSet          = new HitTestRenderSet(gl, this);
}

HitTestManager.prototype.hitAreaFor = function (arr) {
  return this.hitColorAllocation.hitAreaFor(arr)
}

HitTestManager.prototype.mixinModel = function (model) {
  var allocation = this.hitColorAllocation
  model.addAttribute(this.attribute_name, 1, 'Float32Array', function (i, item) {
    return [
      allocation.add({id: item.hit_area}, item)
    ]
  });
  model.uniforms[this.uniform_name] = this.hitColorAllocation.buffer;
}

var HitTestShader = function (hitColorAllocation, getVertexBodySource, getFragmentBodySource) {
  Shader.call(this,
      this.wrapVertexSource(getVertexBodySource),
      this.wrapFragmentSource(getFragmentBodySource))

  this.hitColorAllocation = hitColorAllocation
  this.varyings.f_hit_color  = 'vec4';
  this.attributes.hit_color  = 'float';
  this.vertex_uniforms.hit_test_zoom_matrix = 'mat4';
  this.vertex_uniforms['hit_colors[' + this.hitColorAllocation.slots.max + ']'] = 'vec4';
}
inherits(HitTestShader, Shader)

HitTestShader.prototype.wrapVertexSource = function (fn) {
  return function () {
    return fn(this.hit_test) + '\n  f_hit_color = hit_colors[int(hit_color)];'
  }
};

HitTestShader.prototype.wrapFragmentSource = function (fn) {
  return function () {
    if (this.hit_test) {
      return ' gl_FragColor = f_hit_color;  \n'
    }
    return fn();
  }
};

HitTestShader.prototype.getProgram = function (gl, uniforms) {
  if (uniforms.hit_test_zoom_matrix) {
    if (this.hit_test_program)
      return this.hit_test_program
    
    this.hit_test = true
    return this.hit_test_program = twgl.createProgramInfo(
      gl,
      [this.getVertexSource(), this.getFragmentSource()]
    )
  }
  
  this.hit_test = false
  return Shader.prototype.getProgram.call(this, gl, uniforms)
};


function HitTestRenderSet(gl, hitTestManager) {
  this.hitTestManager = hitTestManager;
  this.framebuffers = new HitTestFrameBuffer(gl, 2, true);
  this.framebuffers.unbind()
  
  RenderSet.call(this)

  this.addRenderable({
    before : function () {
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    },
    renderOrder : 0
  })
  
}
inherits(HitTestRenderSet, RenderSet)

HitTestRenderSet.prototype.getUniforms = function () {
  return {
    hit_test_zoom_matrix : this.hit_test_zoom_matrix
  }
}
HitTestRenderSet.prototype.render = function (gl, camera, clickx, clicky) {
  this.framebuffers.bind();
  var zoom = Math.max(camera.frameWidth, camera.frameHeight);
  var dst = new Float32Array(16)
  m4.translate(m4.scaling([zoom, zoom, 1]), [
    2 * (.5 - clickx / camera.frameWidth),
    -2 * (.5 - clicky / camera.frameHeight),
    0
  ], dst)

  this.hit_test_zoom_matrix = dst

  RenderSet.prototype.render.call(this, gl);
  
  var arr = new Uint8Array(4 * 4)
  gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, arr)
  arr = Array.prototype.slice.call(arr, 0, 3)
  if (arr.join(',') != this.lastarr) {
    console.log(this.hitTestManager.hitAreaFor(arr))
  }
  this.lastarr = arr.join(',')
  
  this.framebuffers.unbind();
}


function HitTestFrameBuffer(gl, size, opt_depth) {
  this.gl = gl
  this.size = size;
  this.depth = opt_depth;
  var tex = {
    texture : twgl.createTexture(gl, {
      target : gl.TEXTURE_2D,
      width  : this.size,
      height : this.size,
      min    : gl.LINEAR,
      mag    : gl.LINEAR,
      format : gl.RGBA,
      type   : gl.UNSIGNED_BYTE,
      wrapS  : gl.CLAMP_TO_EDGE,
      wrapT  : gl.CLAMP_TO_EDGE
    })
  }
  if (this.depth) {
    var db = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, db);
    gl.renderbufferStorage(
        gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);
  }

  var fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
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
  this.framebuffer = fb;
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  this.texture = tex;
}

HitTestFrameBuffer.prototype.bind = function() {
  var gl = this.gl
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.size, this.size);
};

HitTestFrameBuffer.prototype.unbind = function() {
  var gl = this.gl
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(
      0, 0,
      gl.drawingBufferWidth || gl.canvas.width,
      gl.drawingBufferHeight || gl.canvas.height);
};

module.exports.HitTestShader  = HitTestShader
module.exports.HitTestManager = HitTestManager
