const fs = require("fs");
const path = require("path");
const Module = require("module");
const { promisify } = require("util");

const RSS = require("rss");
const g = require("glob");
const mdx = require("@mdx-js/mdx");
const babel = require("@babel/core");

const dateFormat = require("dateformat");

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
    presets: ["@babel/preset-react"],
    plugins: [
      "@babel/plugin-transform-modules-commonjs",
      "@babel/plugin-proposal-object-rest-spread"
    ]
  });
  return requireFromStringSync(transformed.code, filename);
}

function requireMDXFileSync(path) {
  const mdxSrc = fs.readFileSync(path, { encoding: "utf-8" });
  return requireMDXSync(mdxSrc, path);
}

function convertFilePathToUrlPath(path) {
  return path
    .replace(/\\/, "/")
    .replace(/^pages/, "")
    .replace(/\.mdx?$/, "");
}

function readPostMetadata(filePath) {
  const mod = requireMDXFileSync(filePath);
  const { meta } = mod;

  return {
    ...meta,
    filePath,
    urlPath: convertFilePathToUrlPath(filePath),
    title: meta.title || path.basename(filePath),
    publishDate: new Date(meta.publishDate)
  };
}

function buildRSS(posts, options) {
  const { siteUrl, title } = options;
  const feed = new RSS({
    title,
    // eslint-disable-next-line camelcase
    site_url: siteUrl
  });

  posts.forEach(({ title, urlPath, publishDate: date }) => {
    feed.item({
      title,
      guid: urlPath,
      url: siteUrl + urlPath,
      date
    });
  });

  return feed.xml({ indent: true });
}

const buildPostData = options => ({
  author = options.author,
  authorLink = options.authorLink,
  avatar = options.avatar,
  urlPath,
  ...rest
}) => {
  return {
    author,
    authorLink,
    avatar,
    urlPath: path.join(options.assetPrefix || "/", urlPath),
    ...rest
  };
};

const getFormattedDate = date => dateFormat(date, "yyyy-mm-dd");

const buildSiteMapPage = (siteUrl, { urlPath, publishDate }) => {
  return `
    <url>
        <loc>https://${siteUrl}/${urlPath}</loc>
        ${
          publishDate
            ? `<lastmod>${getFormattedDate(publishDate)}</lastmod>`
            : ""
        }
    </url>
  `;
};

const buildSiteMap = siteUrl => pages => {
  return `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map(page => buildSiteMapPage(siteUrl, page))}
    </urlset>
  `;
};

module.exports = async function({ generateRSS, generateSiteMap, ...options }) {
  const postPaths = await glob("pages/**/*.mdx");
  const now = new Date();

  const posts = postPaths
    .map(readPostMetadata)
    .map(buildPostData(options))
    .filter(post => post.publishDate <= now)
    .sort((a, b) => b.publishDate - a.publishDate);

  const postsJSON = JSON.stringify(posts, null, 2);
  const exportPath = "posts.js";

  fs.writeFileSync(
    exportPath,
    "// automatically generated by build_post_index.js\n" +
      `export default ${postsJSON}\n`
  );

  console.info(`Saved ${posts.length} posts in ${exportPath}`);

  if (generateRSS) {
    const rssPath = "static/rss-feed.xml";
    const rssXML = buildRSS(posts, {
      ...options.site
    });

    fs.writeFileSync(rssPath, rssXML);

    console.info(`Saved RSS feed to ${rssPath}`);
  }

  if (generateSiteMap) {
    const pagePaths = await glob("pages/**/*.js");
    const pages = pagePaths
      .map(page =>
        page
          .replace("pages/", "")
          .replace(".js", "")
          .replace(/index$/, "")
      )
      .filter(page => !page.match(/^_/))
      .map(urlPath => ({
        urlPath
      }));

    const siteMapPath = "static/sitemap.xml";
    const siteMapXML = buildSiteMap(options.site.url)([...pages, ...posts]);

    fs.writeFileSync(siteMapPath, siteMapXML);

    console.info(`Saved site map to ${siteMapPath}`);
  }
};
