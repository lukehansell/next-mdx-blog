const fs = require('fs');
const path = require('path');
const Module = require('module');
const { promisify } = require('util');

const RSS = require('rss');
const g = require('glob');
const mdx = require('@mdx-js/mdx');
const babel = require('@babel/core');

const glob = promisify(g);

function requireFromStringSync(src, filename) {
  const m = new Module();
  m._compile(src, filename);
  return m.exports;
}

function requireMDXSync(mdxSrc, filename) {
  const jsx = mdx.sync(mdxSrc);
  const transformed = babel.transformSync(jsx, {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  });
  return requireFromStringSync(transformed.code, filename);
}

function requireMDXFileSync(path) {
  const mdxSrc = fs.readFileSync(path, { encoding: 'utf-8' });
  return requireMDXSync(mdxSrc, path);
}

function readPostMetadata(filePath) {
  const mod = requireMDXFileSync(filePath);
  const { meta } = mod;

  return {
    filePath,
    urlPath: filePath
      .replace(/\\/, '/')
      .replace(/^pages/, '')
      .replace(/\.mdx?$/, ''),
    title: meta.title || path.basename(filePath),
    publishDate: new Date(meta.publishDate)
  };
}

function generateRSS(posts) {
  const siteUrl = 'https://hipstersmoothie.com';
  const feed = new RSS({
    title: "Andrew Lisowski's blog",
    // eslint-disable-next-line camelcase
    site_url: siteUrl
  });

  posts.forEach(post => {
    feed.item({
      title: post.title,
      guid: post.urlPath,
      url: siteUrl + post.urlPath,
      date: post.publishDate
    });
  });

  return feed.xml({ indent: true });
}

module.exports = async function(options) {
  const postPaths = await glob('pages/**/*.mdx');
  const now = new Date();

  const posts = postPaths
    .map(readPostMetadata)
    .map(post => {
      post.author = post.author || options.author;
      post.authorLink = post.authorLink || options.authorLink;
      post.avatar = post.avatar || options.avatar;

      return post;
    })
    .filter(post => post.publishDate <= now)
    .sort((a, b) => b.publishDate - a.publishDate);

  const postsJSON = JSON.stringify(posts, null, 2);
  const exportPath = 'posts.js';

  fs.writeFileSync(
    exportPath,
    '// automatically generated by build_post_index.js\n' +
      `export default ${postsJSON}\n`
  );

  console.info(`Saved ${posts.length} posts in ${exportPath}`);

  const rssPath = 'static/rss-feed.xml';
  const rssXML = generateRSS(posts);

  fs.writeFileSync(rssPath, rssXML);

  console.info(`Saved RSS feed to ${rssPath}`);
};
