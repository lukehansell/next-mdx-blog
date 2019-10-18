const generatePostsFile = require('../src/generatePostsFile')

test('it creates and exportable json object', () => {
  const result = generatePostsFile({ foo: 'bar' })
  expect(result).toEqual('export default {\n  "foo": "bar"\n}\n')
})
