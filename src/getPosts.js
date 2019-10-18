const path = require('path')
const g = require('glob')
const { promisify } = require('util')
const readMDXFile = require('./readMDXFile')

const glob = promisify(g)

const buildPostData = options => ({
  author = options.author,
  authorLink = options.authorLink,
  avatar = options.avatar,
  urlPath,
  ...rest
}) => ({
  author,
  authorLink,
  avatar,
  urlPath: path.join(options.assetPrefix || '/', urlPath),
  ...rest,
})

const convertFilePathToUrlPath = filePath =>
  filePath
    .replace(/\\/, '/')
    .replace(/^pages/, '')
    .replace(/\.mdx?$/, '')

const readPostMetadata = filePath => {
  const { meta } = readMDXFile(filePath)

  return {
    ...meta,
    filePath,
    urlPath: convertFilePathToUrlPath(filePath),
    title: meta.title || path.basename(filePath),
    publishDate: new Date(meta.publishDate),
  }
}

module.exports = async options => {
  const postPaths = await glob('pages/**/*.mdx')
  const now = new Date()

  const posts = postPaths
    .map(readPostMetadata)
    .map(buildPostData(options))
    .filter(post => post.publishDate <= now)
    .sort((a, b) => b.publishDate - a.publishDate)

  return posts
}
