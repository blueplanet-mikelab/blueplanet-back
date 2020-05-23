require('dotenv').config()

String.prototype.replaceBetween = function (start, end, what) {
  return this.substring(0, start) + what + this.substring(end);
}

const fs = require('fs')

var current_date = new Date()
current_date.setDate(current_date.getDate() - 3)
current_date = current_date.toISOString().slice(0, 10).replace(/-/g, '')

const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const col = require('./config/collection.json')
const threads_col = db.get(col.collection_threads)
threads_col.find({}).then((doc) => {
  if (doc.length != 0) {
    var collection = JSON.parse(fs.readFileSync('./config/collection.json').toString())
    collection['collection_threads'] = collection.collection_threads.replaceBetween(18, 28, current_date)
    fs.writeFile('./config/collection.json', JSON.stringify(collection), (error) => {})
    console.log('here')
  }
})