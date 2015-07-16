var eventify = require('eventify')

var WasdKeyBinding = function () {

  this.isDown = {}
  this.mapping = {
    '69': 'moveByY',
    '87': 'moveByNegZ',
    '65': 'moveByNegX',
    '68': 'moveByX',
    '83': 'moveByZ',
    '67': 'moveByNegY',
    '37': 'rotateByY',
    '38': 'rotateByX',
    '39': 'rotateByNegY',
    '40': 'rotateByNegX'
  }
}

WasdKeyBinding.prototype.getActions = function () {
  var actions = [];
  for(var k in this.mapping) {
    if (this.isDown[k]) {
      actions.push(this.mapping[k]);
    }
  }
  return actions;
}

WasdKeyBinding.prototype.bindKeyEvents = function(document, triggerEvents) {
  var me = this;
  var timeout;
  
  eventify.enable(this)
  document.addEventListener('keydown', function(e){
    if(e.keyCode >= 37 && e.keyCode <= 40)
      e.preventDefault();
    
    
    if((e.keyCode >= 37 && e.keyCode <= 40)
      || (e.keyCode >= 65 && e.keyCode <= 90)){
        var wasDown = me.isDown[e.keyCode];
        me.isDown[e.keyCode] = true;
      
      if (triggerEvents && !wasDown) {
        clearInterval(timeout);
        timeout = setInterval(function () {
          var actions = me.getActions();
          if (actions.length) {
            me.trigger('repeat', {actions: actions});
          }
        }, 50);
      }
      
    }
  });
  
  document.addEventListener('keyup', function(e){
    if(e.keyCode >= 37 && e.keyCode <= 40)
      e.preventDefault();
    if((e.keyCode >= 37 && e.keyCode <= 40)
      || (e.keyCode >= 65 && e.keyCode <= 90)){
        me.isDown[e.keyCode] = false;
    }
  });
  
  return this
}

WasdKeyBinding.prototype.applyActions = function (camera, actions, delta, theta) {
  for (var i in actions) {
    camera[actions[i]](delta, theta, -camera.getRotateY());
  }
}

module.exports = WasdKeyBinding