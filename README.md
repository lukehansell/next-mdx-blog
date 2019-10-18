<div align="center">
  <h1>next-mdx-blog</h1>
  <p>Easy blog for next.js</p>
</div

`next-mdx-blog` enables you to easily add a blog to any `next.js` based project.

Features:

- MDX Blog
- RSS Feed
- Sitemap generation
- Simple Setup
- Customizable Rendering

## Install

```sh
yarn add next-mdx-blog
```

## Usage

You can store your blog posts anywhere in the `pages` directory. But to keep things tidy I like to keep all blog posts in `pages/blog`.

### Blog Post Format

A post has a `meta` header. The rest of the blog post is MDX. Anything in the `meta` header will be stored.

```mdx
export const meta = {
  author: 'Andrew Lisowski',
  authorLink: 'https://github.intuit.com/alisowski',
  avatar: 'https://avatars2.githubusercontent.com/u/1192452?s=400&v=4'
  publishDate: '2018-05-10T12:00:00Z',
  title: 'First Post',
}
# Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 B

C
```

### Next Plugin

To get your blog index to build you must use the `next-mdx-blog` plugin in your `next.config.js`. You must also add `@zeit/next-mdx` to parse your blog posts.

Make sure to include `mdx` in your `pageExtensions`.

```js
const withPlugins = require('next-compose-plugins')

// Generates Blog Index
const withBlog = require('next-mdx-blog')
const withMDX = require('@zeit/next-mdx')()

module.exports = withPlugins([withMDX, withBlog], {
  pageExtensions: ['js', 'mdx'],
})
```

Now you `next` website will generate a `posts.js` with all the metadata about the posts in your project. You can use to build your blog. Anything stored in the `meta` header can be found here.

#### Configuration

You can add a global author by passing a configuration objecting into `next-mdx-blog`.

```js
const withBlog = require('next-mdx-blog')
const withMDX = require('@zeit/next-mdx')()

module.exports = withPlugins([withMDX, withBlog], {
  author: 'Luke Hansell',
  authorLink: 'https://github.com/lukehansell',
  avatar:
    'https://avatars1.githubusercontent.com/u/6229129?s=460&v=4',
  pageExtensions: ['js', 'mdx'],
})
```

#### Configuration options

- `author` - Default author name\*
- `authorLink` - Default author url\*
- `avatar` - Default author avatar url\*
- `generateRSS` - Defines whether to create the RSS feed file
- `generateSiteMap` - Defines whether to create the Site Map file
- `site` - Configuration of the site for generated files

`*` - displays if none provided in post file`

##### `site` configuration

- `url` - Root url for the site
- `title` - Site's title

##### Asset Prefix

If you website is being served out of something other than the root domain you might need to add a prefix to your urls. Such as is the case with github pages.

```js
const withBlog = require('next-mdx-blog')
const withMDX = require('@zeit/next-mdx')()

module.exports = withPlugins([withMDX, withBlog], {
  assetPrefix: 'my-github-project',
  pageExtensions: ['js', 'mdx'],
})
```
