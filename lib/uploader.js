'use strict'

const path = require('path')
const Async = require('async')
const Boom = require('boom')
const Mime = require('mime')
const urlencode = require('urlencode')
const fs = require('fs')

function uploader (options) {
  const uploadPath = options.path
  const log = options.log

  return upload

  function upload (data, options, cb) {
    const files = []
    const fileNames = options.fileNames || {}
    Async.each(Object.keys(data), (prop, cbAsync) => {
      if (data.hasOwnProperty(prop)) files.push(prop)
      cbAsync()
    },
    (err) => {
      if (err) return cb(Boom.internal())
      saveFiles(files, fileNames, data, cb)
    })
  }

  function saveFiles (files, fileNames, data, cb) {
    if (!files) return cb(Boom.badData())
    if (files.length === 1) return saveFile(data[files[0]], fileNames[files[0]], cb)
    Async.map(files, (file, cbAsync) => {
      saveFile(data[file], fileNames[file], cbAsync)
    }, cb)
  }

  function saveFile (data, fileName, cb) {
    const mimeType = data.hapi.headers['content-type']
    const name = fileName || urlencode.decode(data.hapi.filename, 'utf8')
    const file = data
    const filePath = path.join(uploadPath, name)
    const fileStream = fs.createWriteStream(filePath)
    const fileInfo = {
      mimeType,
      name,
      path: filePath,
      extension: Mime.extension(mimeType)
    }

    fileStream.on('error', (err) => {
      if (err && err.errno === 34) {
        // Still not sure if throw is the best to go here
        log(['error'], new Error(
          'Error while saving file, possible issue with path - ' +
          err
        ))
      } else {
        // Still not sure if throw is the best to go here
        log(['error'], new Error('Error while saving file - ' + err))
      }
      return cb(Boom.internal())
    })

    file.pipe(fileStream)

    file.on('end', (err) => {
      if (err) {
        // Still not sure if throw is the best to go here
        log(['error'], new Error('Error while saving file - ' + err))
        return cb(Boom.badData(err))
      }
      return cb(null, fileInfo)
    })
  }
}

module.exports = uploader
