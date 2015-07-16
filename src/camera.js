var util      = require('util')
var m4        = require('../lib/twgl').m4
var v3        = require('../lib/twgl').v3
var Transform = require('./transform')

function degToRad(a) {
  return a / 180 * Math.PI
}

function UnriggedCamera(frameWidth, frameHeight, near, far) {
  this.frameWidth = frameWidth || 500;
  this.frameHeight = frameHeight || this.frameWidth;
  this.near = near || .1;
  this.far = far || 4096;
  this.perspective = new Float32Array(16);
  this.setFOV();

  this.matrix = new Float32Array(16);
  this.skymatrix = new Float32Array(16);
}
module.exports.UnriggedCamera = UnriggedCamera

UnriggedCamera.prototype.updateFOV = function () {
  this.setFOV(this.fov);
}
UnriggedCamera.prototype.setFOV = function(fov, leftHanded){
  this.fov = fov;
  if(!fov){
    var wh  = this.frameWidth > this.frameHeight
    var whr = wh 
      ? this.frameWidth / this.frameHeight / 2
      : this.frameHeight / this.frameWidth / 2

    m4.ortho(
      - (wh ? whr : .5),
      wh ? whr: .5,
      - (wh ? .5 : whr),
      wh ? .5 : whr,
      this.near,
      this.far,
      this.perspective
    );
  } else {
    m4.perspective(
      degToRad(fov),
      this.frameWidth / this.frameHeight,
      this.near,
      this.far,
      this.perspective
    );
    if (!leftHanded) {
      //right handed coordinate space
      this.perspective[8]  *= -1;
      this.perspective[9]  *= -1;
      this.perspective[10] *= -1;
      this.perspective[11] *= -1;
    }
  }

  
  return this;
}
UnriggedCamera.prototype.getAspect = function () {
  if (!this.aspect) {
    var larger = Math.max(this.frameHeight, this.frameWidth);
    this.aspect = [this.frameHeight / larger,  this.frameWidth / larger, 1, 0];
  }
  return this.aspect;
}
UnriggedCamera.prototype.computeMatrix = function (matrix) {
  if (matrix) {
    this.matrix = matrix;
  } else {
    m4.copy(this.perspective, this.matrix);
  }
  m4.copy(this.matrix, this.skymatrix);
  m4.setTranslation(this.skymatrix, [0, 0, 0], this.skymatrix);
  return this.matrix;
}


function BasicCamera(frameWidth, frameHeight, near, far) {
  UnriggedCamera.call(this, frameWidth, frameHeight, near, far);

  this.transform = new Transform();

  this.orientation = m4.identity(new Float32Array(16));
  this.skyorientation = new Float32Array(16);

  this.computeMatrix();
}

util.inherits(BasicCamera, UnriggedCamera)
module.exports.BasicCamera = BasicCamera

BasicCamera.prototype.computeMatrix = function(){
  require('../lib/columnMajor').mulMatrixMatrix4(this.perspective, this.orientation, this.matrix);
  return UnriggedCamera.prototype.computeMatrix.call(this, this.matrix);
}

BasicCamera.prototype.updateOrientation = function(){
  m4.identity(this.orientation);
  if(this.transform.rotateZ)
    m4.rotateZ(this.orientation, -this.transform.rotateZ, this.orientation);
  if(this.transform.rotateX)
    m4.rotateX(this.orientation, -this.transform.rotateX, this.orientation);
  if(this.transform.rotateY)
    m4.rotateY(this.orientation, -this.transform.rotateY, this.orientation);
  var pos = v3.mulScalar(this.transform.position, -1, new Float32Array(3));
  m4.copy(this.orientation, this.skyorientation);
  m4.translate(this.orientation, pos, this.orientation);
  return this;
}

BasicCamera.prototype.moveTo = function(x, y, z){
  this.transform.position[0] = x;
  this.transform.position[1] = y;
  this.transform.position[2] = z;
  this.updateOrientation();
  return this;
}

BasicCamera.prototype.moveBy = function(x, y, z){
  this.transform.position[0] += x;
  this.transform.position[1] += y;
  this.transform.position[2] += z;
  this.updateOrientation();
  return this;
}

BasicCamera.prototype.rotateTo = function(z, x, y){
  this.transform.rotateZ = z;
  this.transform.rotateX = x;
  this.transform.rotateY = y;
  this.updateOrientation();
}

BasicCamera.prototype.rotateBy = function(z, x, y){
  this.transform.rotateZ += z;
  this.transform.rotateX += x;
  this.transform.rotateY += y;
  this.updateOrientation();
}

BasicCamera.prototype.lookAt = function(target, up){
  m4.lookAt(this.transform.position, target, up, this.orientation);
  return this;
}

BasicCamera.prototype.getRotateY   = function () { return this.transform.rotateY; }
BasicCamera.prototype.moveByY      = function(d, r, a) { this.moveBy( 0,  d,  0);                         }
BasicCamera.prototype.moveByNegZ   = function(d, r, a) { this.moveBy(-d*Math.sin(a),  0,  d*Math.cos(a)); }
BasicCamera.prototype.moveByNegX   = function(d, r, a) { this.moveBy(-d*Math.cos(a),  0, -d*Math.sin(a)); }
BasicCamera.prototype.moveByX      = function(d, r, a) { this.moveBy( d*Math.cos(a),  0,  d*Math.sin(a)); }
BasicCamera.prototype.moveByZ      = function(d, r, a) { this.moveBy( d*Math.sin(a),  0, -d*Math.cos(a)); }
BasicCamera.prototype.moveByNegY   = function(d, r, a) { this.moveBy( 0, -d,  0);                         }
BasicCamera.prototype.rotateByY    = function(d, r, a) { this.rotateBy(0,  0,  r);                        }
BasicCamera.prototype.rotateByX    = function(d, r, a) { this.rotateBy(0,  r,  0);                        }
BasicCamera.prototype.rotateByNegY = function(d, r, a) { this.rotateBy(0,  0, -r);                        }
BasicCamera.prototype.rotateByNegX = function(d, r, a) { this.rotateBy(0, -r,  0);                        }
