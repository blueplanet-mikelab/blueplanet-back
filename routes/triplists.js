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

// const multer = require('multer')
// const uuidv4 = require('uuid/v4');

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

const selectSorting = (sortBy) => {
  switch (sortBy) {
    case 'most':
      return { 'num_threads': -1 }
    case 'newest': // modified in figma
      return { 'created_at': -1 }
    case 'latest':
      return { 'threads.added': -1 }
    case 'vote':
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
        'short_desc': 1,
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

// const DIR = './public/'
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, DIR)
//   },
//   filename: (req, file, cb) => {
//     const fileName = file.originalname.toLowerCase().split(' ').join('-');
//     cb(null, uuidv4() + '-' + fileName)
//   }
// })

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(new Error('Only .png, .jpg and .jpeg format allowed.'));
//     }
//   }
// })


const createTriplist = async (req, res, uid, thread) => {
  // const url = req.protocol + '://' + req.get('host')
  // const thumbnail = url + '/public/' + req.file.filename

  await triplists_col
    .insert({
      uid: uid,
      title: req.body.title,
      description: req.body.description,
      thumbnail: req.body.thumbnail,
      threads: thread,
      num_threads: thread.length,
      created_at: new Date()
    })
    .then((triplist) => {
      res.send(_.pick(triplist, '_id', 'title', 'description', 'thumbnail', 'threads', 'num_threads', 'created_at'))
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
}

const updateTriplist = async (res, filter, operator) => {
  await triplists_col
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

const isAdded = async (triplist_id, uid, thread_id) => {
  return await triplists_col
    .findOne({
      _id: triplist_id,
      uid: uid,
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
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  await triplists_col
    .aggregate([
      {
        $match: {
          uid: uid
        }
      },
      {
        $sort: selectSorting(req.query.sortby)
      },
      {
        $project: {
          'title': 1,
          'description': 1,
          'thumbnail': 1,
          'threads': 1,
          'num_threads': {
            $size: '$threads'
          },
          'created_at': 1
        }
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
})

// Create a new triplist without an initialized thread
router.post('/add', async (req, res) => {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }

  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  await createTriplist(req, res, uid, [])
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

  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return
  await createTriplist(req, res, uid, thread)
})

// Get a triplist by id
router.get('/:id/:page', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  const page = req.params.page || 1
  const resultPerPage = 10;

  await triplists_col
    .aggregate([
      {
        $match: {
          _id: db.id(req.params.id),
          uid: uid,
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
          'uid': { '$first': '$uid' },
          'title': { '$first': '$title' },
          'description': { '$first': '$description' },
          'thumbnail': { '$first': '$thumbnail' },
          'threads': { '$push': '$threads' },
          'num_threads': { '$sum': '$num_threads' },
          'created_at': { '$first': '$created_at' }
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          thumbnail: 1,
          threads: {
            $slice: ['$threads', (resultPerPage * page) - resultPerPage, resultPerPage]
          },
          num_threads: 1,
          created_at: 1
        }
      }
    ])
    .then((triplist) => {
      res.send({
        triplist: triplist[0],
        total_page: Math.ceil(triplist[0].num_threads / resultPerPage),
        current_page: Number(page)
      })
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message
      })
    })
})

// Update a detail of triplist by id
router.put('/:id', async (req, res) => {
  if (!req.body.title) {
    res.status(500).send({
      message: 'Title cannot be empty'
    })
  }

  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  const url = req.protocol + '://' + req.get('host')
  const thumbnail = url + '/public/' + req.file.filename

  var updated = {
    title: req.body.title,
    description: req.body.description,
    thumbnail: thumbnail
  }

  await updateTriplist(res,
    {
      _id: db.id(req.params.id),
      uid: uid
    },
    {
      $set: updated
    })
})

// Add a thread to a triplist
router.put('/:id/add/:threadId', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  if (await isAdded(req.params.id, uid, req.params.threadId) === true) {
    res.status(200).send({
      message: 'Already added in triplists'
    })
  } else {
    var newThread = {}
    await threadPipeline(req.params.threadId).then((result) => {
      newThread = result
    })

    await updateTriplist(res,
      {
        _id: db.id(req.params.id),
        uid: uid
      },
      {
        $addToSet: {
          threads: {
            $each: newThread
          }
        }
      })
  }
})

// Remove a thread from a triplist
router.delete('/:id/remove/:threadId', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  await updateTriplist(res,
    {
      '_id': db.id(req.params.id),
      'uid': uid,
      'threads._id': db.id(req.params.threadId)
    },
    {
      $pull: {
        'threads': {
          '_id': req.params.threadId
        }
      }
    })
})

// Remove a triplist
router.delete('/:id', async (req, res) => {
  var uid = await checkTokenRevoke(res, req.headers.authorization)
  if (!uid) return

  await triplists_col
    .findOneAndDelete({
      '_id': db.id(req.params.id),
      'uid': uid,
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
})

module.exports = router