var qs  = require('../lib/quaternions')

window.points = {}
function Point(p){
  this.p = p
  this.id = Point._nextId ++

  this.lines = []
  this.tris = []
  window.points[this.id] = this
}
Point._nextId = 1

Point.prototype.copy = function (hedron) {
  if (hedron.points[this.id]) return this
  if (!hedron.points[this.id + "'"]) {
    var p = new Point()
    p.p = this.p
    hedron.points[this.id + "'"] = p
    hedron.points[p.id] = p
  }
  return hedron.points[this.id + "'"]
}

Point.prototype.getCoords = function () {
  function normalize(x, y, z, w2) {
    var w = Math.sqrt(x * x + y * y + z * z)
    return [x / w * w2, y / w * w2, z / w * w2]
  }
  var p = qs.normalize(this.p)

  var w = Math.PI * 2
  var h = Math.PI

  var u = (((Math.atan2(p[2], p[0]) / Math.PI / 2) % 1 + 1) % 1) * w 
  var v = Math.asin(p[1]) / Math.PI * h

  var x = Math.cos(u) * Math.cos(v)
  var y = Math.sin(v)
  var z = Math.sin(u) * Math.cos(v)

  return normalize(x, y, z, 1)
}

function Line(counts, a, b) {
  this.a = a
  this.b = b

  this.tris = []
  this.id = Line._nextId ++
  if (counts) {
    this.a.lines.push(this)
    this.b.lines.push(this)
  }
}
Line._nextId = 1

Line.idForPoints = function (p0, p1) {
  if (p1.id > p0.id) return p0.id + '-' + p1.id
  return p1.id + '-' + p0.id
}

Line.prototype.point = function (hedron, percent) {
  if (percent == 0) return this.a.copy(hedron)
  if (percent == 1) return this.b.copy(hedron)
  
  var perc = Math.round(percent * 1000000)
  var id = this.id + '@' + perc
  if (!hedron.points[id]) {
    var p = qs.slerp(this.a.p, this.b.p, percent)
    // console.log(Point._nextId, id)
    hedron.points[id] = new Point(p)
  }
  return hedron.points[id]
}

function Tri (name, a, b, c) {
  this.lines = [a, b, c]
  this.id = Tri._nextId ++
  this.name = name

  this.lines.forEach(function (line) {
    line.tris.push(this)
    line.a.tris.push(this)
    line.b.tris.push(this)
  }.bind(this))
  
  this.points = []
  this.points.push(a.a)
  this.points.push(a.b)
  this.points.push(b.a != a.a && b.a != a.b ? b.a : b.b)
}
Tri._nextId = 1

function Hedron(tris) {
  this.tris   = tris
  this.splits = {}
  this.points = {}
  this.linesByPoints = {}
  this._nextTri = 1
}

Hedron.prototype.line = function (p0, p1, counts, please) {
  if (counts !== false) counts = true
  
  var id = Line.idForPoints(p0, p1)
  if (!this.linesByPoints[id]) {
    this.linesByPoints[id] = new Line(counts, p0, p1)
  } else if (please) {
    if (p0.id != this.linesByPoints[id].a.id)
      console.log('<>', p0.id, this.linesByPoints[id].a.id)
  }
  return this.linesByPoints[id]
}

Hedron.prototype.tri = function (l0, l1, l2) {
  return new Tri(this._nextTri ++, l0, l1, l2)
}

Hedron.prototype.getGeometry = function (individual_faces) {
  var tris        = []
  var points      = []
  var points_done = {}
  
  for (var i = 0; i < this.tris.length; i ++) {
    var tri_points = this.tris[i].points
    var geom_points = []
    for (var j in tri_points) {
      var point = tri_points[j]
      if (individual_faces) {
        points.push(point.getCoords())
        geom_points.push(points.length - 1)
      } else {
        if (!(point.id in points_done)) {
          points.push(point.getCoords())
          points_done[point.id] = points.length - 1
        }
        geom_points.push(points_done[point.id])
      }
    }
    tris.push(geom_points)
  }
  return {points : points, tris: tris};
}



function build_icos() {

  var mh = Math.atan2(Math.sqrt(5) / 5, 2 * Math.sqrt(5) / 5) / Math.PI * 180;

  function point(u, v) {
    u = u / 180 * Math.PI
    v = v / 180 * Math.PI

    var x = Math.cos(u) * Math.cos(v)
    var y = -Math.sin(v)
    var z = Math.sin(u) * Math.cos(v)

    return new Point(qs.normalize([x, y, z, 0]))
  }

  var points = []
  points.push(point(180, -90))
  for (var i = 0; i < 5; i ++) {
    points.push(point(360 / 5 * i, -mh))
    points.push(point(360 / 5 * i + 360 / 10, mh))
  }
  points.push(point(180, 90))

  var hedron = new Hedron([])

  var lines = {}
  function line(name, gen, a, b) {
    lines[name] = hedron.line(a, b)
  }

  var top    = 1;
  var bottom = 2;

  for (var i = 0; i < 5; i ++) {
    line(i + ':' + 0, 1, points[0],              points[top + 2 * i])
    line(i + ':' + 1, 1, points[top    + 2 * i], points[top    + 2 * ((i + 1) % 5)])
    line(i + ':' + 2, 1, points[top    + 2 * i], points[bottom + 2 * ((i + 0) % 5)])
    line(i + ':' + 3, 1, points[bottom + 2 * i], points[top    + 2 * ((i + 1) % 5)])
    line(i + ':' + 4, 1, points[bottom + 2 * i], points[bottom + 2 * ((i + 1) % 5)])
    line(i + ':' + 5, 1, points[11],             points[bottom + 2 * i])
  }

  var tris1 = [], tris2 = [], tris3 = [], tris4 = []
  for (var i = 0; i < 5; i ++) {
    var next_i = (i + 1) % 5
    tris1.push(hedron.tri(lines[i + ':' + 0],      lines[i + ':' + 1],      lines[next_i + ':' + 0]))
    tris2.push(hedron.tri(lines[i + ':' + 2],      lines[i + ':' + 3],      lines[i + ':' + 1]))
    tris3.push(hedron.tri(lines[i + ':' + 4],      lines[next_i + ':' + 2], lines[i + ':' + 3]))
    tris4.push(hedron.tri(lines[next_i + ':' + 5], lines[i + ':' + 4],      lines[i + ':' + 5]))
  }

  hedron.tris.push.apply(hedron.tris, tris1.concat(tris2).concat(tris3).concat(tris4))

  return hedron
}

function subdivide(n, hedron) {
  var newHedron = new Hedron([])
  var tri = null

  function point(x, y) {
    if (y < 0) return tri.points[0].copy(hedron)
    if (x == 0) {
      return tri.lines[0].point(hedron, (y + 1)/ n)
    }

    if (x == y + 1) {
      return tri.lines[2].point(hedron, (y + 1)/ n)
    }

    if (y + 1 < n) {
      var p0 = tri.lines[0].point(hedron, (y + 1) / n)
      var p1 = tri.lines[2].point(hedron, (y + 1) / n)
      if (tri.lines[0].a != tri.lines[2].a)
        throw up
      var line = hedron.line(p0, p1, false, true)
      return line.point(hedron, x / (y + 1))
    } else {
      var line = tri.lines[1]
      if (tri.lines[1].a == tri.lines[0].b)
        return line.point(hedron, x / (y + 1))
      return line.point(hedron, 1 - x / (y + 1))
    }
  
  }

  function downhill(x, y, please) {
    return hedron.line(point(x, y - 1), point(x, y), true, please)
  }

  function uphill(x, y, please) {
    return hedron.line(point(x, y - 1), point(x + 1, y), true, please)
  }

  function floor(x, y, please) {
    return hedron.line(point(x, y), point(x + 1, y), true, please)
  }

  for (var i = 0; i < hedron.tris.length; i ++) {
    tri = hedron.tris[i]
    var rowLength = 1
    for (var y = 0; y < n; y ++) {
      for (var x = 0; x < rowLength; x ++) {
        var l0, l1, l2;
        var x2 = Math.floor(x / 2)
        if (x % 2 == 0) {
          l0 = downhill(x2, y, true)
          l1 = floor(x2, y)
          l2 = uphill(x2, y)
        } else {
          l0 = uphill(x2, y, true)
          l1 = floor(x2, y - 1)
          l2 = downhill(x2 + 1, y)
        }
        newHedron.tris.push(newHedron.tri(l0, l1, l2))
      }
      rowLength += 2
    }
  }

  return newHedron
}

var base;
var cache = {}
module.exports =  function (subdivisions) {
  base = base || build_icos()
  return cache[subdivisions] || (cache[subdivisions] = subdivide(subdivisions, base))
}

