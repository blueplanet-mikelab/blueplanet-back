const express = require('express')
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
  var checkRevoked = true;
  admin
    .auth()
    .verifyIdToken(req.headers.authorization, checkRevoked)
    .then(payload => {
      ref
        .child(`users/${payload.uid}`)
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
    .catch(error => {
      if (error.code == 'auth/id-token-revoked') {
        // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
        res.status(401).send({
          message: 'Reauthenticate required'
        })
      } else {
        // Token is invalid.
        res.status(401).send({
          message: error.message
        })
      }
    })
})

module.exports = router