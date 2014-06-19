var request = require('request');
var crypto = require('crypto');

var h = "http://127.0.0.1:3000";

// 客户端交互api
// 明星登入
exports.starLogin_fail_noPwd_1 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { name: "liminhao" }},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your username and password");
			test.done();
		}
	);
};
exports.starLogin_fail_noPwd_2 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { name: "liminhao",
				  password: ""}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your username and password");
			test.done();
		}
	);
};
exports.starLogin_fail_noName_1 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { password: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your username and password");
			test.done();
		}
	);
};

exports.starLogin_fail_noName_2 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { name: "",
				  password: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your username and password");
			test.done();
		}
	);
};

exports.starLogin_fail_wrongName = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { name: "liminhao1",
				  password: "121"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 401);
			test.equal(resp.body.err, "user does not exist");
			test.done();
		}
	);
};

exports.starLogin_fail_wrongPwd = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { name: "liminhao",
				  password: "121"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 402);
			test.equal(resp.body.err, "password does not match");
			test.done();
		}
	);
};

exports.starLogin_success = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogin",
		  json: { name: "liminhao",
				  password: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 200);
			test.equal(resp.body.star.username, "liminhao");
			test.done();
		}
	);
};

// 明星登出
exports.starLogout = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starLogout",
		  json:{}},
		function (err, resp, body){
			test.equal(resp.statusCode, 200);
			test.equal(resp.body.info, "logout success");
			test.done();
		}
	);
};

// 明星修改密码
exports.starChangePwd_fail_noName_1 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { oldPassword: "liminhao521",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "wrong request format");
			test.done();
		}
	);
};

exports.starChangePwd_fail_noName_2 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "",
				  oldPassword: "liminhao521",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your password");
			test.done();
		}
	);
};

exports.starChangePwd_fail_noOldPwd_1 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "wrong request format");
			test.done();
		}
	);
};

exports.starChangePwd_fail_noOldPwd_2 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao",
				  oldPassword: "",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your password");
			test.done();
		}
	);
};

exports.starChangePwd_fail_noNewPwd_1 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao",
				  oldPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "wrong request format");
			test.done();
		}
	);
};

exports.starChangePwd_fail_noNewPwd_2 = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao",
				  oldPassword: "liminhao521",
				  newPassword: ""}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 400);
			test.equal(resp.body.err, "Please input your password");
			test.done();
		}
	);
};

exports.starChangePwd_fail_wrongName = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao1",
				  oldPassword: "liminhao521",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 401);
			test.equal(resp.body.err, "star does not exist");
			test.done();
		}
	);
};

exports.starChangePwd_fail_wrongOldPwd = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao",
				  oldPassword: "liminhao520",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 402);
			test.equal(resp.body.err, "password does not match");
			test.done();
		}
	);
};

exports.starChangePwd_success = function(test) {
	test.expect(2);

	request.post(
		{ url: h + "/starChangePassword",
		  json: { name: "liminhao",
				  oldPassword: "liminhao521",
				  newPassword: "liminhao521"}},
		function (err, resp, body) {
			test.equal(resp.statusCode, 200);
			test.equal(body.info, "change password success");
			test.done();
		}
	);
};


