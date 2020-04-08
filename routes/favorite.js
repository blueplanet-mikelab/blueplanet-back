const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_THREADS_COLLECTION)
const triplists_col = db.get(process.env.MONGODB_TRIPLISTS_COLLECTION)
const favorites_col = db.get(process.env.MONGODB_FAVORITES_COLLECTION)

const admin = require('../firebase-admin')



// Get all favorite thread(s)
router.get('/', async (req, res) => {

})

// Add thread to favorite
router.post(':threadId', async (req, res) => {

})

// Remove thread from favorite
router.delete('/:threadId', async (req, res) => {

})

module.exports = router