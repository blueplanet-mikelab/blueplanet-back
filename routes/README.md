# Routes Documents
## 1. ForunList page
### 1. GET forums/filterQuery?
Get threads both with or without filters.

#### Request
**QueryString:**
| query | value | default value
|---|---|---|
| type | review, suggest | review
| countries | ["Taiwan", "Thailand"] | true
| duration_type | 1, 2, 3, 4, 5 | 1
| months | ["August", "October"] | true
| themes | ["Mountain", "Historical", "Sightseeing"] | true
| budget_min | 0 - 50000 | 0
| budget_max | 0 - 50000 | 50000
| result_page | 1 | 1
| sortby | upvoted, popular, newest, oldest | popular

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
{
        "_id": "5e16dc663c0dffa34b6642a4",
        "topic_id": 38348020,
        "title": "USJ Theme christmas มันดีเหลือเกิน !!!",
        "thumbnail": "https://f.ptcdn.info/327/061/000/pjgvh0129jfrr6ok4DJ-s.jpg",
        "countries": [
            {
                "country": "JP",
                "latitude": 36.204824,
                "longitude": 138.252924,
                "nameEnglish": "Japan",
                "nameThai": [
                    "ญี่ปุ่น",
                    "โอกินาว่า",
                    "โอซากา",
                    "เกียวโต",
                    "เกียวโต",
                    "ฮอกไกโด"
                ]
            }
        ],
        "duration_type": 1,
        "duration": {
            "days": 1,
            "label": "1 Day"
        },
        "theme": [],
        "view": 2541,
        "vote": 1,
        "created_at": "2019-01-09T04:46:30.000Z",
        "floorBudget": 15907,
        "popularity": 6
    }
```

## 2. Home Page
### 1. GET home/mapCountries
Get a countries' name along with its latitude and longitude.

### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
{
        "_id": "HK",
        "country": {
            "country": "HK",
            "latitude": 22.396428,
            "longitude": 114.109497,
            "nameEnglish": "Hong Kong",
            "nameThai": [
                "ฮ่องกง"
            ]
        },
        "count": 263
    }
```

### 2. GET home/suggestThreads
Get suggestion threads which duration is not undefined by the creator.

#### Request
**QueryString:**
| query | value | default value
|---|---|---|
| within_th | 0, 1 | 0 |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
{
        "_id": "5e16db7d3c0dffa34b663df6",
        "topic_id": 38952886,
        "title": "รีวิวสถานที่เที่ยวชิวๆ และเรียนภาษาอังกฤษที่ฟิลิปปินส์ เมืองบาเกียว",
        "thumbnail": "https://f.ptcdn.info/405/064/000/psv3pscks5qRNvwrIhX-s.jpg",
        "countries": [
            {
                "country": "PH",
                "latitude": 12.879721,
                "longitude": 121.774017,
                "nameEnglish": "Philippines",
                "nameThai": [
                    "ฟิลิปปินส์"
                ]
            }
        ],
        "duration_type": null,
        "duration": {
            "days": null,
            "label": "Not Define"
        },
        "month": null
    },
```

### 3. GET home/durationQuery?
Get threads based on selected duration and the country area.

#### Request
**QueryString:**
| query | value | default value
|---|---|---|
| duration_type | 1, 2, 3, 4 ,5 | 1 |
| within_th | 0, 1 | 0 |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
{
        "_id": "5e16db7d3c0dffa34b663e08",
        "topic_id": 36507483,
        "title": "::: เที่ยวอังกฤษแบบครบรส ::: เมื่อคุณผู้ชายอยากไปดูบอล แต่เราจะไปนอนทะเลสาบ!!! ::: ตอนที่ 2 :::",
        "thumbnail": "https://f.ptcdn.info/479/051/000/oqnyqd1d13X9Bm1ce9O-o.jpg",
        "countries": [
            {
                "country": "GB",
                "latitude": 55.378051,
                "longitude": -3.435973,
                "nameEnglish": "United Kingdom",
                "nameThai": [
                    "สหราชอาณาจักร",
                    "ประเทศอังกฤษ",
                    "สกอตแลนด์",
                    "กระบี่",
                    "ลอนดอน"
                ]
            }
        ],
        "duration_type": 3,
        "duration": {
            "days": 8,
            "label": "8 Days"
        },
        "month": null
    },
```

### 4. GET home/monthQuery?
Get threads based on selected month and the country area.

#### Request
**QueryString:**
| query | value | default value
|---|---|---|
| month | August | true |
| within_th | 0, 1 | 0 |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
{
        "_id": "5e16db7d3c0dffa34b663df1",
        "topic_id": 39145464,
        "title": "ไต้หวัน : นั่งกิน นอนกิน นอนแช่ออนเซ็น เย็นเย็นก็ช้อปปิ้ง (4วัน3คืน) หมื่นบาทมีทอนรวมทุกอย่าง #ทริปไฟไหม้",
        "thumbnail": "https://f.ptcdn.info/509/065/000/pw9zn532k6N7ln1jkGBp-o.jpg",
        "countries": [
            {
                "country": "TW",
                "latitude": 23.69781,
                "longitude": 120.960515,
                "nameEnglish": "Taiwan",
                "nameThai": [
                    "ไต้หวัน"
                ]
            }
        ],
        "duration_type": 2,
        "duration": {
            "days": 4,
            "label": "4 Days"
        },
        "month": [
            "August"
        ]
    },
```