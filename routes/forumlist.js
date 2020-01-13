const express = require('express')
const fs = require('fs');
const router = express.Router()

require('dotenv').config()
const db = require('monk')(process.env.MONGODB_URI, { authSource: 'admin' })
const treads_col = db.get(process.env.MONGODB_COLLECTION)



function selectSorting(sortby){
    if(sortby=="upvoted") return {"totalVote":-1}
    else if(sortby=="shared") return {"created_at":-1}  //TODO
    else if(sortby=="popular") return {"popularity":-1} 
    else if(sortby=="newest") return {"created_at":-1}
    else if(sortby=="oldest") return {"created_at":1}
    else return null
}

//countries: array of string ["Thailand","Singapore"]
//duration: array of string ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
//month: array of string ["January", "September"]
//themes: array of string ["Mountain","Sea"]
const pipeline = function(conds) {
    return [
        {
            $project: {
                "topic_id" : 1,
                "title" : 1,
                "thumbnail" : 1,
                "countries" : 1,
                "duration" : 1,
                "month" : 1,
                "theme" : 1,
                "budget" : 1,
                "totalView" : 1,
                "totalVote" : 1,
                "totalComment" : 1,
                "popularity" : 1,
                "created_at" : 1,
                "c_filter" : {
                    $filter:{
                        input: "$countries",
                        as: "country",
                        cond:{ $or: conds.countryFilter}
                    }
                },
                "d_filter" : { $or: conds.durationFilter },
                "m_filter" : {
                    $filter:{
                        input: "$month",
                        as: "mon",
                        cond:{ $or: conds.monthFilter }
                    }
                }, 
                "t_filter" : conds.themeFilter,
                "b_filter" : { $or: [
                            { $and: [ {$gte:["$budget", conds.budgetMin ]}, {$lte:["$budget", conds.budgetMax ]} ] },
                            { $eq: ["$budget", -1] }
                ]},
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
                    "$ne": []
                },
                "t_filter": {
                    "$nin": [[], false]
                },
                "b_filter": {
                    "$eq": true
                }
            }
        },{ 
            $sort : selectSorting(conds.sortby) 
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
        {   $skip : 10*conds.resultPage },
        {   $limit : 10 }
        // ,{ $count: "count" }
    ]
}

router.get('/all/:sortby/:page', function(req, res){
    // console.log(__dir name + '/index.html')
    // res.sendFile(__dirname + '/index.html');
    res.setHeader('Content-Type', 'application/json');
    console.log(req.params, req.params.sortby, req.params.page, parseInt(req.params.page))
    var sortby = req.params.sortby;
    var result_page = parseInt(req.params.page) - 1;
    var result_num = 10
    var skip_num = result_num * result_page
    sorting = selectSorting(sortby)
    console.log(sortby, result_page, skip_num, sorting)
    if(sorting == null){
        res.status(422);
        res.send('sort by type is not invalid');
    } else{
        treads_col.find({}, {sort: sorting, skip: skip_num, limit: result_num}).then((doc) => {
            console.log(doc)
            res.send(doc);
        })
    }

});


router.post('/filter', function(req, res){
    // console.log(req.body)
    result_per_page = 10

    // var type = req.body.type
    var countries = req.body.countries; //array of string ["Thailand","Singapore"]
    var c_filter = []
    if(countries != null){
        countries.forEach(country => {
            console.log("country:",country)
            c_filter.push( { "$eq": [ "$$country.nameEnglish", country ] } )
        })
    }else{
        c_filter.push( true ) // all country
    }

    var duration = req.body.duration; //array of string ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
    d_filter = []
    console.log("duration:",duration)
    if(duration != null){
        duration.forEach(label => {
            parts = label.replace(/\s+/g, "").match(/(than|\d+)-*(\d+)Days/)
            if(parts[1]=="than"){
                d_filter.push( { "$and": [ {"$gt":["$duration.days", 12]} ] } )
            }else{
                d_filter.push( { "$and": [ {"$gte":["$duration.days", parseInt( parts[1])]},{"$lte":["$duration.days", parseInt(parts[2])] } ] } )
            }
        });
    }else{ //suggest
        d_filter.push( { "$eq":["$duration.days", 0]} )
    }

    var month = req.body.month; //array of string ["January", "September"]
    console.log("month:",month)
    m_filter = [] 
    if(month == null){
        m_filter.push(true) //if month==null retrurn all
    }else{
        month.forEach(mon => {
            m_filter.push( { "$eq": [ "$$mon", mon ] } )
        })
    }

    var themes = req.body.theme; //array of string ["Mountain","Sea"]
    console.log("themes:",themes)
    if(themes == null){
        t_filter = true // if theme==null not filter theme, 
    }else if(themes == "etc"){
        t_filter = { $eq: ["$theme",[]] } // if theme==etc select theme:[]
    }else{
        cond = []
        themes.forEach(theme => {
            cond.push( { $eq: [ "$$theme.theme", theme ] } )
        })
        t_filter = {
            $filter:{
                input: "$theme",
                as: "theme",
                cond:{ $or: cond }
            }
        }
    }
    var budget_min = req.body.budget_min ? req.body.budget_min : 0;
    var budget_max = req.body.budget_max ? req.body.budget_max : 20000;
    var result_page = req.body.result_page ? req.body.result_page : 1;
    var sortby = req.body.sortby ? req.body.sortby : 'popular';
    console.log(budget_min, budget_max, result_page, sortby)
    var pipeline = [
        {
            $project: {
                "topic_id" : 1,
                "title" : 1,
                "thumbnail" : 1,
                "countries" : 1,
                "duration" : 1,
                "month" : 1,
                "theme" : 1,
                "budget" : 1,
                "totalView" : 1,
                "totalVote" : 1,
                "totalComment" : 1,
                "popularity" : 1,
                "created_at" : 1,
                "c_filter" : {
                    $filter:{
                        input: "$countries",
                        as: "country",
                        cond:{ $or: c_filter}
                    }
                },
                "d_filter" : { $or: d_filter },
                "m_filter" : {
                    $filter:{
                        input: "$month",
                        as: "mon",
                        cond:{ $or: m_filter }
                    }
                }, 
                "t_filter" : t_filter,
                "b_filter" : { $or: [
                            { $and: [ {$gte:["$budget", budget_min ]}, {$lte:["$budget", budget_max ]} ] },
                            { $eq: ["$budget", -1] }
                ]},
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
                    "$ne": []
                },
                "t_filter": {
                    "$nin": [[], false]
                },
                "b_filter": {
                    "$eq": true
                }
            }
        },{ 
            $sort : selectSorting(sortby) 
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
        {   $skip : 10*result_page },
        {   $limit : 10 }
        // ,{ $count: "count" }
    ]

    // console.log(JSON.stringify(pipeline, null, 4))
    treads_col.aggregate(pipeline).then((doc) => {
        // console.log(doc)
        res.send(doc);
    })
    // fs.writeFile('D:/AOM_Document/blue-planet-pantip-analysis/threads-classification/demo/pipeline.json', JSON.stringify(pipeline), 'utf8', (error) => { 
    //     if(err){
    //         throw err;
    // }});
    
});

function getCondition(queryString){
    conds = {}
    // COUNTRY
    var countries = queryString.countries; //array of string ["Thailand","Singapore"]
    var c_filter = []
    if(countries){
        countries.split(',').forEach(country => {
            console.log("country:",country)
            c_filter.push( { "$eq": [ "$$country.country", country ] } )
        })
    }else{
        c_filter.push(true) // not country == get all
    }
    conds.countryFilter = c_filter
    
    // DURATION
    var duration = queryString.durations; //array of string ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
    var d_filter = []
    console.log("duration:",duration)
    if(duration != null){
        duration.split(',').forEach(label => {
            parts = label.replace(/\s+/g, "").match(/(than|\d+)-*(\d+)Days/)
            if(parts[1]=="than"){
                d_filter.push( { "$and": [ {"$gt":["$duration.days", 12]} ] } )
            }else{
                d_filter.push( { "$and": [ {"$gte":["$duration.days", parseInt( parts[1])]},{"$lte":["$duration.days", parseInt(parts[2])] } ] } )
            }
        });
    }else{ //suggest
        d_filter.push( { "$eq":["$duration.days", 0]} )
    }
    conds.durationFilter = d_filter

    // MONTH
    var month = queryString.months; //array of string ["January", "September"]
    console.log("month:",month)
    var m_filter = [] 
    if(month){
        month.split(',').forEach(mon => {
            m_filter.push( { "$eq": [ "$$mon", mon ] } )
        })
    }else{
        m_filter.push(true) //if month==null retrurn all
    }
    conds.monthFilter = m_filter

    // THEME
    var theme = queryString.themes; //array of string ["Mountain","Sea"]
    console.log("theme:",theme)
    if(theme){
        cond = []
        theme.split(',').forEach(theme => {
            cond.push( { $eq: [ "$$theme.theme", theme ] } )
        })
        t_filter = {
            $filter:{
                input: "$theme",
                as: "theme",
                cond:{ $or: cond }
            }
        }
    }else if(theme == "etc"){
        t_filter = { $eq: ["$theme",[]] } // if theme==etc select theme:[]
    }else{
        t_filter = true // if theme==null not filter theme, 
    }
    conds.themeFilter = t_filter

    conds.budgetMin = queryString.budget_min ? parseInt(queryString.budget_min): 0;
    conds.budgetMax = queryString.budget_max ? parseInt(queryString.budget_max): 50000;
    conds.resultPage = queryString.result_page ? parseInt(queryString.result_page): 1;
    conds.sortby = queryString.sortby ? queryString.sortby: 'popular';
    console.log(conds.budgetMin, conds.budgetMax, conds.resultPage, conds.sortby)

    return conds
}

router.get('/filterQuery', function(req, res){
    console.log('Query:', req.query)
    conds = getCondition(req.query)
    treads_col.aggregate(pipeline(conds)).then((doc) => {
        // console.log(doc)
        res.send(doc);
    })
});

module.exports = router