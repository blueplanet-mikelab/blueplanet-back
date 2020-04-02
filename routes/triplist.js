const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const admin = require('../firebase-admin')
const db = admin.database()
const ref = db.ref()

// Retrieve all triplist(s)
router.get('/triplists', async function (req, res) {
  await ref
    .child('triplists')
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

// Create a new triplist
router.post('/triplists/add', async function (req, res) {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }

  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`triplists/${decodedToken.uid}`)
        .push(_.pick(req.body, ['title', 'des', 'thumbnail', 'threads', 'createdAt', 'updatedAt']))
        .then((triplist) => {
          triplist.on('value', (snapshot) => {
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

// Get a triplist by id
router.get('/triplists/:id', async function (req, res) {
  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`triplists/${decodedToken.uid}/${req.params.id}`)
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
})

// Update triplist by id
router.put('/triplists/:id', async function (req, res) {
  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`triplists/${decodedToken.uid}/${req.params.id}`)
        .update(_.pick(req.body, ['title', 'des', 'thumbnail', 'threads', 'createdAt', 'updatedAt']))
        .then(() => {
          res.status(200).send(true)
        })
        .catch((error) => {
          res.status(500).send({
            message: error.message
          })
        })
    })
})

// Delete a triplist by id
router.delete('/triplists/:id', async function (req, res) {
  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`triplists/${decodedToken.uid}/${req.params.id}`)
        .remove()
        .then(() => {
          res.status(200).send(true)
        })
        .catch((error) => {
          res.status(500).send({
            message: error.message
          })
        })
    })
})

// // Retrive all triplist find by title
// router.get('/triplists', async function (req, res) {

// })

module.exports = router