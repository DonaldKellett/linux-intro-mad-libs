'use strict'
const mtp = require('madlibs-template-parser')
const fs = require('fs')
const path = require('path')
const gameText = fs.readFileSync(path.join(__dirname, '../game.txt')).toString()
const template = mtp(gameText)
const capitalize = str => str[0].toUpperCase() + str.slice(1)

let form = '<form action="/" method="POST">'
let blankTypes = {}
for (let paragraph of template)
  for (let token of paragraph)
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
    }
form += '<p><input name="submit" type="submit" class="primary" value="Madlibify!" /></p>'
form += '</form>'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.view('index.hbs', { form })
  })
}
