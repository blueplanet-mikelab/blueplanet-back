const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const admin = require('../firebase-admin')
const db = admin.database()
const ref = db.ref('triplists')

const sortDesc = (jsonObj) => {
  var resultArr = [], resultObj = {}

  for (var i in jsonObj) {
    resultArr.push([i, jsonObj[i]])
  }
  resultArr.reverse().forEach((result) => {
    resultObj[result[0]] = result[1]
  })

  return resultObj
}

// Retrieve all triplist(s)
router.get('/', async (req, res) => {
  const sortOption = req.query.sort === 'mostThreads' ? 'numThreads' : 'updatedAt'
  var result = {}

  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(decodedToken)
        // .child('sample-uid')
        .orderByChild(sortOption)
        // .orderByChild('updatedAt')
        .on('value', (snapshot) => {
          snapshot.forEach((thread) => {
            result[thread.key] = thread.val()
          })
          res.send(sortDesc(result))
        })
    })
})

// Create a new triplist
router.post('/add', async (req, res) => {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }
  req.body.createdAt = new Date().getTime()
  req.body.updatedAt = new Date().getTime()
  req.body.numThreads = req.body.threads.length

  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(decodedToken.uid)
        // .child('sample-uid')
        .push(_.pick(req.body, ['title', 'des', 'thumbnail', 'threads', 'createdAt', 'updatedAt', 'numThreads']))
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
router.get('/:id', async (req, res) => {
  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`${decodedToken.uid}/${req.params.id}`)
        // .child(`sample-uid/${req.params.id}`)
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
router.put('/:id', async (req, res) => {
  req.body.updatedAt = new Date().getTime()
  req.body.numThreads = req.body.threads.length

  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`${decodedToken.uid}/${req.params.id}`)
        .update(_.pick(req.body, ['title', 'des', 'thumbnail', 'threads', 'updatedAt', 'numThreads']))
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
router.delete('/:id', async (req, res) => {
  await admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then((decodedToken) => {
      ref
        .child(`${decodedToken.uid}/${req.params.id}`)
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