const express = require('express')
const router = express.Router()

require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, { authSource: 'admin' })
const collection = db.get(process.env.MONGODB_COLLECTION)

router.get('/', async (req, res) => {
    collection
        .find({}, { limit: 20 })
        .then(forum => res.json(forum))
        .catch(err => res.status(500).send({ message: err.message }))
})

module.exports = router