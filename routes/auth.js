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
const admin = require('../firebase-admin')

router.post('/', async (req, res) => {
  // let user = await user_col.findOne({ email: req.body.email })
  // if (!user) {
  //   return res.status(400).send('Incorrect email.')
  // }
  // const validPassword = await bcrypt.compare(req.body.password, user.password);
  // if (!validPassword) {
  //   return res.status(400).send('Incorrect password.')
  // }

  const idToken = Object.keys(req.body)[0]
  admin.auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      let uid = decodedToken.uid
      // console.log(uid)
    })
    .catch((error) => {
      console.log(error)
    })
  res.send(true)
})

module.exports = router