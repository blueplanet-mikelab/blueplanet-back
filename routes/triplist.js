const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_COLLECTION)
const triplists_col = db.get(process.env.MONGODB_TRIPLIST_COLLECTION)

const admin = require('../firebase-admin')

const triplistSentData = {
  'user_id': 1,
  'title': 1,
  'description': 1,
  'thumbnail': 1,
  'threads': 1,
  'numThreads': {
    $size: '$threads'
  },
  'created_at': 1
}

const threadSentData = {
  'topic_id': 1,
  'title': 1,
  'thumbnail': 1,
  'countries': 1,
  'duration': 1,
  'duration_type': 1,
  'floorBudget': {
    $floor: '$budget'
  },
  'theme': 1,
  'view': 1,
  'vote': 1,
  'popularity': {
    $floor: '$viewvotecom_per_day'
  },
  'created_at': 1,
  'added': {
    $add: new Date()
  }
}

const selectSorting = (sortBy) => {
  switch (sortBy) {
    case 'mostThreads':
      return { 'numThreads': -1 }
    case 'newest': // modified in figma
      return { 'created_at': -1 }
    case 'recentlyAdded':
      return { 'threads.added': -1 }
    case 'upvoted':
      return { 'threads.vote': -1 }
    case 'popular':
      return { 'threads.popularity': -1 }
    default:
      return { 'created_at': 1 }
  }
}

const threadPipeline = async (id) => {
  if (!id) {
    return null
  } else {
    return await threads_col
      .aggregate([{
        $project: threadSentData
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
      res.send(triplist)
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
}

const updateTriplist = (res, triplist_id, user_id, operator) => {
  triplists_col
    .findOneAndUpdate({
      '_id': db.id(triplist_id),
      'user_id': user_id
    }, operator, { upset: true })
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

// Retrieve all triplist(s)
router.get('/', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  await triplists_col
    .aggregate([
      {
        $project: triplistSentData
      },
      {
        $match: {
          user_id: 'sample_uid' // decodedToken
        }
      },
      {
        $sort: selectSorting(req.query.sort)
      }])
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

// Create a new triplist without a thread
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

// Create a new triplist with a thread
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
        $sort: selectSorting(req.query.sort)
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
      res.send(thread)
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
  // updateTriplist(res, req.params.id, decodedToken, { $set: req.body })
  updateTriplist(res, req.params.id, 'sample_uid', { $set: req.body })
  // })
})

// Add a thread to a triplist
router.put('/:id/add/:threadId', async (req, res) => {
  var newThread
  await threadPipeline(req.params.threadId).then((result) => {
    newThread = result[0]
  })

  // await admin
  // .auth()
  // .verifyIdToken(req.headers.authorization)
  // .then((decodedToken) => {
  // updateTriplist(res, req.params.id, decodedToken, { $push: { threads: newThread } })
  updateTriplist(res, req.params.id, 'sample_uid', { $push: { threads: newThread } })
  // })
})

// Remove a thread from a triplist
router.delete('/:id/remove/:threadId', async (req, res) => {
  // await admin
  // .auth()
  // .verifyIdToken(req.headers.authorization)
  // .then((decodedToken) => {
  triplists_col
    .findOneAndUpdate({
      '_id': db.id(req.params.id),
      'user_id': 'sample_uid', //decoedToken
      'threads._id': db.id(req.params.threadId)
    }, { $pull: { 'threads': { '_id': req.params.threadId } } }, { upset: true })
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
  // })

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