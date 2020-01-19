# Routes Documents
## 1. ForunList page
### 1. GET forums/filterQuery?
get threads both with or without filters

#### Request
**QueryString:**
- countries: ["Taiwan", "Thailand"]
- durations: ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
- months: ["August", "October"]
- themes: ["Mountain", "Historical", "Sightseeing"]
- budget_min: 0
- budget_max: 10000
- result_page: 1 (start from 1)
- sortby: 4 values available
    - upvoted
    - popular
    - newest
    - oldest

#### Response
**Header**
- 'Content-Type' : 'application/json'

**Body: list of documents**
- "_id" : ObjectId("..."),
- "topic_id" : 39xxxxxx.0,
- "title" : "Title",
- "thumbnail" : "https://xxxx.jpg",
- "countries" : [ 
        {
    - "country" : "TW",
    - "latitude" : 23.69781,
    - "longitude" : 120.960515,
    - "nameEnglish" : "Taiwan",
    - "nameThai" : [  "ไต้หวัน" ] <br>
        }, ....
    ],
- "duration" : {
    - "days" : 4,
    - "label" : "4 Days"
    },
- "month" : [ "August", ... ],
- "season" : "",
- "theme" : [ 
        { //at most 4 themes
    - "theme" : "Eatting",
    - "count" : 96 <br>
        }, 
        ..
    ],
- "budget" : 9423,
- "totalView" : 5752,
- "totalVote" : 1,
- "totalComment" : 10,
- "popularity" : 56.4780824434962,
- "created_at" : ISODate("2019-08-15T12:48:08.366Z")

#### default query value if it isn't exists
- countries: true
- durations: true
- months: true
- themes: true
- budget_min: 0
- budget_max: 50000
- result_page: 1
- sortby: popular

## 2. Home Page
### 1. GET home/mapCountries
get countries' name along with its latitude and longitude (ranking in future)

### Response
**Header**
- 'Content-Type' : 'application/json'

**Body: list of documents**
- "_id": "5e204a2750510dcbd1a4c722",
- "country": "AF",
- "latitude": 33.93911,
- "longitude": 67.709953,
- "nameEnglish": "Afghanistan",
- "nameThai": [
    "อัฟกานิสถาน"
]

### 2. GET home/durationQuery?
get threads based on selected duration and the country area

#### Request
**QueryString:**
- durations: ["1-3Days", "4-6Days", "7-9Days","10-12Days","Morethan12Days"]
- within_th: 0

#### Response
**Header**
- 'Content-Type' : 'application/json'

**Body: list of documents**
- "_id" : ObjectId("..."),
- "topic_id" : 39xxxxxx.0,
- "title" : "Title",
- "thumbnail" : "https://xxxx.jpg",
- "duration" : {
    - "days" : 4,
    - "label" : "4 Days"
    },

### 3. GET home/monthQuery?
get threads based on selected month and the country area

#### Request
**QueryString:**
- months: ["August", "October"]
- within_th: 0

#### Response
**Header**
- 'Content-Type' : 'application/json'

**Body: list of documents**
- "_id" : ObjectId("..."),
- "topic_id" : 39xxxxxx.0,
- "title" : "Title",
- "thumbnail" : "https://xxxx.jpg",
- "month" : "August"