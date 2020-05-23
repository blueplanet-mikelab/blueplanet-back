require('dotenv').config()

var current_date = new Date()
current_date.setDate(current_date.getDate() - 3)
current_date = current_date.toISOString().slice(0, 10).replace(/-/g, '')

String.prototype.replaceBetween = function (start, end, what) {
  return this.substring(0, start) + what + this.substring(end);
}

const col = process.env.MONGODB_THREADS_COLLECTION.replaceBetween(18, 28, current_date)
const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})

const threads_col = db.get(col)
threads_col.find({}).then((doc) => {
  if (doc.length != 0) {
    process.env['MONGODB_THREADS_COLLECTION'] = col
  }
})

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const PORT = process.env.PORT || 3001

const homeRoute = require('./routes/home')
const forumsRoute = require('./routes/forums')
const usersRoute = require('./routes/users')
const triplistRoute = require('./routes/triplists')
const favoriteRoute = require('./routes/favorites')
const recentlyViewRoute = require('./routes/recentlyViewed')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.listen(PORT, () => console.log('Server is running on Port: ' + PORT))

app.use('/api/home', homeRoute)
app.use('/api/forums', forumsRoute)
app.use('/api/users', usersRoute)
app.use('/api/my-triplist/triplists', triplistRoute)
app.use('/api/my-triplist/favorites', favoriteRoute)
app.use('/api/my-triplist/recently-viewed', recentlyViewRoute)