const express = require('express')
const fs = require('fs');
const router = express.Router()
const bcrypt = require('bcrypt')
const _ = require('lodash')
require('dotenv').config()

const admin = require('../firebase-admin')
const db = admin.database()
const ref = db.ref('users')

router.post('/', async (req, res) => {
  const idToken = Object.keys(req.body)[0]
  admin.auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // use uid to find user
      let uid = decodedToken.uid
      // ref.on("value", (snapshot) => {
      //   console.log(snapshot.val())
      // })
    })
    .catch((error) => {
      console.log(error)
    })
  res.send(true)
})

module.exports = router