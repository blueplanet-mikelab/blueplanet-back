const express = require('express')
const fs = require('fs')
const router = express.Router()
const _ = require('lodash')
require('dotenv').config()

const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_THREADS_COLLECTION)
const recently_viewed_col = db.get(process.env.MONGODB_RECENTLY_VIEWED_COLLECTION)

const admin = require('../firebase-admin')

const threadPipeline = async (id) => {
  return await threads_col
    .aggregate([{
      $project: {
        'topic_id': 1,
        'title': 1,
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

const isAdded = async (user_id, id) => {
  return await recently_viewed_col
    .findOne({
      user_id: user_id,
      recentThreads: {
        $elemMatch: {
          _id: id
        }
      }
    })
    .then((doc) => {
      return doc ? true : false
    })
}

router.get('/', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  recently_viewed_col
    .aggregate([{
      $project: {
        'user_id': 1,
        'recentThreads': 1,
      }
    },
    {
      $match: {
        user_id: 'sample_uid' // decodedToken
      }
    },
    {
      $unwind: {
        'path': '$recentThreads',
        'preserveNullAndEmptyArrays': true
      }
    },
    {
      $sort: {
        'recentThreads.added': -1
      }
    },
    {
      $group: {
        '_id': '$_id',
        'user_id': { '$first': '$user_id' },
        'recentThreads': { '$push': '$recentThreads' }
      }
    },
    {
      $limit: 20
    }
    ])
    .then((recentThreads) => {
      res.send(recentThreads)
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
  // })
})

router.put('/:id', async (req, res) => {
  // await admin
  //   .auth()
  //   .verifyIdToken(req.headers.authorization)
  //   .then((decodedToken) => {
  if (await isAdded('sample_uid', req.params.id) === true) {
    res.status(200).send(false)
  } else {
    var recentThread = {}
    await threadPipeline(req.params.id).then((result) => {
      recentThread = result
    })

    recently_viewed_col
      .findOneAndUpdate(
        { user_id: 'sample_uid' },
        {
          $addToSet: {
            recentThreads: {
              $each: recentThread
            }
          }
        },
        { upsert: true })
      .then(() => {
        res.status(200).send(true)
      })
      .catch((error) => {
        res.status(500).send({
          message: error.message
        })
      })
    // })
  }
})

module.exports = router