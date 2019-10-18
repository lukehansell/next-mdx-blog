const g = require('glob')
const { promisify } = require('util')

const glob = promisify(g)

module.exports = async () => {
  const pagePaths = await glob('pages/**/*.js')
  return pagePaths
    .map(page =>
      page
        .replace('pages/', '')
        .replace('.js', '')
        .replace(/index$/, ''),
    )
    .filter(page => !page.match(/^_/))
    .map(urlPath => ({
      urlPath,
    }))
}
