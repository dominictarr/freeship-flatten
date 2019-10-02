var {min, max, scale, add, rect, bl, br} = require('./matrix')
var {tl,tr,bl,br,bottom}=require('./tlbr')
var hull = require('monotone-chain-convex-hull')
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


//fix transomes, they come out with lines crossed over some reason
plan.map(function (e) {
  if(/part/.test(e.name)) e.polyline = hull(e.polyline)
})

var seatline = stations.pop()
var seat_height = seatline.position
var side_width = 0.2
var side_top_width = 0.1
var nudge = 0.001 //1 mm, to ensure overlap
var loa = max(seatline.polyline)[1]
stations.map(e => {
  e.colour = 'green'
})

//Stations.
var plZ = stations[0].polyline
stations[0].polyline = gh.intersection(plZ, rect(min(plZ), [max(plZ)[0], 0.2]))[0]

var pl0 = stations[1].polyline
var hole =
gh.union([
  [min(pl0)[0]+side_width, seat_height],
    [max(pl0)[0]-side_width, seat_height],
    add(br(pl0), [-side_top_width, nudge]),
    add(bl(pl0), [side_top_width, nudge])
], [
    add(br(pl0), [0, nudge]),
    add(bl(pl0), [0, nudge]),
    [bottom(pl0)[0], seat_height]
])[0]

console.error('hole', hole)

//rect([min(pl0)[0]+side_width, seat_height], add(max(pl0), [-side_width, 0.1]))

stations[1].polyline = gh.diff(pl0, hole)[0]

var pl1 = stations[2].polyline
stations[2].polyline = gh.intersection(pl1, rect(min(pl1), [max(pl1)[0], seat_height]))[0]

var pl2 = stations[3].polyline
stations[3].polyline = gh.intersection(pl2, rect(min(pl2), [max(pl2)[0], seat_height]))[0]

function slice(shape, from, to) {
  var r = rect([min(shape)[0], from], [max(shape)[0], to])
  var b = gh.intersection(shape, r)
  return b[0]
}

var W = 0.006 //width of plywood
var mid = slice(seatline.polyline, stations[1].position, stations[2].position+W)
var bottom = min(mid)[1], left = min(mid)[0], right = max(mid)[0]
var notch_l = rect([left, bottom+W], [left+0.2, bottom-0.1])
var notch_r = rect([right-seat_height, bottom+W], [right, bottom-0.1])

mid = gh.diff(gh.diff(mid, notch_l)[0], notch_r)[0]

var seats = [
  {title: 'aft', polyline: slice(seatline.polyline, -1, stations[0].position+W), colour: 'orange'},
  {title: 'mid', polyline: mid, colour: 'black'},
  {title: 'fore', polyline: slice(seatline.polyline, stations[3].position-W, loa+0.1), colour: 'orange'}
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
