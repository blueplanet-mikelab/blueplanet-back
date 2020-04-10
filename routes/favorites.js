const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_THREADS_COLLECTION)
const favorites_col = db.get(process.env.MONGODB_FAVORITES_COLLECTION)

const admin = require('../firebase-admin')

const selectSorting = (sortBy) => {
  switch (sortBy) {
    case 'latest':
      return { 'favThreads.added': -1 }
    case 'upvoted':
      return { 'favThreads.vote': -1 }
    case 'popular':
      return { 'favThreads.popularity': -1 }
    default:
      return { 'favThreads.added': 1 }
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

const updateFavThread = (res, user_id, operator, message) => {
  favorites_col
    .findOneAndUpdate({ user_id: user_id }, operator, { upsert: true })
    .then(() => {
      res.status(200).send({
        message: message
      })
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
}

// Get all favorite thread(s)
router.get('/', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  await favorites_col
    .aggregate([{
      $project: {
        'user_id': 1,
        'favThreads': 1
      }
    },
    {
      $match: {
        user_id: 'sample_uid' // decodedToken
      }
    },
    {
      $unwind: {
        'path': '$favThreads',
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
        'favThreads': { '$push': '$favThreads' }
      }
    }
    ])
    .then((favorites) => {
      res.send(favorites)
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
  // })
})

// Get boolean of a thread if it has been added by id
router.get('/:id', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  await favorites_col
    .findOne({
      user_id: 'sample_uid',
      favThreads: {
        $elemMatch: {
          _id: req.params.id
        }
      }
    })
    .then((doc) => {
      doc ? res.send(true) : res.send(false)
    })
    .catch((error) => {
      res.status(500).send({
        message: error
      })
      // })
    })
})

// Add thread to favorite
router.put('/:id', async (req, res) => {
  var favThread = {}
  await threadPipeline(req.params.id).then((result) => {
    favThread = result[0]
  })

  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  updateFavThread(res, 'sample_uid', { $push: { favThreads: favThread } }, 'Added to Favorite.')
  //   })
})

// Remove thread from favorite
router.delete('/:id', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  updateFavThread(res, 'sample_uid', { $pull: { 'favThreads': { '_id': req.params.id } } }, 'Removed from Favorite.')
  //   })
})

module.exports = router