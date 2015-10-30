var eventify = require('eventify')

var MouseTrack = function (){

  this.mousemove = this.mousemove.bind(this)
  this.mousedown = this.mousedown.bind(this)
  this.mouseup   = this.mouseup.bind(this)

  this.x         = 0
  this.y         = 0

}

MouseTrack.prototype.bindMouseEvents = function (canvas, fn) {
  eventify.enable(this)

  this.canvas = canvas
  this.fn     = fn
  canvas.addEventListener('mousedown',  this.mousedown)
  canvas.addEventListener('mouseenter', this.mousemove)
  canvas.addEventListener('mousemove',  this.mousemove)
}

MouseTrack.prototype.trackEvent = function (e) {
  var rect            = this.canvas.getBoundingClientRect()
  this.x              = (e.clientX - rect.left) // / rect.width  * camera.frameWidth
  this.y              = (e.clientY - rect.top)  // / rect.height * camera.frameHeight
  this.track()
}

MouseTrack.prototype.track = function () {
  this.previousTarget = this.target
  this.target         = this.fn && this.fn(this.x, this.y)
  if (this.target != this.previousTarget) {
    this.previousTarget && this.trigger('mouseout', this.previousTarget)
    this.target && this.trigger('mouseover', this.target)
  }
}

MouseTrack.prototype.mousemove = function (e) {
  this.trackEvent(e)
  this.trigger('mousemove', this.target)
}

MouseTrack.prototype.mousedown = function (e) {
  this.trackEvent(e)
  this.clickTarget = this.target
  this.canvas.addEventListener('mouseup', this.mouseup)
  this.trigger('mousedown', this.target)
}

MouseTrack.prototype.mouseup = function (e) {
  this.trackEvent(e)
  this.canvas.removeEventListener('mouseup', this.mouseup)
  this.trigger('mouseup', this.target)
  if (this.clickTarget == this.target) {
    this.trigger('click', this.clickTarget)
  }
  this.clickTarget = null
}

module.exports = MouseTrack