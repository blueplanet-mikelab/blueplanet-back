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

const checkTokenRevoke = async (res, idToken) => {
  if (!idToken) {
    res.status(401).send({
      message: 'Unauthorized: Access to this resource is denied.'
    })
  }
  
  var checkRevoked = true;
  return await admin
    .auth()
    .verifyIdToken(idToken, checkRevoked)
    .then(payload => {
      return payload.uid
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
    });
}

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

const updateFavThread = async (res, uid, operator, message) => {
  await favorites_col
    .findOneAndUpdate({ uid: uid }, operator, { upsert: true })
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

const isAdded = async (uid, id) => {
  return await favorites_col
    .findOne({
      uid: uid,
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
  var uid = await checkTokenRevoke(res, req.headers.authorization)

  await favorites_col
    .aggregate([
      {
        $match: {
          uid: uid
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
          'uid': { '$first': '$uid' },
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
})

// Get boolean of a thread if it has been added by id
router.get('/:id', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)

  await isAdded(uid, req.params.id) === true
    ? res.status(200).send(true)
    : res.status(200).send(false)
})

// Add a thread to favorite
router.put('/:id', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)

  if (await isAdded(uid, req.params.id) === true) {
    res.status(200).send({
      message: 'Already added in favorite'
    })
  } else {
    var favThread = {}
    await threadPipeline(req.params.id).then((result) => {
      favThread = result
    })

    await updateFavThread(res, uid, {
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
  var uid = await checkTokenRevoke(res, req.headers.authorization)

  await updateFavThread(res, uid, {
    $pull: {
      favThreads: {
        _id: req.params.id
      }
    }
  }, 'Removed from Favorite.')
})

module.exports = router