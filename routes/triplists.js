const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_THREADS_COLLECTION)
const triplists_col = db.get(process.env.MONGODB_TRIPLISTS_COLLECTION)

const admin = require('../firebase-admin')

const triplistSentData = {
  'title': 1,
  'description': 1,
  'thumbnail': 1,
  'threads': 1,
  'numThreads': {
    $size: '$threads'
  },
  'created_at': 1
}

const selectSorting = (sortBy) => {
  switch (sortBy) {
    case 'most':
      return { 'numThreads': -1 }
    case 'newest': // modified in figma
      return { 'created_at': -1 }
    case 'latest':
      return { 'threads.added': -1 }
    case 'upvoted':
      return { 'threads.vote': -1 }
    case 'popular':
      return { 'threads.popularity': -1 }
    default:
      return { 'created_at': -1 }
  }
}

const threadPipeline = async (id) => {
  return await threads_col
    .aggregate([{
      $project: {
        'topic_id': 1,
        'title': 1,
        'thumbnail': 1,
        'vote': 1,
        'popularity': {
          $floor: '$viewvotecom_per_day'
        },
        'added': {
          $add: new Date()
        }
      }
    },
    {
      $match: {
        _id: db.id(id)
      }
    }])
    .then((thread) => {
      return thread
    })
}

const createTriplist = (req, res, user_id, thread) => {
  triplists_col
    .insert({
      user_id: user_id,
      title: req.body.title,
      description: req.body.description,
      thumbnail: req.body.thumbnail,
      threads: thread,
      created_at: new Date()
    })
    .then((triplist) => {
      res.send(_.pick(triplist, '_id', 'title', 'description', 'thumbnail', 'threads', 'created_at'))
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
}

const updateTriplist = (res, filter, operator) => {
  triplists_col
    .findOneAndUpdate(filter, operator, { upsert: true })
    .then(() => {
      res.send({
        message: 'Your Triplist has been updated'
      })
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
}

const isAdded = async (triplist_id, user_id, thread_id) => {
  return await triplists_col
    .findOne({
      _id: triplist_id,
      user_id: user_id,
      threads: {
        $elemMatch: {
          _id: thread_id
        }
      }
    })
    .then((doc) => {
      return doc ? true : false
    })
}

// Retrieve all triplist(s)
router.get('/', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  await triplists_col
    .aggregate([
      {
        $match: {
          user_id: 'sample_uid' // decodedToken
        }
      },
      {
        $sort: selectSorting(req.query.sortby)
      },
      {
        $project: triplistSentData
      }
    ])
    .then((triplists) => {
      res.send(triplists)
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
  // })
})

// Create a new triplist without an initialized thread
router.post('/add', async (req, res) => {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }

  // await admin
  // .auth()
  // .verifyIdToken(req.headers.authorization)
  // .then((decodedToken) => {
  // createTriplist(req, res, decodedToken, [])
  createTriplist(req, res, 'sample_uid', [])
  // })
})

// Create a new triplist with an initialized thread
router.post('/add/:id', async (req, res) => {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }

  var thread = []
  await threadPipeline(req.params.id).then((result) => {
    thread = result
  })

  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  // createTriplist(req, res, decodedToken, thread)
  createTriplist(req, res, 'sample_uid', thread)
  // })
})

// Get a triplist by id
router.get('/:id', async (req, res) => {
  // await admin
  // .auth()
  // .verifyIdToken(req.headers.authorization)
  // .then((decodedToken) => {
  await triplists_col
    .aggregate([
      {
        $match: {
          _id: db.id(req.params.id),
          user_id: 'sample_uid', //decodedToken
        }
      },
      {
        $unwind: {
          'path': '$threads',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        $sort: selectSorting(req.query.sortby)
      },
      {
        $group: {
          '_id': '$_id',
          'user_id': { '$first': '$user_id' },
          'title': { '$first': '$title' },
          'description': { '$first': '$description' },
          'thumbnail': { '$first': '$thumbnail' },
          'threads': { '$push': '$threads' },
          'created_at': { '$first': '$created_at' }
        }
      },
      {
        $project: triplistSentData
      }
    ])
    .then((thread) => {
      res.send(thread[0])
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
  // })
})

// Update a detail of triplist by id
router.put('/:id', async (req, res) => {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }

  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  updateTriplist(res,
    {
      _id: db.id(req.params.id),
      user_id: 'sample_uid'
    },
    {
      $set: req.body
    })
  // })
})

// Add a thread to a triplist
router.put('/:id/add/:threadId', async (req, res) => {
  // await admin
  // .auth()
  // .verifyIdToken(req.headers.authorization)
  // .then((decodedToken) => {
  if (await isAdded(req.params.id, 'sample_uid', req.params.threadId) === true) {
    res.status(200).send({
      message: 'Already added in triplists'
    })
  } else {
    var newThread = {}
    await threadPipeline(req.params.threadId).then((result) => {
      newThread = result
    })

    updateTriplist(res,
      {
        _id: db.id(req.params.id),
        user_id: 'sample_uid'
      },
      {
        $addToSet: {
          threads: {
            $each: newThread
          }
        }
      })
  }
  // })
})

// Remove a thread from a triplist
router.delete('/:id/remove/:threadId', async (req, res) => {
  // await admin
  // .auth()
  // .verifyIdToken(req.headers.authorization)
  // .then((decodedToken) => {
  updateTriplist(res,
    {
      '_id': db.id(req.params.id),
      'user_id': 'sample_uid', //decoedToken
      'threads._id': db.id(req.params.threadId)
    },
    {
      $pull: {
        'threads': {
          '_id': req.params.threadId
        }
      }
    })
  //})
})

// Remove a triplist
router.delete('/:id', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  triplists_col
    .findOneAndDelete({
      '_id': db.id(req.params.id),
      'user_id': 'sample_uid', //decoedToken
    })
    .then(() => {
      res.send({
        message: 'Your Triplist has been deleted'
      })
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
  //   })
})

module.exports = router