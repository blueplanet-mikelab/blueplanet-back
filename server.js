require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
// const mongoose = require('mongoose')

const PORT = 3001

const forumsRoute = require('./routes/forums')

// need to identify MONGODB_URL later on
// mongoose.connect(process.env.MONGODB_URL, {
//     useNewUrlParser: true
// })

// const db = mongoose.connection
// db.on('error', (err) => console.log(err))
// db.once('open', () => console.log('MongoDB database connection established successfully'))

app.use(cors())
app.use(bodyParser.json())
app.listen(PORT, () => console.log('Server is running on Port: ' + PORT))

app.use('/forums', forumsRoute)