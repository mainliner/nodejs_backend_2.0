var request = require('request');
var crypto = require('crypto');

var h = "http://127.0.0.1:3000";

var userData = {
    "_id" : "539a8c7cfda3accc0f0c0fdd",
    "user" : {
        "dateInfo" : [],
        "userInfo" : {
            "password" : "fba5c7ec7868ab1ee7cae30b8b16ca0f9a2ec5587f133a014578831667a79270",
            "lastUpDateTime" : "2014-06-13T05:34:59.826Z",
            "lovePoint" : 200,
            "photoFrame" : "None",
            "everydayArray" : [],
            "salt" : "d8f8ff90-f2bb-11e3-987b-99b67757408e",
            "UUID" : "XXXX",
            "email" : "q@q.qq",
            "birthday" : "2014-06-13T05:30:36.425Z",
            "audioLoadTime" : "2014-06-13T05:34:59.826Z",
            "gender" : "None",
            "phone" : "XXXX",
            "receiveGiftTime" : 0,
            "name" : "None",
            "money" : 12000,
            "status" : "normal",
            "messageLoadTime" : "2014-06-13T05:34:59.825Z"
        },
        "npcInfo" : [ 
            {
                "name" : "Molly",
                "relationValue" : 20
            }, 
            {
                "name" : "Molly",
                "relationValue" : 20
            }, 
            {
                "name" : "Molly",
                "relationValue" : 20
            }, 
            {
                "name" : "Molly",
                "relationValue" : 20
            }, 
            {
                "name" : "Molly",
                "relationValue" : 20
            }, 
            {
                "name" : "Molly",
                "relationValue" : 20
            }
        ],
        "starInfo" : [ 
            {
                "name" : "yangyang",
                "startDate" : "2014-06-13T05:33:02.809Z",
                "elationValue" : 0,
                "starId" : "534ba1488ccd99bf7a63ad75",
                "expireTime" : "2014-06-13T05:33:02.809Z",
                "receiveItem" : [],
                "dieFlag" : false
            }
        ],
        "items" : {
            "furniture" : [],
            "Props" : [],
            "CD" : [],
            "clothes" : []
        }
    }
};

exports.unSubscribeToStar_success = function(test){
	test.expect(2);

	request.post(
		{ url: h + "/unsubscribetostar",
		  json: { starId: "534ba1488ccd99bf7a63ad75",
				  userId: "539a8c7cfda3accc0f0c0fdd"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 200);
			test.equal(body.info, "unscriber success");
			test.done();
		}
	);
};

exports.userReLive_success = function(test){
	test.expect(2);

	request.post(
		{ url: h + "/relive",
		  json: { starId: "534ba1488ccd99bf7a63ad75",
				  userId: "539a8c7cfda3accc0f0c0fdd"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 200);
			test.equal(body.info, "relive success");
			test.done();
		}
	);
};

exports.putUser_success = function(test){
	test.expect(2);

	var userData_tmp = JSON.stringify(userData);
    var salt = "ce23dc8d7a345337836211f829f0c05d";
    var md5 = crypto.createHash('md5');
    var newStr = userData_tmp+salt;
    var checkKey = md5.update(newStr,'utf-8').digest('hex');

	request.post(
		{ url: h + "/putuser",
		  json: { userData: userData,
				  checkKey: checkKey}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 200);
			test.equal(body.info, "upload success");
			test.done();
		}
	);
};