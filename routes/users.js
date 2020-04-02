const express = require('express')
const fs = require('fs');
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const admin = require('../firebase-admin')
const db = admin.database()
const ref = db.ref()

router.get('/', async function (req, res) {
  await ref
    .child('users')
    .once('value')
    .then((snapshot) => {
      res.send(snapshot.val())
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
})

router.post('/signup', async function (req, res) {
  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`users/${decodedToken.uid}`)
        .push(_.pick(req.body, ['email', 'displayName']))
        .then((user) => {
          user.on('value', (snapshot) => {
            res.send(snapshot.val())
          })
        })
        .catch((error) => {
          res.status(500).send({
            message: error.message
          })
        })
    })
})

module.exports = router