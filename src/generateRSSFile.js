const RSS = require('rss')

const buildRSS = (posts, options) => {
  const { url, title } = options
  const feed = new RSS({
    title,
    // eslint-disable-next-line camelcase
    site_url: url,
  })

  posts.forEach(
    ({ title: postTitle, urlPath, publishDate: date }) => {
      feed.item({
        title: postTitle,
        guid: urlPath,
        url: url + urlPath,
        date,
      })
    },
  )

  return feed.xml({ indent: false })
}

const generateRSS = ({ url, title }) => posts =>
  buildRSS(posts, {
    url,
    title,
  })

module.exports = generateRSS
