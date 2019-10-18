const dateFormat = require('dateformat')

const getFormattedDate = date => dateFormat(date, 'yyyy-mm-dd')

const buildSiteMapPage = (siteUrl, { urlPath, publishDate }) => `
    <url>
        <loc>https://${siteUrl}/${urlPath}</loc>
        ${
          publishDate
            ? `<lastmod>${getFormattedDate(publishDate)}</lastmod>`
            : ''
        }
    </url>
  `

const buildSiteMap = siteUrl => pages => `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map(page => buildSiteMapPage(siteUrl, page))}
    </urlset>
  `

module.exports = ({ siteUrl }) => pages =>
  buildSiteMap(siteUrl)(pages)
