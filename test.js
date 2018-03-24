var AJV = require('ajv')
var deepEqual = require('deep-equal')
var editDistance = require('edit-distance')
var schema = require('./schema')
var suite = require('./')
var tape = require('tape')

tape('schema', function (t) {
  var ajv = new AJV()
  t.assert(ajv.validate(schema, suite), 'suite matches schema')
  t.equal(ajv.errors, null, 'no schema errors')
  t.end()
})

tape('edit-distance', function (t) {
  suite.tests.forEach(function (test) {
    t.test(test.comment, function (t) {
      var result = editDistance.ted(
        test.t1, test.t2, children, insert, remove, update
      )
      t.equal(result.distance, test.distance)
      var mapping = result.pairs().map(function (pair) {
        var t1 = pair[0] ? pair[0].label : null
        var t2 = pair[1] ? pair[1].label : null
        var type
        if (t1 === t2) type = 'match'
        else if (t1 === null) type = 'insert'
        else if (t2 === null) type = 'remove'
        else type = 'rename'
        return {type: type, t1: t1, t2: t2}
      })
      t.assert(
        test.mappings.some(function (validMapping) {
          return deepEqual(mapping, validMapping)
        })
      )
      t.end()
    })
  })
  function children (node) { return node.children }
  function insert () { return suite.costs.insert }
  function remove () { return suite.costs.remove }
  function update (from, to) {
    return from.label === to.label
      ? suite.costs.match
      : suite.costs.update
  }
})
