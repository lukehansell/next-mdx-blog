module.exports = posts => {
  const postsJSON = JSON.stringify(posts, null, 2)

  return `export default ${postsJSON}\n`
}
