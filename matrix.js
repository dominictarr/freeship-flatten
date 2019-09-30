function min (polyline, initial) {
  return polyline.reduce(function (m, point) {
    m[0] = Math.min(point[0], m[0])
    m[1] = Math.min(point[1], m[1])
    return m
  },  initial || [Infinity, Infinity])
}
function max (polyline, initial) {
  return polyline.reduce(function (m, point) {
    m[0] = Math.max(point[0], m[0])
    m[1] = Math.max(point[1], m[1])
    return m
  },  initial || [-Infinity, -Infinity])
}

function scale (point, n) {
  return [point[0]*n, point[1]*n]
}

function add (point, _point) {
  return [point[0]+_point[0], point[1]+_point[1]]
}

function rect(a, b) {
  return [a, [a[0], b[1]], b, [b[0], a[1]]]
}

module.exports = {min, max, scale, add, rect}
