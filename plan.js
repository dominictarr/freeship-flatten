'use strict'
var {AND, TEXT, MANY, GROUP, JOIN, MAYBE} = require('stack-expression')
var newline = /^\s*\r?\n/
var __ = /^\s+/
var _ = /^\s*/
var title = AND(/^Boundary [^:]*\:/, _, TEXT(/^[^\n\r]*/))

var number = TEXT(/^(?:0|[1-9][0-9]*)(?:.[0-9]*)?/, Number)
var line = GROUP(AND(_, number, __, number))

var development = MANY(
  GROUP(
    AND(
      _,
      title,
      _,
      GROUP(JOIN(line, newline)),
    _
  ) , d => {
    console.error(d)
    return {name: d[0], polyline: d[1]}
  })
)

module.exports = development
module.exports.number = number

if(!module.parent) {
  var b = []
  process.stdin.on('data', function (d) {
    b.push(d)
  }).on('end', function () {
    var s = Buffer.concat(b).toString()
    console.log(development(s, 0).groups)
  })
}
