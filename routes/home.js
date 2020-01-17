const express = require('express')
const fs = require('fs');
const router = express.Router()
require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, {
    authSource: 'admin'
})
const treads_col = db.get(process.env.MONGODB_COLLECTION)

const pipeline = function(conds) {
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
            $project: {
                "topic_id": 1,
                "title": 1,
                "thumbnail": 1,
                "duration": 1
            }
        },
        {
            $limit: 12
        }
    ]
}

function getDurationConds(queryString) {
    var conds = {}

    // Within_th
    var within_th = queryString.within_th
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

    // Duration
    var duration = queryString.duration
    parts = duration.replace(/\s+/g, "").match(/(than|\d+)-*(\d+)Days/)
    if (parts[1] == "than") {
        duration_selected = {
            "$gt": ["$duration.days", 12]
        }
    } else {
        duration_selected = {
            "$and": [{
                "$gte": ["$duration.days", parseInt(parts[1])]
            }, {
                "$lte": ["$duration.days", parseInt(parts[2])]
            }]
        }
    }
    conds.duration = duration_selected
    return conds
}

function getMonthQueryConds(queryString) {
    var month = queryString.months;
}

router.get('/durationQuery', function(req, res) {
    durationConds = getDurationConds(req.query)
    treads_col.aggregate(pipeline(durationConds)).then((doc) => {
        res.send(doc);
    })
})

router.get('/monthQuery', function(req, res) {
    monthConds = getMonthQueryConds(req.query)
})

module.exports = router