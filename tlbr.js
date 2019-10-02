var {min, max} = require('./matrix')
function tl(shape) {
  return min(shape)
}
function br(shape) {
  return max(shape)
}
function tr(shape) {
  return [max(shape)[0], max(shape)[1]]
}
function bl(shape) {
  return [min(shape)[0], max(shape)[1]]
}

function top (shape) {
  var m = min(shape), M = max(shape)
  return [(M[0] + m[0])/2, m[1]]
}
function bottom (shape) {
  var m = min(shape), M = max(shape)
  return [(M[0] + m[0])/2, M[1]]
}
function left (shape) {
  var m = min(shape), M = max(shape)
  return [m[0], (M[1] + m[1])/2]
}
function right (shape) {
  var m = min(shape), M = max(shape)
  return [M[0], (M[1] + m[1])/2]
}

module.exports = {tl, br, tr, bl, top, bottom, left, right}
