const express = require('express')
const fs = require('fs');
const router = express.Router()
const bcrypt = require('bcrypt')
const _ = require('lodash')
require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const user_col = db.get(process.env.MONGODB_USER_COLLECTION)

router.post('/register', async function (req, res) {
  let user = await user_col.findOne({ email: req.body.email })
  if (user) {
    return res.status(400).send('The user already exists.')
  } else {
    user = (_.pick(req.body, ['fullName', 'email', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    
    user_col.insert(user)
    res.send(_.pick(user, ['_id', 'fullName', 'email']))
  }
})

// mock
router.get('/triplist', function (req, res) {

})

module.exports = router