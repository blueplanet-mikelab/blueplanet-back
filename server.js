require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const PORT = 3001

const forumsRoute = require('./routes/forums')

app.use(cors())
app.use(bodyParser.json())
app.listen(PORT, () => console.log('Server is running on Port: ' + PORT))

app.use('/forums', forumsRoute)