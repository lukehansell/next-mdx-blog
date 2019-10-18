const fs = require('fs')
const Module = require('module')
const mdx = require('@mdx-js/mdx')
const babel = require('@babel/core')

const requireFromStringSync = (src, filename) => {
  const m = new Module()
  // eslint-disable-next-line no-underscore-dangle
  m._compile(src, filename)
  return m.exports
}

const requireMDXSync = (mdxSrc, filename) => {
  const jsx = mdx.sync(mdxSrc)
  const transformed = babel.transformSync(jsx, {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-proposal-object-rest-spread',
    ],
  })
  return requireFromStringSync(transformed.code, filename)
}

const requireMDXFileSync = mdxFilePath => {
  const mdxSrc = fs.readFileSync(mdxFilePath, { encoding: 'utf-8' })
  return requireMDXSync(mdxSrc, mdxFilePath)
}

module.exports = requireMDXFileSync
