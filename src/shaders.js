

module.exports.color = function (color) {
  var c = [];
  for (var i=0; i<4; i++) {
    c.push((color[i] || (i == 3 ? 1 : 0)).toFixed(2) + '');
  }
  return (
    'vec4(' + c.join(',') + ')'
  );
  
}