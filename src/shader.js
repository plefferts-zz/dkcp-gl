var twgl = require('../lib/twgl')

function Shader (getVertexBodySource, getFragmentBodySource){
  this.getVertexBodySource   = getVertexBodySource
  this.getFragmentBodySource = getFragmentBodySource
  
  this.program         = false
  this.vertex_header   = '';
  this.fragment_header =
      '#ifdef GL_ES\n' +
      '  precision mediump float;\n' +
      '#endif\n';

  this.vertex_uniforms   = {}
  this.fragment_uniforms = {}
  this.varyings          = {}
  this.attributes        = {}
}

Shader.prototype.getVertexSource = function () {
  var src = this.vertex_header;
  for (uniform in this.vertex_uniforms) {
    src += 'uniform ' +  this.vertex_uniforms[uniform] + ' ' + uniform + ';\n';
  }
  for (attribute in this.attributes) {
    src += 'attribute ' +  this.attributes[attribute] + ' ' + attribute + ';\n';
  }
  for (varying in this.varyings) {
    src += 'varying ' +  this.varyings[varying] + ' ' + varying + ';\n';
  }
  src += '\n' +
    'void main() {\n' +
      this.getVertexBodySource() +
    '}\n';
  return src;
}

Shader.prototype.getFragmentSource = function () {
  var src = this.fragment_header;
  for (uniform in this.fragment_uniforms) {
    src += 'uniform ' +  this.fragment_uniforms[uniform] + ' ' + uniform + ';\n';
  }
  for (varying in this.varyings) {
    src += 'varying ' +  this.varyings[varying] + ' ' + varying + ';\n';
  }
  src += 'void main() {\n' +
    this.getFragmentBodySource() +
  '}\n';
  return src;
}

Shader.prototype.getProgram = function (gl) {
  if (this.program)
    return this.program
  // console.log(this.getVertexSource(), this.getFragmentSource())
  return this.program = twgl.createProgramInfo(
    gl,
    [this.getVertexSource(), this.getFragmentSource()]
  )
}

module.exports = Shader