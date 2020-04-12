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
      return { 'favThreads.added': -1 }
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

const updateFavThread = async (res, user_id, operator, message) => {
  await favorites_col
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

const isAdded = async (user_id, id) => {
  return await favorites_col
    .findOne({
      user_id: user_id,
      favThreads: {
        $elemMatch: {
          _id: id
        }
      }
    })
    .then((doc) => {
      return doc ? true : false
    })
}
// Get all favorite thread(s)
router.get('/', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  await favorites_col
    .aggregate([
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
    },
    {
      $project: {
        'favThreads': 1
      }
    },
    ])
    .then((favorites) => {
      res.send(favorites[0])
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
  await isAdded('sample_uid', req.params.id) === true
    ? res.status(200).send(true)
    : res.status(200).send(false)
  // })
})

// Add a thread to favorite
router.put('/:id', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  if (await isAdded('sample_uid', req.params.id) === true) {
    res.status(200).send({
      message: 'Already added in favorite'
    })
  } else {
    var favThread = {}
    await threadPipeline(req.params.id).then((result) => {
      favThread = result
    })

    updateFavThread(res, 'sample_uid', {
      $addToSet: {
        favThreads: {
          $each: favThread
        }
      }
    }, 'Added to Favorite.')
  }
  // })
})

// Remove a thread from favorite
router.delete('/:id', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  updateFavThread(res, 'sample_uid', {
    $pull: {
      favThreads: {
        _id: req.params.id
      }
    }
  }, 'Removed from Favorite.')
  //   })
})

module.exports = router