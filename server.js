require('dotenv').config()

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

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.listen(PORT, () => console.log('Server is running on Port: ' + PORT))

app.use('/home', homeRoute)
app.use('/forums', forumsRoute)
app.use('/api/users', usersRoute)
app.use('/api/my-triplist/triplists', triplistRoute)
app.use('/api/my-triplist/favorites', favoriteRoute)