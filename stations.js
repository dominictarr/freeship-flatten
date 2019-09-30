'use strict'
var {AND, OR, TEXT, MANY, GROUP, JOIN, MAYBE, LOG} = require('stack-expression')
var newline = /^\s*\r?\n/
var __ = /^\s+/
var _ = /^\s*/

var number = TEXT(/^-?(?:0|[1-9][0-9]*)(?:.[0-9]*)?/, Number)

var title = AND(_, TEXT(OR("Station", "Waterline")), _, number)
var _number = /^-?[\d\.]+/ //match number but do not capture

var line = GROUP(AND(number, __, number, __, number, MAYBE(AND(_, "KNUCKLE"))))

var stations = MANY(
  GROUP(AND(
    _,
    title,
    _,
    GROUP(JOIN(line, __)),
    _
  ), d => {
    var station = d[0] === 'Station' ? 1 : -1
    var points = d[2].map(e => station == 1 ? [e[1], e[2]] : [e[1], e[0]])
//    if(station == 1)
      points = points.concat(points.slice().reverse().slice(1).map(e => [e[0]*-1, e[1]]))
    return {
      name: d[0]+':'+d[1],
      type: d[0],
      polyline: points
    }
  })
)

module.exports = stations

if(!module.parent) {
  var b = []
  process.stdin.on('data', function (d) {
    b.push(d)
  }).on('end', function () {
    var s = Buffer.concat(b).toString()
    var m =stations(s, 0)
    console.log(JSON.stringify(m.groups))
    console.error(m, s.length)
    if(m.length != s.length)
      console.log(JSON.stringify(s.substring(m.length, m.length + 200)))
  })
}
