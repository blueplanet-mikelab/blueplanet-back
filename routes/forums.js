const express = require('express')
const fs = require('fs');
const router = express.Router()
require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, {
  authSource: 'admin'
})
const threads_col = db.get(process.env.MONGODB_COLLECTION)

function selectSorting(sortby) {
  if (sortby == "upvoted") return { "vote": -1 }
  else if (sortby == "popular") return { "viewvotecom_per_day": -1 }
  else if (sortby == "newest") return { "created_at": -1 }
  else if (sortby == "oldest") return { "created_at": 1 }
  else return null
}

const pipeline = function (conds) {
  return [{
    $addFields: {
      "t_filter": conds.typeFilter,
      "c_filter": {
        $filter: {
          input: "$countries",
          as: "country",
          cond: {
            $or: conds.countryFilter
          }
        }
      },
      "d_filter": conds.durationFilter,
      "m_filter": {
        $filter: {
          input: "$month",
          as: "mon",
          cond: {
            $or: conds.monthFilter
          }
        }
      },
      "th_filter": conds.themeFilter,
      "b_filter": {
        $or: [{
          $and: [{
            $gte: ["$budget", conds.budgetMin]
          }, {
            $lte: ["$budget", conds.budgetMax]
          }]
        },
        {
          $eq: ["$budget", -1]
        }]
      },
    }
  },
  {
    $match: {
      "t_filter": {
        "$ne": []
      },
      "c_filter": {
        "$ne": []
      },
      "d_filter": {
        "$eq": true
      },
      "m_filter": {
        "$nin": [
          [], null
        ]
      },
      "th_filter": {
        "$nin": [
          [], false
        ]
      },
      "b_filter": {
        "$eq": true
      }
    }
  }, {
    $sort: selectSorting(conds.sortby)
  },
  {
    $project: {
      "topic_id": 1,
      "title": 1,
      "thumbnail": 1,
      "countries": 1,
      "duration": 1,
      "duration_type": 1,
      "floorBudget": {
        $floor: "$budget"
      },
      "theme": 1,
      "view": 1,
      "vote": 1,
      "popularity": {
        $floor: "$viewvotecom_per_day"
      },
      "created_at": 1
    }
  },
  {
    $skip: 10 * conds.resultPage
  },
  {
    $limit: 50
  }]
}

function getCondition(queryString) {
  conds = {}

  // Type
  var type = queryString.type;
  var t_filter = {}
  if (type == "suggest") {
    t_filter = {
      "$eq": ["$duration_type", null]
    }
  } else { // null query or review
    t_filter = {
      "$ne": ["$duration_type", null]
    }
  }
  conds.typeFilter = t_filter

  // Country
  var countries = queryString.countries; // array of string ["Thailand","Singapore"]
  var c_filter = []
  if (countries) {
    countries.split(',').forEach(country => {
      c_filter.push({
        "$eq": ["$$country.nameEnglish", country]
      })
    })
  } else {
    c_filter.push(true) // not country == get all
  }
  conds.countryFilter = c_filter

  // Duration
  var duration = queryString.duration_type // int { 1, 2, 3, 4, 5 }
  var d_filter = {}
  if (duration) {
    switch (parseInt(duration)) {
      case 1:
        d_filter = {
          "$and": [{
            "$gte": ["$duration.days", 1]
          }, {
            "$lte": ["$duration.days", 3]
          }]
        }
        break;
      case 2:
        d_filter = {
          "$and": [{
            "$gte": ["$duration.days", 4]
          }, {
            "$lte": ["$duration.days", 6]
          }]
        }
        break;
      case 3:
        d_filter = {
          "$and": [{
            "$gte": ["$duration.days", 7]
          }, {
            "$lte": ["$duration.days", 9]
          }]
        }
        break;
      case 4:
        d_filter = {
          "$and": [{
            "$gte": ["$duration.days", 10]
          }, {
            "$lte": ["$duration.days", 12]
          }]
        }
        break;
      case 5:
        d_filter = {
          "$gt": ["$duration.days", 12]
        }
        break;
    }
  } else {
    if (type == "suggest") {
      d_filter = {
        "$eq": ["$duration.days", null]
      }
    } else {
      d_filter = {
        "$eq": ["$duration.days", 1]
      }
    }
  }
  conds.durationFilter = d_filter

  // Month
  var month = queryString.months; // array of string ["January", "September"]
  var m_filter = []
  if (month) {
    month.split(',').forEach(mon => {
      m_filter.push({
        "$eq": ["$$mon", mon]
      })
    })
  } else {
    m_filter.push(true) //if month == null retrurn all
  }
  conds.monthFilter = m_filter

  // Theme
  var theme = queryString.themes; //array of string ["Mountain","Sea"]
  if (theme) {
    cond = []
    theme.split(',').forEach(theme => {
      cond.push({
        $eq: ["$$theme.theme", theme]
      })
    })
    th_filter = {
      $filter: {
        input: "$theme",
        as: "theme",
        cond: {
          $or: cond
        }
      }
    }
  } else if (theme == "etc") {
    th_filter = {
      $eq: ["$theme", []]
    } // if theme == etc select theme:[]
  } else {
    th_filter = true // if theme == null not filter theme, 
  }
  conds.themeFilter = th_filter

  conds.budgetMin = queryString.budget_min ? parseInt(queryString.budget_min) : 0;
  conds.budgetMax = queryString.budget_max ? parseInt(queryString.budget_max) : 50000;
  conds.resultPage = queryString.result_page ? parseInt(queryString.result_page) : 1;
  conds.sortby = queryString.sortby ? queryString.sortby : 'popular';
  console.log(conds.budgetMin, conds.budgetMax, conds.resultPage, conds.sortby)

  return conds
}

router.get('/filterQuery', function (req, res) {
  conds = getCondition(req.query)
  threads_col.aggregate(pipeline(conds)).then((doc) => {
    res.send(doc);
  })
});

module.exports = router