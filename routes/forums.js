const express = require('express')
const router = express.Router()

let Forum = require('../models/forum');

router.get('/', (req, res) => {
    res.send('Test from Forums route')
    // Forum.find((err, forums) => {
    //     if (err) {
    //         console.log(err) 
    //     }
    //     else {
    //         res.json(forums) 
    //     }
    // })
})

module.exports = router