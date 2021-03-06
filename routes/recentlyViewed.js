require('dotenv').config()
const express = require('express')
const router = express.Router()
const _ = require('lodash')
const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const col = require('../config/collection.json')
const threads_col = db.get(col.collection_threads)
const recently_viewed_col = db.get(process.env.MONGODB_RECENTLY_VIEWED_COLLECTION)

const admin = require('../firebase-admin')

const checkTokenRevoke = async (res, idToken) => {
  if (!idToken) {
    res.status(401).send({
      message: 'Unauthorized: Access to this resource is denied.'
    })
    return
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
        return
      } else {
        // Token is invalid.
        res.status(401).send({
          message: error.message
        })
        return
      }
    });
}

const threadPipeline = async (id) => {
  return await threads_col
    .aggregate([{
      $project: {
        'topic_id': 1,
        'title': 1,
        'thumbnail': 1,
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
    .catch((error) => {
      console.log(error)
    })
}

const isAdded = async (uid, id) => {
  return await recently_viewed_col
    .findOne({
      uid: uid,
      threads: {
        $elemMatch: {
          _id: id
        }
      }
    })
    .then((doc) => {
      return doc ? true : false
    })
}

const updateRecentThread = async (res, filter, operator) => {
  await recently_viewed_col
    .findOneAndUpdate(filter, operator, { upsert: true })
    .then(() => {
      res.status(200).send(true)
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
}

router.get('/', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  await recently_viewed_col
    .find({ uid: uid })
    .then((recently_viewed) => {
      if (recently_viewed.length == 0) {
        const empty = [];
        recently_viewed_col.insert({
          uid: uid,
          threads: empty
        })
          .then((recently_viewed) => {
            res.send(_.pick(recently_viewed, '_id', 'threads'))
          })
      } else {
        recently_viewed_col
          .aggregate([
            {
              $match: {
                uid: uid
              }
            },
            {
              $unwind: {
                'path': '$threads',
                'preserveNullAndEmptyArrays': true
              }
            },
            {
              $sort: {
                'threads.added': -1
              }
            },
            {
              $group: {
                '_id': '$_id',
                'uid': { '$first': '$uid' },
                'threads': { '$push': '$threads' }
              }
            },
            {
              $project: {
                'threads': 1,
              }
            },
            {
              $limit: 20
            }
          ])
          .then((threads) => {
            res.send(threads[0].threads)
          })
          .catch((error) => {
            res.status(500).send({
              message: error.message
            })
          })
      }
    })
})

router.put('/:id', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  if (await isAdded(uid, req.params.id) === true) {
    await updateRecentThread(res,
      {
        uid: uid,
        threads: {
          $elemMatch: {
            _id: req.params.id
          }
        }
      },
      {
        $set: {
          'threads.$.added': new Date()
        }
      })
  } else {
    var recentThread = {}
    await threadPipeline(req.params.id).then((result) => {
      recentThread = result
    })

    await updateRecentThread(res,
      {
        uid: uid
      },
      {
        $addToSet: {
          threads: {
            $each: recentThread
          }
        }
      })
  }
})

module.exports = router