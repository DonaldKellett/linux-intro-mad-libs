'use strict'
const mtp = require('madlibs-template-parser')
const fs = require('fs')
const path = require('path')
const gameText = fs.readFileSync(path.join(__dirname, '../game.txt')).toString()
const template = mtp(gameText)
const capitalize = str => str[0].toUpperCase() + str.slice(1)
const escapeHtml = require('escape-html')
const inputFormat = /^\s*([A-Za-z]+\s*)+$/

let form = '<form action="/" method="POST">'
let blankTypes = {}
for (let paragraph of template)
  for (let tokenIdx in paragraph) {
    let token = paragraph[tokenIdx]
    if (token.type === 'blank') {
      let id = token.variant
        .split` `
	.map((word, idx) => idx === 0 ? word : capitalize(word))
	.join`` + capitalize(token.category)
      if (typeof blankTypes[id] === 'undefined')
	blankTypes[id] = 0
      else
	++blankTypes[id]
      id = id + blankTypes[id]
      form += `<p><input name="${id}" type="text" placeholder="${capitalize(token.category)} (${token.variant})" value="" /></p>`
      paragraph[tokenIdx] = { id }
    } else {
      paragraph[tokenIdx] = token.text
    }
  }
form += '<p><input name="submit" type="submit" class="primary" value="Madlibify!" /></p>'
form += '</form>'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.view('index.hbs', { form })
  })
  fastify.post('/', async function (request, reply) {
    if (!request.body)
      return reply.code(400).view('400.hbs')
    let result = ''
    for (let paragraph of template) {
      let subResult = '<p>'
      for (let token of paragraph)
        if (typeof token === 'string') {
          subResult += escapeHtml(token) + ' '
	} else {
	  token = request.body[token.id]
          if (typeof token !== 'string')
	    return reply.code(400).view('400.hbs')
          if (!inputFormat.test(token))
	    return reply.code(400).view('400.hbs')
          subResult += `<b><i>${token}</i></b> `
	}
      subResult += '</p>'
      result += subResult
    }
    return reply.view('layout.hbs', { result })
  })
}
