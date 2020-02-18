# Routes Documents
## 1. ForunList page
### 1. GET forums/filterQuery?
get threads both with or without filters

#### Request
**QueryString:**
- type: review
- countries: ["Taiwan", "Thailand"]
- duration_type: 1
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
- "_id": "5e16db7d3c0dffa34b664031",
- "topic_id": 37953737,
- "title": "Unseen Switzerland 2018 ฉบับลุงหมอขอพักร้อน ตอน \"ตามหาโคมไฟดวงเล็กๆ ในฤดูร้อน\"",
- "thumbnail": "https://f.ptcdn.info/145/059/000/pddu7l42dTi191bx4C3-o.jpg",
- "duration_type": 1,
-  "duration": {
      "days": 1,
      "label": "1 Day"
  },
- "vote": 23,
- "popularity": 44,
- "floorBudget": 38498

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
- duration_type: 1
- within_th: 0

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
- "duration_type": 1,
- "duration" : {
    - "days" : 4,
    - "label" : "4 Days"
    },
- "month" : [ "August", ... ]

### 3. GET home/monthQuery?
get threads based on selected month and the country area

#### Request
**QueryString:**
- months: "August"
- within_th: 0

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
- "duration_type": 1,
- "duration" : {
    - "days" : 4,
    - "label" : "4 Days"
    },
- "month" : [ "August", ... ],