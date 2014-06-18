#WeDate RESTful API Doc

-------
##User Register

```
POST /reg
```
######JSON Format:
```
requset: {'phone':'xxxxx','email':'xxxx','password':'xxxxxx','UUID':'xxxxx'}
response: 200, {core user object}
          400, {err:'some mongodb err'}
          401, {err:'user has exist'}
          300,{'err':'some mongodb err when save the new user data'}
          302,{'err':'you have login'}
```
######NOTE: 
- *phone*/*email* at least one key has the value
- not login required

##User Login
```
POST /login
```
######JSON Format:
```
request: {'phone':'xxxxx','email':'xxxx','password':'xxxxxx','UUID':'xxxxx'}
response: 200, {core user object}
          400, {err:'some mongodb err'}
          401, {err:'user does not exist'}
          402,{'err':'password does not match'}
          302,{'err':'you have login'}
```
######NOTE: 
- *phone*/*email* at least one key has the value.
- *UUID* should be to get the newest from the device every time when post a login requst.
- not login required

##User Logout
```
GET /logout
```
######JSON Format:
```
request: None
response: 304,{'info':'logout success'}
          302,{'err':'you have not login'}
```
######Note:
- login required

##Check uers data version
```
POST /check_user_version
```
######JSON Format:
```
request: {core user object}
response:201,{'info':'need to upload device data'}
         202,{'info':'need to download the newest data'}
         302,{'err':'you have not login'}
```
######Note:
- login required

##Get User Infomation
```
GET /getuser
```
######JSON Format:
```
request: None
response:200,{core user object}
         400,{'err':'mongodb err'}
```
######Note:
- login required

##Put User Infomation
```
POST /putuser
```
######JSON Format:
```
request: {userDate:core user object, checkKey:string}
response:200,{'info':'upload success'}
         400,{'err':'mongodb error'}
         333,{'err':'Please don't be evil'}
         302,{'err':'you have not login'}
```
######Note:
- login required

##upload audio message
```
POST /upload
```
######JSON Format:
```
request: mutilpart form post date especially
response:200,{'info':'upload success'}
         400,{'err':'mongodb err'}
         302,{'err':'you have not login'}
```
######Note:
- login required (star account)

##Get last audio message

```
GET /getlastaudio
```
######JSON Format:
```
request:  {starArray:['xx','starid'], audioLoadTime: xxxxx}
response:200,[core audio message](sort by time)
         400,{'err':'mongodb err'}
         302,{'err':'you have not login'}
```
######Note:
- login required 

##Get last audio message
```
GET /getlastmessage
```
######JSON Format:
```
request:  {starArray:['starid1','starid2'], messageLoadTime: xxxxx}
response:200,[core message message](sort by time)
         400,{'err':'mongodb err'}
         302,{'err':'you have not login'}
```
######Note:
- login required 


##Get Diary Audio And Message

```
GET /getdiaryaudioandmessage
```
######JSON Format:
```
request: {starId:string, starDateTime: Date}
response:200,[  audioArray:[core audio message],
                messageArray:[core message message]
             ] (sort by time)
         400,{'err':'mongodb err'}
         302,{'err':'you have not login'}
```
######Note:
- login required

##Change user password

```
POST /password
```
######JSON Format:
```
request: {oldPassword:'xxxx', newPassword:'xxxx'}
response:200,{'info':'change password success'}
         400,{'err':'wrong request format'}
         402,{'err':'password does not match'}
```
######Note:
- login required

##Get back the forget user password

```
POST /reset
GET  /reset
```
######JSON Format:
```
POST:
request: {email:'xxxx', name:'xxxx'}
response:200,{'info':'send email successful'}
         400,{'err':'some mongodb error'}
         401,{'err':'send email failed'}
         402,{'err':'information not match'}
GET:
    user should open this page with the email in their mail inbox with browser
    new password or some outTime error alert.
```
######Note:
- login required


##Get star info
...
##Get item info
...
##Subscribe a star
...
##Unsubcribe a star
...








=====
#*Appendix*
===
**{core user object}**

```
{
    "_id" : ObjectId("5333edfc0e5b06e51d958b81"),
    "user" : {
        "userInfo" : {
            "password" : "tZxnvxlqR1gZHkL3ZnDOug==",
            "lovePoint" : 200,
            "photoFrame" : "None",
            "lastUpDateTime" : "2014-03-27T09:23:08.077Z",
            "UUID" : "aaaaaaaaaaaaaaa",
            "email" : "yuanbo",
            "birthday" : "2014-03-27T09:23:08.077Z",
            "gender" : "None",
            "name" : "None",
            "receiveGiftTime" : 0,
            "phone" : "",
            "money" : 6000,
            "status" : "normal"
        },
        "npcInfo" : [ 
            {name:'npc1',relationValue:0}, 
            {name:'npc2',relationValue:0}, 
            {name:'npc3',relationValue:0}, 
            {name:'npc4',relationValue:0}, 
            {name:'npc5',relationValue:0}
        ],
        "starInfo" : [ 
            {
                "name" : "赵本山",
                "startDate" : "2014-03-27T09:23:08.077Z",
                "elationValue" : 0,
                "starId" : "",
                "expireTime" : "2014-03-27T09:23:08.077Z",
                "receiveItem" : []
            }
        ],
        "items" : {
            "furniture" : [ 
                {
                    "id" : "",
                    "num" : 1
                }, 
                {
                    "id" : "",
                    "num" : 1
                }
            ],
            "props" : [ 
                {
                    "id" : "",
                    "num" : 1
                }, 
                {
                    "id" : "",
                    "num" : 1
                }
            ],
            "CD" : [ 
                {
                    "id" : "",
                    "num" : 1
                }, 
                {
                    "id" : "",
                    "num" : 1
                }
            ],
            "gift" : [ 
                {
                    "id" : "",
                    "num" : 1
                }, 
                {
                    "id" : "",
                    "num" : 1
                }
            ],
            "consumption" : [
                {
                    "id" : "",
                    "num" : 2
                }
            ]
        }
    }
}
```
**core item object**

```
{
    "_id" : ObjectId("53967feba21645ab3a742425"),
    "item" : {
        "LP" : 0,            //int32
        "attribute" : 3,    //属性值有正负+/—的int32
        "chineseName" : "唇膏",
        "description" : "一个连牌子都没有的产品",
        "englishName" : "Lipstick",
        "isRMB" : 0,        // 0 非LP商品  1 LP商品
        "level" : 0,        //int32
        "pictureBig" : "LipstickBig",
        "pictureSmall" : "LipstickSmall",
        "price" : 600,     //int32
        "sex" : "girl",    //girl boy anyone
        "title" : "女神的必备品",
        "type" : "礼品",
        "wearable" : 0     //0 不可穿戴  1可穿戴
    }
}
```
**core audio message**

```
{
    "audioFileId" : ObjectId("537483bce546bbf2630739c2"),
    "starId" : "534ba1488ccd99bf7a63ad75",
    "uploadDate" : ISODate("2014-06-01T09:10:37.478Z"),
    "_id" : ObjectId("5374848de83178490415e295")
}
```
**core message message**

```
{
    "messagePhotoId" : ObjectId("537585fa83516da971229c17"),
    "starId" : "534ba1488ccd99bf7a63ad75",
    "messageBody" : "这是 测试数据 测试推送服务.<_>\n参数\n参数 size 是期望的数组元素个数。返回的数组，length 字段将被设为 size 的值。\n\n参数 element ..., elementn 是参数列表。当使用这些参数来调用构造函数 Array() 时，新创建的数组的元素就会被初始化为这些值。它的 length 字段也会被设置为参数的个数。\n返回值\n返回新创建并被初始化了的数组。\n当把构造函数作为函数调用，不使用 new 运算符时，它的行为与使用 new 运算符调用它时的行为完全一样。\n当调用构造函数时只传递给它一个数字参数，该构造函数将返回具有指定个数、元素为 undefined 的数组。\n如果调用构造函数 Array() 时没有使用参数，那么返回的数组为空，length 字段为 0.\n",
    "uploadDate" : ISODate("2014-06-01T05:29:43.461Z"),
    "_id" : ObjectId("537434a7d6111a0b553476ac")
}
```
**core npc object**

```
{
    "_id" : ObjectId("538824999ef095cd26f10668"),
    "npc" : {
        "birthday" : ISODate("1992-09-04T16:00:00.000Z"),
        "blood" : "AB",
        "constellation" : "处女座",
        "description" : "如果这家咖啡厅会有人突然狂吐鲜血的话，那一定就是她所服务的客人了。",
        "l2dModel" : "Molly",
        "language" : [ 
            "你好，我是茉莉。", 
            "我不是为了让你吃得开心才来这里的", 
            "有的时候追逐梦想的人比抓住梦想的人更能发挥实力", 
            "爱尔兰咖啡一定要用心去做，否则不纯。", 
            "不管老板有什么意见，我的店，我做主。", 
            "再怎么卖萌也掩盖不了你那逝去的青春。", 
            "你的脸就像空气，我怎么看不见呢。"
        ],
        "npcChineseName" : "茉莉",
        "npcEnglishName" : "Molly",
        "petPhrase" : "什么都不懂的人，别开玩笑了。",
        "shopModel" : {
            "backImageStr" : "facetime_detail_background",
            "chineseTitle" : "一家咖啡店",
            "englishTitle" : "Caffee Shop",
            "titleImageStr" : "",
            "typeArray" : [ 
                {
                    "item" : [ 
                        "5385a3073b59e0224c80e667", 
                        "5386ffb764289d30de6add88"
                    ],
                    "shopType" : "甜品"
                    "englishShopType" : "sweat food"
                }, 
                {
                    "item" : [ 
                        "5388238e9ef095cd26f10664", 
                        "538823b09ef095cd26f10665", 
                        "538823ce9ef095cd26f10666", 
                        "538823f09ef095cd26f10667"
                    ],
                    "shopType" : "咖啡"
                }
            ]
        }
    }
}
```
**core star object**

```
{
    "_id" : ObjectId("534ba1488ccd99bf7a63ad75"),
    "star" : {
        "birthday" : ISODate("1988-03-20T16:00:00.000Z"),
        "birthplace" : "英国",
        "blood" : "O",
        "chineseName" : "阿阳",
        "constellation" : "双子座",
        "description" : "阿克苏决定阿斯顿四大发明赛四大家法案水电费ISA的疯狂近似啊的撒地方",
        "englishName" : "yangyang",
        "gender" : "woman",
        "headPortrait" : "fo_head",
        "nickName" : "嘻嘻嘻",
        "password" : "4QrcOUm6Wau+VuBX8g+IPg==",
        "portraitBig" : "fo",
        "portraitSmall" : "fo_small",
        "stature" : "188",
        "username" : "ayang",
        "voice" : "吉吉"
    }
}
```