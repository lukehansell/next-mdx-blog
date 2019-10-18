const BlogPlugin = require('./BlogPlugin')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    if (!options.defaultLoaders) {
      throw new Error(
        'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade',
      )
    }

    config.plugins.push(new BlogPlugin(nextConfig))

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options)
    }

    return config
  },
})
