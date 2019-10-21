require('dotenv').config()

const express = require('express')
const app = express()
// const mongoose = require('mongoose')

const PORT = 3001

const forumsRoute = require('./routes/forums')

// need to identify MONGODB_URL later on
// mongoose.connect(process.env.MONGODB_URL, {
//     useNewUrlParser: true
// })

// const db = mongoose.connection
// db.on('error', (err) => console.log(err))
// db.once('open', () => console.log('Successfully connected to Database'))

app.use(express.json())
app.listen(PORT, () => console.log('Server is running on Port: ' + PORT))

app.use('/forums', forumsRoute)