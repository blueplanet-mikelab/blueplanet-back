const express = require('express')
const fs = require('fs');
const router = express.Router()
require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const treads_col = db.get(process.env.MONGODB_COLLECTION)
const countries_col = db.get(process.env.MONGODB_MAP_COLLECTION)

const thread_res = {
  "topic_id": 1,
  "title": 1,
  "thumbnail": 1,
  "duration": 1,
  "month": 1,
  "countries": 1,
  "duration_type": 1
}

const th_selected_conds = {
  $filter: {
    input: "$countries",
    as: "country",
    cond: {
      "$eq": ["$$country.country", "TH"]
    }
  }
}

const suggestionPipeline = function (conds) {
  return [{
    $addFields: {
      "th_selected": th_selected_conds,
      "suggest_thread": {
        "$eq": ["$duration_type", null]
      }
    }
  },
  {
    "$match": {
      "$and": [{
        "th_selected": conds.within_th
      },
      {
        "suggest_thread": {
          "$eq": true
        }
      }
      ]
    }
  },
  {
    $project: thread_res
  },
  {
    $limit: 12
  }]
}

const durationPipeline = function (conds) {
  return [{
    $addFields: {
      "th_selected": th_selected_conds,
      "d_selected": {
        $or: conds.duration
      }
    }
  },
  {
    "$match": {
      "$and": [{
        "th_selected": conds.within_th
      },
      {
        "d_selected": {
          "$eq": true
        }
      }
      ]
    }
  },
  {
    $project: thread_res
  },
  {
    $limit: 12
  }
  ]
}

const monthPipeline = function (conds) {
  return [{
    $addFields: {
      "th_selected": th_selected_conds,
      "m_selected": {
        $filter: {
          input: "$month",
          as: "mon",
          cond: {
            $or: conds.month
          }
        }
      }
    }
  },
  {
    "$match": {
      "$and": [{
        "th_selected": conds.within_th
      },
      {
        "m_selected": {
          "$nin": [
            [], null
          ]
        }
      }
      ]
    }
  },
  {
    $project: thread_res
  },
  {
    $limit: 12
  }
  ]
}

function getWithinThConds(within_th) {
  var conds = {}
  if (parseInt(within_th) == 1) {
    within_th_selected = {
      "$ne": []
    }
  } else {
    within_th_selected = {
      "$eq": []
    }
  }
  conds.within_th = within_th_selected
  return conds
}

function getDurationConds(queryString) {
  var conds = getWithinThConds(queryString.within_th)

  var duration = queryString.duration_type
  switch (parseInt(duration)) {
    case 1:
      duration_selected = {
        "$and": [{
          "$gte": ["$duration.days", 1]
        }, {
          "$lte": ["$duration.days", 3]
        }]
      }
      break;
    case 2:
      duration_selected = {
        "$and": [{
          "$gte": ["$duration.days", 4]
        }, {
          "$lte": ["$duration.days", 6]
        }]
      }
      break;
    case 3:
      duration_selected = {
        "$and": [{
          "$gte": ["$duration.days", 7]
        }, {
          "$lte": ["$duration.days", 9]
        }]
      }
      break;
    case 4:
      duration_selected = {
        "$and": [{
          "$gte": ["$duration.days", 10]
        }, {
          "$lte": ["$duration.days", 12]
        }]
      }
      break;
    case 5:
      duration_selected = {
        "$gt": ["$duration.days", 12]
      }
      break;
    default:
      duration_selected = {
        "$and": [{
          "$gte": ["$duration.days", 1]
        }, {
          "$lte": ["$duration.days", 3]
        }]
      }
      break;
  }
  conds.duration = duration_selected
  return conds
}

function getMonthQueryConds(queryString) {
  var conds = getWithinThConds(queryString.within_th)

  var month = queryString.month
  if (month) {
    month_selected = {
      "$eq": ["$$mon", month]
    }
  } else {
    month_selected = true
  }
  conds.month = month_selected
  return conds
}

router.get('/mapCountries', async function (req, res) {
  await countries_col.find({}, { sort:{count:-1} } ).then((doc) => {
    res.send(doc)
  })
})

router.get('/suggestThreads', async function (req, res) {
  var conds = getWithinThConds(req.query.within_th)
  await treads_col.aggregate(suggestionPipeline(conds)).then((doc) => {
    res.send(doc)
  })
})

router.get('/durationQuery', async function (req, res) {
  durationConds = getDurationConds(req.query)
  await treads_col.aggregate(durationPipeline(durationConds)).then((doc) => {
    res.send(doc)
  })
})

router.get('/monthQuery', async function (req, res) {
  monthConds = getMonthQueryConds(req.query)
  await treads_col.aggregate(monthPipeline(monthConds)).then((doc) => {
    res.send(doc)
  })
})

module.exports = router