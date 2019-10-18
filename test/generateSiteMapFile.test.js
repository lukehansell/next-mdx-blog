const parseXMLString = require('xml2js').parseString
const generateSiteMapFile = require('../src/generateSiteMapFile')

describe('without any pages', () => {
  let result

  beforeEach(done => {
    const resultXML = generateSiteMapFile({
      siteUrl: 'foo.com',
    })([])

    parseXMLString(resultXML, (_, output) => {
      result = output
      done()
    })
  })
  test('it generates a sitemap', () => {
    expect(result).toEqual({
      urlset: {
        $: {
          xmlns: `http://www.sitemaps.org/schemas/sitemap/0.9`,
        },
      },
    })
  })

  test('sitemap does not include any pages', () => {
    expect(result.urlset.url).toEqual(undefined)
  })
})

describe('with pages', () => {
  test('it generates a site map', done => {
    const resultXML = generateSiteMapFile({
      siteUrl: 'foo.com',
    })([
      {
        title: 'my post',
        urlPath: 'my-url',
        publishDate: '2019-10-11',
      },
    ])

    parseXMLString(resultXML, (_, result) => {
      expect(result).toEqual({
        urlset: {
          $: {
            xmlns: `http://www.sitemaps.org/schemas/sitemap/0.9`,
          },
          url: [
            {
              lastmod: ['2019-10-11'],
              loc: ['https://foo.com/my-url'],
            },
          ],
        },
      })

      done()
    })
  })
})
