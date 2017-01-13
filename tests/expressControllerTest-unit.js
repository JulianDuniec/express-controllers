var expressControllers = require('../lib/expressController')

module.exports = {

	setDirectoryShouldReturnInstance : function(test) {
		//Given that I have a controller named HomeController with an index-method,
		//express-controllers should generate the path "/"
		var controllersDir = __dirname + '/mock';
		var res = expressControllers
			.setDirectory(controllersDir);
		test.strictEqual(res, expressControllers);
		test.done();
	},

	translateFileNameToControllerName : function(test) {
		var fileName = 'HomeController.js';
		var res = expressControllers.translateFileNameToControllerName(fileName);
		test.equal(res, 'Home');
		test.done();
	},

	translateHomeIndex : function(test) {
		var res = expressControllers.translatePath('', 'get_index', 'home');
		test.equal(res.path, '/');
		test.done();
	},

	translateMethod : function(test) {
		var res = expressControllers.translatePath('', 'post_index', 'home');
		test.equal(res.method, 'post');
		var res = expressControllers.translatePath('', 'get_index', 'home');
		test.equal(res.method, 'get');
		var res = expressControllers.translatePath('', 'delete_index', 'home');
		test.equal(res.method, 'delete');
		var res = expressControllers.translatePath('', 'patch_index', 'home');
		test.equal(res.method, 'patch');
		test.done();
	},

	translateMethodWithoutRequest : function(test) {
		var res = expressControllers.translatePath('', 'index', 'home');
		test.strictEqual(res, false);
		test.done();
	},

	translateMethodInNestedDirectory : function(test) {
		var res = expressControllers.translatePath('/api/v1', 'get_create', 'people');
		test.equal(res.path, '/api/v1/people/create');
		test.equal(res.method, 'get');
		test.done();
	},

	translatePeopleIndex : function(test) {
		var res = expressControllers.translatePath('', 'get_index', 'people');
		test.equal(res.path, '/people');
		test.equal(res.method, 'get');
		test.done();
	},
	
	translatePeopleFind : function(test) {
		var res = expressControllers.translatePath('', 'get_find', 'people');
		test.equal(res.path, '/people/find');
		test.equal(res.method, 'get');
		test.done();
	},

	translateFunctionBodyToParameterArray : function(test) {
		var body = function (req, res, parameter1, parameter2) {};
		var res = expressControllers.translateFunctionBodyToParameterArray(body);
		test.equal(res[0], 'parameter1');
		test.equal(res[1], 'parameter2');
		test.done();
	},
	translateFunctionBodyToParameterArrayDefaultsSupport : function(test) {
        var body = function(){};
        body.toString = function() {
            return 'function (req, res, parameter1, parameter2 = 23) {}';
        };
		var res = expressControllers.translateFunctionBodyToParameterArray(body);
		test.equal(res[0], 'parameter1');
		test.equal(res[1], 'parameter2');
		test.done();
	},

	translateFunctionBodyToParameterArrayArrowSupport : function(test) {
		var body = function(){};
		body.toString = function() {
			return '(req, res, parameter1, parameter2) => {}';
		};
		var res = expressControllers.translateFunctionBodyToParameterArray(body);
		test.equal(res[0], 'parameter1');
		test.equal(res[1], 'parameter2');
		test.done();
	},

	translateFunctionBodyToParameterArrayArrowDefaultsSupport : function(test) {
		var body = function(){};
		body.toString = function() {
			return '(req, res, parameter1, parameter2 = 23) => {}';
		};
		var res = expressControllers.translateFunctionBodyToParameterArray(body);
		test.equal(res[0], 'parameter1');
		test.equal(res[1], 'parameter2');
		test.done();
	},

	//Issue #4
	translateFunctionBodyWithInnerParameters : function(test) {
		var body = function (req, res) { function test(val1, val2, val3) {} };
		var res = expressControllers.translateFunctionBodyToParameterArray(body);
		test.equal(res.length, 0);
		test.done();
	},
	
	translateParameter : function(test) {
		var res = expressControllers.translatePath('', 'get_index', 'people', ['id']);
		test.equal(res.path, '/people/:id');
		test.equal(res.method, 'get');
		test.done();
	},

	translateParameterInMethodName : function(test) {
		var res = expressControllers.translatePath('', 'get_id_friends', 'people', ['id']);
		test.equal(res.path, '/people/:id/friends');
		test.equal(res.method, 'get');
		test.done();
	},

	translateParameterInNestedDirectoryMethodName : function(test) {
		var res = expressControllers.translatePath('/api/v1', 'get_id_friends', 'people', ['id']);
		test.equal(res.path, '/api/v1/people/:id/friends');
		test.equal(res.method, 'get');
		test.done();
	},
}
