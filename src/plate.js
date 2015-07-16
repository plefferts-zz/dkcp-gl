var util  = require('util')
var Model = require('./model')
var IndicesAttribute  = require('./indices_attribute')

function Plate(shader){
  var accommodator = {affected: {}};
  Model.call(this, accommodator, shader, 1);
  
  var vertices = [
    [-1, -1],
    [-1,  1],
    [ 1, -1],
    [ 1,  1]
  ];
  
  this.addAttribute('position', 4, 'Float32Array', function (i, item) {
    vertices[i][2] = item.z
    vertices[i][3] = 1
    return vertices[i]
  });
  
}
util.inherits(Plate, Model)


module.exports = Plate