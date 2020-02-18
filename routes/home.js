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

const durationPipeline = function (conds) {
  return [{
    $addFields: {
      "th_selected": {
        $filter: {
          input: "$countries",
          as: "country",
          cond: {
            "$eq": ["$$country.country", "TH"]
          }
        }
      },
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
      "th_selected": {
        $filter: {
          input: "$countries",
          as: "country",
          cond: {
            "$eq": ["$$country.country", "TH"]
          }
        }
      },
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
  if (parseInt(within_th) == 1) {
    within_th_selected = {
      "$ne": []
    }
  } else {
    within_th_selected = {
      "$eq": []
    }
  }
  return within_th_selected
}

function getDurationConds(queryString) {
  var conds = {}
  conds.within_th = getWithinThConds(queryString.within_th)

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

  // parts = duration.replace(/\s+/g, "").match(/(than|\d+)-*(\d+)Days/)
  // if (parts[1] == "than") {
  //     duration_selected = {
  //         "$gt": ["$duration.days", 12]
  //     }
  // } else {
  //     duration_selected = {
  //         "$and": [{
  //             "$gte": ["$duration.days", parseInt(parts[1])]
  //         }, {
  //             "$lte": ["$duration.days", parseInt(parts[2])]
  //         }]
  //     }
  // }
  conds.duration = duration_selected
  return conds
}

function getMonthQueryConds(queryString) {
  var conds = {}
  conds.within_th = getWithinThConds(queryString.within_th)

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

router.get('/mapCountries', function (req, res) {
  countries_col.find().then((doc) => {
    res.send(doc)
  })
})

router.get('/durationQuery', function (req, res) {
  durationConds = getDurationConds(req.query)
  treads_col.aggregate(durationPipeline(durationConds)).then((doc) => {
    res.send(doc)
  })
})

router.get('/monthQuery', function (req, res) {
  monthConds = getMonthQueryConds(req.query)
  treads_col.aggregate(monthPipeline(monthConds)).then((doc) => {
    res.send(doc)
  })
})

module.exports = router