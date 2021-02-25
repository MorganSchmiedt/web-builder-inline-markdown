'use strict'
/* eslint-env node, es6 */

const {
  readFile,
} = require('fs')

const {
  promisify,
} = require('util')

const parser = require('@deskeen/markdown')

const readFileAsync = promisify(readFile)

const TAG_NAME = 'inlineMD'

/**
 * @param {Map} fileMap List of files with their content
 * @param {object} opt Module options
 * @param {Array<String>} opt.assets List of directories that contain the assets
 * @param {object} opt.parserOptions Parser options
 * @param {function} opt.onAssetsLoad Event raised after the content of the assets are loaded.
 * @param {object} lib Engine library
 * @param {function} lib.log
 * @param {function} lib.findAsset
 * @param {function} lib.getTag
 * @param {function} lib.getTagList
 */
module.exports = async(fileMap, opt, lib) => {
  const assets = opt.assets
  const { findAsset, getTag, getTagList, log } = lib

  if (assets == null) {
    log('No assets provided.')
    return
  }

  // Read file tags
  const depsPerFile = new Map()

  for (const [path, content] of fileMap.entries()) {
    const depList = getTagList(TAG_NAME, content)

    depsPerFile.set(path, depList)
  }

  // Initialize a unique list of dependencies
  const depMap = new Map()

  for (const depList of depsPerFile.values()) {
    for (const depPath of depList) {
      if (depMap.has(depPath) === false) {
        depMap.set(depPath, null)
      }
    }
  }

  // Fetch dependencies content
  await Promise.all(Array.from(depMap.keys())
    .map(async name => {
      const path = await findAsset(name, assets)

      if (path == null) {
        throw `Dependency not found: ${path}`
      }

      const content = await readFileAsync(path, { encoding: 'utf8' })

      depMap.set(name, content)
    }))

  // Raise event
  if (opt.onAssetsLoad != null) {
    opt.onAssetsLoad(depMap)
  }

  // Convert Markdown to HTML
  for (const [path, contentMD] of depMap.entries()) {
    const contentNode = parser.parse(contentMD, opt.parserOptions)
    const contentHtml = contentNode.innerHTML

    depMap.set(path, contentHtml)
  }

  // Replace assets
  for (const [path, tagList] of depsPerFile.entries()) {
    if (tagList.length > 0) {
      let content = fileMap.get(path)

      for (const tag of tagList) {
        const tagName = getTag(TAG_NAME, tag)
        const depValue = depMap.get(tag)

        content = content.replace(new RegExp(tagName, 'g'), depValue)

        log(`InlineMD: ${tag} in ${path}`)
      }

      fileMap.set(path, content)
    }
  }
}
