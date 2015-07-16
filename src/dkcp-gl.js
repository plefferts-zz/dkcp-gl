var Screen           = require('./screen'),
    FrameRate        = require('./framerate'),
    camera           = require('./camera'),
    WasdKeyBinding   = require('./wasd_key_binding')


function DkcpGl(options) {
  this.screen = new Screen()
  
  if (options.frameRate) {
    var frameRate = FrameRate()
    var element = options.frameRate.element
    this.screen.on('frame', function (delta){
      frameRate(delta).log(options.frameRate.frequency || 120, function (rate) {
        var text = 'FPS: ' + Math.floor(rate * 100) / 100
        element.innerText = text
      });
    })
  }
  
  this.screen.init(options.canvas, options.init || function (gl) {
    return {
      enable : [gl.CULL_FACE, gl.DEPTH_TEST],
      cullFace : gl.BACK
    }
  })

  this.camera = new camera.BasicCamera(this.screen.width(), this.screen.height()).setFOV(60);

  if (options.wasd) {
    var kb = new WasdKeyBinding()
      .bindKeyEvents(options.wasd.document, false);

    var delta = options.wasd.delta || .05;
    var theta = options.wasd.theta || -Math.PI / 120;
    this.screen.on('frame', function (elapsed) {
      var f = elapsed / 1000 * 60;
      var actions = kb.getActions();
      if (actions.length) {
        kb.applyActions(this.camera, actions, delta * f, theta * f)
        this.screen.beginFrameRendering(false)
      }
    }.bind(this))
  }


}

DkcpGl.Screen            = Screen
DkcpGl.FrameRate         = FrameRate
DkcpGl.camera            = camera
DkcpGl.WasdKeyBinding    = WasdKeyBinding

DkcpGl.Allocation        = require('./allocation')
DkcpGl.Attribute         = require('./attribute')
DkcpGl.Environment       = require('./environment')
DkcpGl.IndicesAttribute  = require('./indices_attribute')
DkcpGl.Model             = require('./model')
DkcpGl.Plate             = require('./plate')
DkcpGl.Renderable        = require('./renderable')
DkcpGl.RenderSet         = require('./render_set')
DkcpGl.Shader            = require('./shader')
DkcpGl.shaders           = require('./shaders')
DkcpGl.Texture           = require('./texture')
DkcpGl.Transform         = require('./transform')
DkcpGl.geodesic          = require('./geodesic')

module.exports = DkcpGl