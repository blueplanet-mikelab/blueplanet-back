const express = require('express')
const fs = require('fs');
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const admin = require('../firebase-admin')
const db = admin.database()
const ref = db.ref('users')

router.post('/signup', async function (req, res) {
  var userRef = ref.child(req.body.uid)
  await userRef.set((_.pick(req.body, ['displayName', 'email'])))
  res.send(userRef)
})

module.exports = router