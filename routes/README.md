# Routes Documents
## 1. ForunList page
### 1. GET api/forums/:page/filter?
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
| sortby | upvoted, popular, newest, oldest | popular

**Params:**
| params | value | explaination
|---|---|---|
| page | 1, 2, 3, ... | current page |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: list of documents**
```sh
{
    "threads": [
        {
            "_id": "5ea598215bc25026e32d350a",
            "topic_id": 39807158,
            "title": "ป า กี ส ถ า น .. ถ้าได้ไปแล้วจะหลงรัก by ป้าเกษ สูงวัยลุยไปทั่ว",
            "thumbnail": "https://f.ptcdn.info/976/068/000/q8ruxhopkLr87CU11Hg-o.jpg",
            "countries": [
                {
                    "country": "PK",
                    "latitude": 30.375321,
                    "longitude": 69.345116,
                    "nameEnglish": "Pakistan",
                    "nameThai": [
                        "ปากีสถาน"
                    ]
                }
            ],
            "duration_type": 1,
            "duration": {
                "days": 1,
                "label": "1 Day"
            },
            "theme": [
                {
                    "theme": "Photography",
                    "count": 13
                },
                {
                    "theme": "Mountain",
                    "count": 4
                },
                {
                    "theme": "Sea",
                    "count": 3
                },
                {
                    "theme": "Eating",
                    "count": 3
                }
            ],
            "view": 2255,
            "vote": 15,
            "created_at": "1586918325",
            "floor_budget": 37412,
            "popularity": 199
        }
    ],
    "total_page": 12,
    "current_page": 1
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
{
    "_id": "5e9203006ada3c34bbc8b612",
    "title": "example title",
    "description": "example description",
    "thumbnail": null,
    "threads": [
        {
            "_id": "5e9a0ed65bc2507a55907e28",
            "topic_id": 39808635,
            "title": "How To \"พาพ่อแม่ไปเที่ยวญี่ปุ่น\" พาเที่ยวภูมิภาคTohoku #เที่ยวแหลก-เรียบ",
            "short_desc": "สวัสดีค่า หลังจากที่กระแสกระทู้ How to \"พาพ่อแม่ไปญี่ปุ่น\" ทั้ง 2 อันได้รับเสียงตอบรับที่ดี > https://pantip.com/topic/36069962 > https://pantip.com/topic/37211402 มีคนขอแพลนเที่ยวมาทั้งในพันทิพย์และ Inbox เพจเลย https://www.facebook.com/goeatanythin",
            "thumbnail": "https://f.ptcdn.info/993/068/000/q8tq6b6deW4HW4qlUr6-o.png",
            "vote": 6,
            "popularity": 5,
            "added": "2020-04-18T14:09:35.559Z"
        }
    ],
    "created_at": "2020-04-18T14:09:35.572Z",
    "numThreads": 1
}
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
            "_id": "5e9a0ed65bc2507a55907e28",
            "topic_id": 39808635,
            "title": "How To \"พาพ่อแม่ไปเที่ยวญี่ปุ่น\" พาเที่ยวภูมิภาคTohoku #เที่ยวแหลก-เรียบ",
            "short_desc": "สวัสดีค่า หลังจากที่กระแสกระทู้ How to \"พาพ่อแม่ไปญี่ปุ่น\" ทั้ง 2 อันได้รับเสียงตอบรับที่ดี > https://pantip.com/topic/36069962 > https://pantip.com/topic/37211402 มีคนขอแพลนเที่ยวมาทั้งในพันทิพย์และ Inbox เพจเลย https://www.facebook.com/goeatanythin",
            "thumbnail": "https://f.ptcdn.info/993/068/000/q8tq6b6deW4HW4qlUr6-o.png",
            "vote": 6,
            "popularity": 5,
            "added": "2020-04-18T14:09:35.559Z"
        }
    ],
    "created_at": "2020-04-11T19:04:21.951Z",
}
```

### 4. GET api/my-triplist/triplists/:id/:page
Get a triplist by id

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| id | 5e16db7d3c0dffa34b663e03 | id of the triplist |
| page | 1, 2, 3, ... | current page |

**QueryString:**
| query | value | default
|---|---|---|
| sortby | latest, vote, popular | latest |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "triplist": {
        "_id": "5ea6dfac10f159424073b783",
        "title": "example title",
        "description": "example description",
        "thumbnail": null,
        "num_threads": 2,
        "created_at": "2020-04-27T13:35:40.290Z",
        "threads": [
            {
                "_id": "5ea598215bc25026e32d3506",
                "topic_id": 39814055,
                "title": "อาชีพพนักงานบนเรือสำราญ",
                "short_desc": "🚢 อาชีพลูกเรือสำราญ 🚢 อีกหนึ่งอาชีพ ที่เหมาะสำหรับคนที่อยากจะลองทำงานต่างประเทศ❗️ “ดีจังเลย ได้ไปทำงานบนเรือสำราญ ได้เที่ยวฟรี รายได้ก็ดี กินอยู่ฟรีบนเรือ แถมได้ฝึกภาษาด้วย” นี่เป็นคำพูดของหลายๆคนเมื่อรู้ว่าแนตเคยไปทำงานลูกเรือบนเรือสำราญที่ USA 🇺🇸 ส",
                "thumbnail": "https://f.ptcdn.info/020/069/000/q8x0nqp4l1AwFLZE0hl-o.jpg",
                "vote": 49,
                "popularity": 5480,
                "added": "2020-04-27T13:35:40.199Z"
            }
        ]
    },
    "total_page": 1,
    "current_page": 1
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

### 9. GET api/my-triplist/favorites/:page
Get all favorite thread(s)

#### Request
**Header**
'Content-Type': 'application/json'
'Authorization': 'OAuth 2.0'

**Params:**
| params | value | explaination
|---|---|---|
| page | 1, 2, 3, ... | current page |

**QueryString:**
| query | value | default
|---|---|---|
| sortby | latest, vote, popular | lastest |

#### Response
**Header**
'Content-Type' : 'application/json'

**Body: document**
```sh
{
    "favorite": {
        "_id": "5ea70fc38c51e8709ed73027",
        "threads": [
            {
                "_id": "5ea598215bc25026e32d3506",
                "topic_id": 39814055,
                "title": "อาชีพพนักงานบนเรือสำราญ",
                "short_desc": "🚢 อาชีพลูกเรือสำราญ 🚢 อีกหนึ่งอาชีพ ที่เหมาะสำหรับคนที่อยากจะลองทำงานต่างประเทศ❗️ “ดีจังเลย ได้ไปทำงานบนเรือสำราญ ได้เที่ยวฟรี รายได้ก็ดี กินอยู่ฟรีบนเรือ แถมได้ฝึกภาษาด้วย” นี่เป็นคำพูดของหลายๆคนเมื่อรู้ว่าแนตเคยไปทำงานลูกเรือบนเรือสำราญที่ USA 🇺🇸 ส",
                "thumbnail": "https://f.ptcdn.info/020/069/000/q8x0nqp4l1AwFLZE0hl-o.jpg",
                "vote": 49,
                "popularity": 5480,
                "added": "2020-04-27T17:01:14.101Z"
            }
        ],
        "num_threads": 1
    },
    "total_page": 1,
    "current_page": 1
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

### 11. PUT /api/my-triplist/favorites/check/:id
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

**Body: list of documents**
```sh
{
    "_id": "5ea598215bc25026e32d3507",
    "topic_id": 39834825,
    "title": "รีวิวเที่ยวเกาหลีหน้าหนาว เค้าท์ดาวน์ปีใหม่ ตะลุยกินอาหารร้านเด็ด คาเฟ่ฮิปๆ [Korea Over Year]",
    "added": "2020-04-27T14:35:55.016Z"
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