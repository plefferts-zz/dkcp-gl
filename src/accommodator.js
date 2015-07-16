
function Accomodator(factory, maxRooms) {
  this.rooms    = []
  this.factory  = factory
  this.maxRooms = maxRooms
  this.affected = {}
}

Accomodator.prototype.add = function (guest) {
  this.getRoom(guest).add(guest)
  return guest
}

Accomodator.prototype.removeUnused = function () {
  for (var i in this.affected) {
    var room = this.affected[i]
    if (room.isUnused()) {
      room.remove()
      for (var j = this.rooms.length - 1; j >= 0; j --) {
        if (this.rooms[j] == room) {
          this.rooms.splice(j, 1)
        }
      }
    }
  }
  this.affected = {}
}

Accomodator.prototype.getRoom = function (guest) {
  var room, rooms = this.rooms
  for (var i=0; i<rooms.length; i++) {
    if (rooms[i].canAccommodate(guest)) {
      room = rooms[i]
      break
    }
  }

  if (!room) {
    if (rooms.length >= this.maxRooms) {
      throw 'Too many rooms'
    }
    console.log('new room, ', rooms.length + 1, ' total')
    rooms.unshift(room = this.factory())
    if (!room.canAccommodate(guest)) {
      throw new Error('unable to accommodate', guest)
    }
  }
  return room
}

module.exports = Accomodator