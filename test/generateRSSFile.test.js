const parseXMLString = require('xml2js').parseString
const generateRSSFile = require('../src/generateRSSFile')

describe('without any posts', () => {
  test('it correctly builds the content', () => {
    const posts = []
    const result = generateRSSFile({
      url: 'foo.com',
      title: 'bar baz qux',
    })(posts)

    const expected = /<\?xml version="1.0" encoding="UTF-8"\?><rss xmlns:dc="http:\/\/purl\.org\/dc\/elements\/1\.1\/" xmlns:content="http:\/\/purl\.org\/rss\/1\.0\/modules\/content\/" xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom" version="2.0"><channel><title><!\[CDATA\[bar baz qux\]\]><\/title><description><!\[CDATA\[bar baz qux\]\]><\/description><link>foo\.com<\/link><generator>RSS for Node<\/generator><lastBuildDate>.+?<\/lastBuildDate><\/channel><\/rss>/

    expect(result).toEqual(expect.stringMatching(expected))
  })
})

describe('with a post', () => {
  test('it correctly builds the content', done => {
    const posts = [
      {
        title: 'post title',
        urlPath: '/my-url',
        publishDate: '2019-10-11',
      },
    ]

    const xmlResult = generateRSSFile({
      url: 'foo.com',
      title: 'bar baz qux',
    })(posts)

    parseXMLString(xmlResult, (_, result) => {
      expect(result.rss.channel[0].item[0]).toEqual({
        title: ['post title'],
        link: ['foo.com/my-url'],
        guid: [{ _: '/my-url', $: { isPermaLink: 'false' } }],
        pubDate: ['Fri, 11 Oct 2019 00:00:00 GMT'],
      })
      done()
    })
  })
})
