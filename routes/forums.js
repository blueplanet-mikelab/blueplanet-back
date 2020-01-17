const express = require('express')
const fs = require('fs');
const router = express.Router()
require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, {
    authSource: 'admin'
})
const treads_col = db.get(process.env.MONGODB_COLLECTION)

function selectSorting(sortby) {
    if (sortby == "upvoted") return {
        "totalVote": -1
    }
    else if (sortby == "shared") return {
        "created_at": -1
    } //TODO
    else if (sortby == "popular") return {
        "popularity": -1
    }
    else if (sortby == "newest") return {
        "created_at": -1
    }
    else if (sortby == "oldest") return {
        "created_at": 1
    }
    else return null
}

//countries: array of string ["Thailand","Singapore"]
//duration: array of string ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
//month: array of string ["January", "September"]
//themes: array of string ["Mountain","Sea"]
const pipeline = function(conds) {
    return [{
            $addFields: {
                "c_filter": {
                    $filter: {
                        input: "$countries",
                        as: "country",
                        cond: {
                            $or: conds.countryFilter
                        }
                    }
                },
                "d_filter": {
                    $or: conds.durationFilter
                },
                "m_filter": {
                    $filter: {
                        input: "$month",
                        as: "mon",
                        cond: {
                            $or: conds.monthFilter
                        }
                    }
                },
                "t_filter": conds.themeFilter,
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
                        }
                    ]
                },
            }
        },
        {
            $match: {
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
                "t_filter": {
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
                "c_filter": 0,
                "d_filter": 0,
                "m_filter": 0,
                "t_filter": 0,
                "b_filter": 0
            }
        },
        {
            $skip: 10 * conds.resultPage
        },
        {
            $limit: 10
        }
        // ,{ $count: "count" }
    ]
}

function getCondition(queryString) {
    conds = {}
    // COUNTRY
    var countries = queryString.countries; //array of string ["Thailand","Singapore"]
    var c_filter = []
    if (countries) {
        countries.split(',').forEach(country => {
            console.log("country:", country)
            c_filter.push({
                "$eq": ["$$country.country", country]
            })
        })
    } else {
        c_filter.push(true) // not country == get all
    }
    conds.countryFilter = c_filter

    // DURATION
    var duration = queryString.durations; //array of string ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
    var d_filter = []
    console.log("duration:", duration)
    if (duration != null) {
        duration.split(',').forEach(label => {
            parts = label.replace(/\s+/g, "").match(/(than|\d+)-*(\d+)Days/)
            if (parts[1] == "than") {
                d_filter.push({
                    "$and": [{
                        "$gt": ["$duration.days", 12]
                    }]
                })
            } else {
                d_filter.push({
                    "$and": [{
                        "$gte": ["$duration.days", parseInt(parts[1])]
                    }, {
                        "$lte": ["$duration.days", parseInt(parts[2])]
                    }]
                })
            }
        });
    } else { //suggest
        d_filter.push({
            "$eq": ["$duration.days", 0]
        })
    }
    conds.durationFilter = d_filter

    // MONTH
    var month = queryString.months; //array of string ["January", "September"]
    console.log("month:", month)
    var m_filter = []
    if (month) {
        month.split(',').forEach(mon => {
            m_filter.push({
                "$eq": ["$$mon", mon]
            })
        })
    } else {
        m_filter.push(true) //if month==null retrurn all
    }
    conds.monthFilter = m_filter

    // THEME
    var theme = queryString.themes; //array of string ["Mountain","Sea"]
    console.log("theme:", theme)
    if (theme) {
        cond = []
        theme.split(',').forEach(theme => {
            cond.push({
                $eq: ["$$theme.theme", theme]
            })
        })
        t_filter = {
            $filter: {
                input: "$theme",
                as: "theme",
                cond: {
                    $or: cond
                }
            }
        }
    } else if (theme == "etc") {
        t_filter = {
            $eq: ["$theme", []]
        } // if theme==etc select theme:[]
    } else {
        t_filter = true // if theme==null not filter theme, 
    }
    conds.themeFilter = t_filter

    conds.budgetMin = queryString.budget_min ? parseInt(queryString.budget_min) : 0;
    conds.budgetMax = queryString.budget_max ? parseInt(queryString.budget_max) : 50000;
    conds.resultPage = queryString.result_page ? parseInt(queryString.result_page) : 1;
    conds.sortby = queryString.sortby ? queryString.sortby : 'popular';
    console.log(conds.budgetMin, conds.budgetMax, conds.resultPage, conds.sortby)

    return conds
}

router.get('/filterQuery', function(req, res) {
    console.log('Query:', req.query)
    conds = getCondition(req.query)
    treads_col.aggregate(pipeline(conds)).then((doc) => {
        // console.log(doc)
        res.send(doc);
    })
});

module.exports = router