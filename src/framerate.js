module.exports = function() {
  var j = 0;
  var frames = 1000/60;
  var rate = 0;
  var o = {
    log : function(frequency, log) {
      if(j % frequency == 0) {
        log ? log(rate) : console.log(rate);
      }
    }
  };
  return function(delta){
    j ++;
    frames += (delta - frames)/100;
    rate = 1000/frames;
    return o;
  }
}
