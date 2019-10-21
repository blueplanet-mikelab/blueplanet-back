const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Test from Forums route')
})

module.exports = router