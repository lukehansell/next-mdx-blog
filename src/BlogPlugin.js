const fs = require('fs')
const path = require('path')
const getPosts = require('./getPosts')
const getPages = require('./getPages')
const generatePostsFile = require('./generatePostsFile')
const generateRSS = require('./generateRSSFile')
const generateSiteMap = require('./generateSiteMapFile')

const writeToFile = fileName => content => {
  return new Promise((res, rej) => {
    fs.writeFile(fileName, content, err => {
      if (err) return rej(err)
      return res(fileName)
    })
  })
}

class BlogPlugin {
  constructor(options) {
    this.options = options

    const rootPath =
      options.experimental && options.experimental.publicDirectory
        ? 'public'
        : 'static'

    this.writeRSSFile = writeToFile(
      path.join(rootPath, 'rss-feed.xml'),
    )
    this.writeSiteMapFile = writeToFile(
      path.join(rootPath, 'sitemap.xml'),
    )
    this.writePostsFile = writeToFile('./posts.js')

    this.generateRSSForSite = generateRSS({
      ...this.options.site,
    })

    this.generateSiteMapForSite = generateSiteMap({
      siteUrl: this.options.site.url,
    })
  }

  static getChangedFiles(compiler) {
    const { watchFileSystem } = compiler
    const watcher =
      watchFileSystem.watcher || watchFileSystem.wfs.watcher

    return Object.keys(watcher.mtimes)
  }

  async generateBlog(options) {
    const posts = await getPosts(options)
    const pages = await getPages()

    const postsFileContent = generatePostsFile(posts)
    const fileWriteFunctions = [this.writePostsFile(postsFileContent)]

    if (options.generateRSS) {
      const rssFileContent = this.generateRSSForSite(posts)
      fileWriteFunctions.push(this.writeRSSFile(rssFileContent))
    }

    if (options.generateSiteMap) {
      const siteMapContent = this.generateSiteMapForSite([
        ...posts,
        ...pages,
      ])
      fileWriteFunctions.push(this.writeSiteMapFile(siteMapContent))
    }

    await Promise.all(fileWriteFunctions)
  }

  async apply(compiler) {
    // Set up blog index at start
    compiler.hooks.environment.tap('MyPlugin', async () => {
      await this.generateBlog(this.options)
    })

    // Re generate blog index when files change
    compiler.hooks.watchRun.tap('MyPlugin', async () => {
      const changedFile = BlogPlugin.getChangedFiles(compiler)

      if (changedFile.find(file => file.includes('/pages/'))) {
        await this.generateBlog(this.options)
      }
    })
  }
}

module.exports = BlogPlugin
