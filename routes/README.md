# Routes Documents
## 1. ForunList page
### 1. GET api/forums/filterQuery?
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
### 1. GET api/home/mapCountries
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

### 2. GET api/home/suggestThreads
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

### 3. GET api/home/durationQuery?
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

### 4. GET api/home/monthQuery?
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

## 3. My Triplist page
### 1. GET api/my-triplist/triplists?
Retrieve all triplist(s)

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**QueryString:**
| query | value | default
|---|---|---|
| sortby | most, newest | newest |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
[
    {
        "_id": "5e920850bed37e391b132a9d",
        "title": "example title",
        "description": "example description",
        "thumbnail": null,
        "threads": [],
        "created_at": "2020-04-11T18:11:28.305Z",
        "numThreads": 0
    },
    {
        "_id": "5e9203006ada3c34bbc8b612",
        "title": "example title",
        "description": "example description",
        "thumbnail": null,
        "threads": [
            {
                "_id": "5e16db7d3c0dffa34b663e03",
                "topic_id": 39137338,
                "title": "รีวิว \"ขอแฟนที่วัดหลงซาน\" พร้อมวิธีขอแบบละเอียดค่ะ ( by เราเขียนแฟนถ่าย)",
                "thumbnail": "https://f.ptcdn.info/464/065/000/pw4oxvbtzo1WslcZ2XI-s.jpg",
                "vote": 5,
                "created_at": "2019-09-12T08:28:05.000Z",
                "popularity": 199,
                "added": "2020-04-11T17:47:01.065Z"
            },
            {
                "_id": "5e16db7d3c0dffa34b663dff",
                "topic_id": 33628809,
                "title": "Tokyo, Hakone, Kawaguchiko golden week และปิด Owakudani: D1 3 พค 2558 Shinjuku Gyoen, Harajuku, Meiji shrine, Shibuya",
                "thumbnail": "http://f.ptcdn.info/181/031/000/1431171739-fuji-o.jpg",
                "vote": 12,
                "created_at": "2015-06-09T04:44:40.000Z",
                "popularity": 3,
                "added": "2020-04-11T17:47:01.065Z"
            }
        ],
        "created_at": "2020-04-11T17:48:48.639Z",
        "numThreads": 2
    }
]
```

### 2. POST api/my-triplist/triplists/add
Create a new triplist without an initialized thread

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Body**
```sh
{
	"title": "example title",
	"description": "example description",
	"thumbnail": null
}
```

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "_id": "5e92132cd52dee3fcb35169a"
    "title": "example title",
    "description": "example description",
    "thumbnail": null,
    "threads": [],
    "created_at": "2020-04-11T18:57:48.682Z",
}
```

### 3. POST api/my-triplist/triplists/add/:id
Create a new triplist with an initialized thread

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the initialized thread |

**Body**
```sh
{
	"title": "example title",
	"description": "example description",
	"thumbnail": null
}
```

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "_id": "5e9214b58383574013f4270c"
    "title": "example title",
    "description": "example description",
    "thumbnail": null,
    "threads": [
        {
            "_id": "5e16db7d3c0dffa34b663e03",
            "topic_id": 39137338,
            "title": "รีวิว \"ขอแฟนที่วัดหลงซาน\" พร้อมวิธีขอแบบละเอียดค่ะ ( by เราเขียนแฟนถ่าย)",
            "thumbnail": "https://f.ptcdn.info/464/065/000/pw4oxvbtzo1WslcZ2XI-s.jpg",
            "vote": 5,
            "popularity": 199,
            "added": "2020-04-11T19:04:21.426Z"
        }
    ],
    "created_at": "2020-04-11T19:04:21.951Z",
}
```

### 4. GET api/my-triplist/triplists/:id
Get a triplist by id

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the triplist |

**QueryString:**
| query | value | default
|---|---|---|
| sortby | latest, upvoted, popular | null |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "_id": "5e9214b58383574013f4270c",
    "title": "example title",
    "description": "example description",
    "thumbnail": null,
    "threads": [
        {
            "_id": "5e16db7d3c0dffa34b663e03",
            "topic_id": 39137338,
            "title": "รีวิว \"ขอแฟนที่วัดหลงซาน\" พร้อมวิธีขอแบบละเอียดค่ะ ( by เราเขียนแฟนถ่าย)",
            "thumbnail": "https://f.ptcdn.info/464/065/000/pw4oxvbtzo1WslcZ2XI-s.jpg",
            "vote": 5,
            "popularity": 199,
            "added": "2020-04-11T19:04:21.426Z"
        }
    ],
    "created_at": "2020-04-11T19:04:21.951Z",
    "numThreads": 1
}
```

### 5. PUT api/my-triplist/triplists/:id
Update a detail of triplist by id

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the triplist |

**Body**
```sh
{
	"title": "NEW EXMAPLE TITLE",
	"description": "example description",
	"thumbnail": null
}
```

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: message**
```sh
{
    "message": "Your Triplist has been updated"
}
```

### 6. PUT api/my-triplist/triplists/:id/add/:threadId
Add a thread to a triplist

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the triplist |
| threadId | 5e16db7d3c0dffa34b663e03 | id of the thread |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: message**
```sh
{
    "message": "Your Triplist has been updated"
}
```

### 7. DELETE api/my-triplist/triplists/:id/remove/:threadId
Remove a thread from a triplist

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the triplist |
| threadId | 5e16db7d3c0dffa34b663e03 | id of the thread |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: message**
```sh
{
    "message": "Your Triplist has been updated"
}
```

### 8. DELETE api/my-triplist/triplists/:id
Remove a triplist

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the triplist |

**Body**
```sh
{
    "message": "Your Triplist has been deleted"
}
```

### 9. GET api/my-triplist/favorites
Get all favorite thread(s)

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**QueryString:**
| query | value | default
|---|---|---|
| sortby | latest, upvoted, popular | lastest |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "_id": "5e91e4dfc2eccaa2e04bc2f6",
    "favThreads": [
        {
            "_id": "5e16db7d3c0dffa34b663df3",
            "topic_id": 39141575,
            "title": "พาเดินเล่น ดูร้านอาหาร อาคารผู้โดยสาร 2 (ภายในประเทศ) สนามบินดอนเมือง",
            "thumbnail": "https://f.ptcdn.info/489/065/000/pw7n956p0nwLbxtCTdPt-s.jpg",
            "vote": 8,
            "popularity": 52,
            "added": "2020-04-11T17:31:00.202Z"
        }
    ]
}
```

### 10. GET api/my-triplist/favorites:id
Get boolean of a thread if it has been added by id

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the thread |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body**
```sh
true
```

### 11. PUT /api/my-triplist/favorites/:id
Add a thread to favorite

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the thread |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: message**
```sh
{
    "message": "Added to Favorite."
}
```

### 12. DELETE api/my-triplist/favorites/:id
Remove a thread from favorite

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the thread |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: message**
```sh
{
    "message": "Removed from Favorite."
}
```

### 13. GET api/my-triplist/recently-viewed

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "_id": "5e91f420c2eccaa2e04bd56d",
    "recentThreads": [
        {
            "_id": "5e16db7d3c0dffa34b663e04",
            "topic_id": 39144715,
            "title": "### สะพายกล้อง Canon EOS 200D II เที่ยว แม่ฮ่องสอน – น่าน ###",
            "added": "2020-04-11T16:46:13.426Z"
        },
        {
            "_id": "5e16db7d3c0dffa34b663dfd",
            "topic_id": 39141623,
            "title": "จากอมก๋อย สู่แม่ลาน้อย ให้ร่างกายและใบหน้าได้ปะทะกลิ่นหมอกไอฝน",
            "added": "2020-04-11T16:45:32.270Z"
        }
    ]
}
```

### 14. PUT api/my-triplist/recently-viewed/:id

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the thread |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body**
```sh
true
```
