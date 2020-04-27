const express = require('express')
const fs = require('fs');
const router = express.Router()
require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_THREADS_COLLECTION)

const selectSorting = (sortby) => {
  if (sortby == 'upvoted') return { 'vote': -1 }
  else if (sortby == 'popular') return { 'viewvotecom_per_day': -1 }
  else if (sortby == 'newest') return { 'created_at': -1 }
  else if (sortby == 'oldest') return { 'created_at': 1 }
  else return null
}

const pipeline = function (conds, page) {
  const resultPerPage = 10;

  return [{
    $addFields: {
      't_filter': conds.typeFilter,
      'c_filter': {
        $filter: {
          input: '$countries',
          as: 'country',
          cond: {
            $or: conds.countryFilter
          }
        }
      },
      'd_filter': conds.durationFilter,
      'm_filter': {
        $filter: {
          input: '$month',
          as: 'mon',
          cond: {
            $or: conds.monthFilter
          }
        }
      },
      'th_filter': {
        $filter: {
          input: '$theme',
          as: 'theme',
          cond: {
            $or: conds.themeFilter
          }
        }
      },
      'b_filter': {
        $or: [{
          $and: [{
            $gte: ['$budget', conds.budgetMin]
          }, {
            $lte: ['$budget', conds.budgetMax]
          }]
        },
        {
          $eq: ['$budget', -1]
        }]
      },
    }
  },
  {
    $match: {
      't_filter': {
        '$ne': []
      },
      'c_filter': {
        '$ne': []
      },
      'd_filter': {
        '$eq': true
      },
      'm_filter': {
        '$nin': [
          [], null
        ]
      },
      'th_filter': {
        '$nin': [
          [], false
        ]
      },
      'b_filter': {
        '$eq': true
      }
    }
  },
  {
    $project: {
      'topic_id': 1,
      'title': 1,
      'thumbnail': 1,
      'countries': 1,
      'duration': 1,
      'duration_type': 1,
      'floor_budget': {
        $floor: '$budget'
      },
      'theme': 1,
      'view': 1,
      'vote': 1,
      'popularity': {
        $floor: '$viewvotecom_per_day'
      },
      'created_at': 1
    }
  },
  {
    $sort: selectSorting(conds.sortby)
  },
  {
    $group: {
      _id: null,
      total_page: {
        $sum: 1
      },
      result: {
        $push: '$$ROOT'
      }
    }
  },
  {
    $project: {
      total_page: 1,
      result: {
        $slice: ['$result', (resultPerPage * page) - resultPerPage, resultPerPage]
      }
    }
  }]
}

function getCondition(queryString) {
  conds = {}

  // Type
  var type = queryString.type;
  var t_filter = {}
  if (type == 'suggest') {
    t_filter = {
      '$eq': ['$duration_type', null]
    }
  } else {
    t_filter = {
      '$ne': ['$duration_type', null]
    }
  }
  conds.typeFilter = t_filter

  // Country
  var countries = queryString.countries
  var c_filter = []
  if (countries) {
    countries.split(',').forEach(country => {
      c_filter.push({
        '$eq': ['$$country.nameEnglish', country]
      })
    })
  } else {
    c_filter.push(true)
  }
  conds.countryFilter = c_filter

  // Duration
  var duration = queryString.duration_type
  var d_filter = {}
  if (duration) {
    switch (parseInt(duration)) {
      case 1:
        d_filter = {
          '$and': [{
            '$gte': ['$duration.days', 1]
          }, {
            '$lte': ['$duration.days', 3]
          }]
        }
        break;
      case 2:
        d_filter = {
          '$and': [{
            '$gte': ['$duration.days', 4]
          }, {
            '$lte': ['$duration.days', 6]
          }]
        }
        break;
      case 3:
        d_filter = {
          '$and': [{
            '$gte': ['$duration.days', 7]
          }, {
            '$lte': ['$duration.days', 9]
          }]
        }
        break;
      case 4:
        d_filter = {
          '$and': [{
            '$gte': ['$duration.days', 10]
          }, {
            '$lte': ['$duration.days', 12]
          }]
        }
        break;
      case 5:
        d_filter = {
          '$gt': ['$duration.days', 12]
        }
        break;
    }
  } else {
    if (type == 'suggest') {
      d_filter = {
        '$eq': ['$duration.days', null]
      }
    } else {
      d_filter = {
        '$eq': ['$duration.days', 1]
      }
    }
  }
  conds.durationFilter = d_filter

  // Month
  var month = queryString.months;
  var m_filter = []
  if (month) {
    month.split(',').forEach(mon => {
      m_filter.push({
        '$eq': ['$$mon', mon]
      })
    })
  } else {
    m_filter.push(true)
  }
  conds.monthFilter = m_filter

  // Theme
  var theme = queryString.themes;
  var th_filter = []
  if (theme) {
    theme.split(',').forEach(theme => {
      th_filter.push({
        '$and': [{
          '$eq': ['$$theme.theme', theme]
        }, {
          '$gt': ['$$theme.count', 10]
        }]
      })
    })
  } else {
    th_filter.push({
      '$gt': ['$$theme.count', 10]
    })
  }
  conds.themeFilter = th_filter

  conds.budgetMin = queryString.budget_min ? parseInt(queryString.budget_min) : 0;
  conds.budgetMax = queryString.budget_max ? parseInt(queryString.budget_max) : 50000;
  conds.sortby = queryString.sortby ? queryString.sortby : 'popular';
  return conds
}

router.get('/:page/filter', async (req, res) => {
  const page = req.params.page || 1
  conds = getCondition(req.query)
  threads_col.aggregate(pipeline(conds, page)).then((doc) => {
    res.send({
      threads: doc[0].result,
      total_page: Math.ceil(doc[0].total_page / 10),
      current_page: Number(page)
    })
  })
})

module.exports = router