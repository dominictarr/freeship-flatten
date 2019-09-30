var {min, max, scale, add, rect} = require('./matrix')
var hull = require('monotone-convex-hull-2d')
var fs = require('fs')
var gh = require('greiner-hormann')
var Stations = require('./stations')
var Plan = require('./plan')
var stations, plan

var files = process.argv.slice(2).map(function (file) {
  var src = fs.readFileSync(file, 'utf8')
  var m
  if((m = Stations(src, 0)) && m.groups) {
    stations = m.groups
  } else {

  if((m = Plan(src, 0))  && m.groups)
    plan = m.groups
    console.error(plan)
  }
})


var waterline = stations.pop()

stations.map(e => {
  e.colour = 'green'
})

//Stations.
var plZ = stations[0].polyline
stations[0].polyline = gh.intersection(plZ, rect(min(plZ), [max(plZ)[0], 0.2]))[0]

var pl0 = stations[1].polyline
var hole = rect([min(pl0)[0]+0.2, 0.2], add(max(pl0), [-0.2, 0.1]))

stations[1].polyline = gh.diff(pl0, hole)[0]

var pl1 = stations[2].polyline
stations[2].polyline = gh.intersection(pl1, rect(min(pl1), [max(pl1)[0], 0.2]))[0]
var pl2 = stations[3].polyline
stations[3].polyline = gh.intersection(pl2, rect(min(pl2), [max(pl2)[0], 0.2]))[0]

function slice(shape, from, to) {
  var r = rect([min(shape)[0], from], [max(shape)[0], to])
  var b = gh.intersection(shape, r)
  return b[0]
}

var W = 0.006 //width of plywood
var mid = slice(waterline.polyline, 1.2, 1.40+W)
var bottom = min(mid)[1], left = min(mid)[0], right = max(mid)[0]
var notch_l = rect([left, bottom+W], [left+0.2, bottom-0.1])
console.error("NOTCH", notch_l)
var notch_r = rect([right-0.2, bottom+W], [right, bottom-0.1])

mid = gh.diff(gh.diff(mid, notch_l)[0], notch_r)[0]

var seats = [
//  {title: 'notch', polyline: notch_l, colour: 'green'},
  {title: 'aft', polyline: slice(waterline.polyline, -1, 0.20+0.006), colour: 'orange'},
  {title: 'mid', polyline: mid, colour: 'black'},
  {title: 'fore', polyline: slice(waterline.polyline, 1.96-0.006, 2.2), colour: 'orange'}
]
var polys = [].concat(stations || []).concat(plan || []).concat(seats), min_all, max_all

polys.forEach(poly => {
  min_all = min(poly.polyline, min_all)
  max_all = max(poly.polyline, max_all)
})
min_all = scale(min_all, 1000)
max_all = scale(max_all, 1000)

console.log('<svg viewBox="' + (min_all.concat(max_all)).join(' ') + '" xmlns="http://www.w3.org/2000/svg">')

polys.forEach(poly => {
  var s = ''
  poly.polyline.forEach((point, i) => {
    s += (i ? "L" : "M") + " " + scale(point, 1000).join(' ')
  })
  console.log('<path fill="none" stroke="' + (poly.colour || 'red') + '" strokeWidth="1px" label="'+poly.name+'" d="'+s+' Z"/>')
})

console.log('</svg>')
