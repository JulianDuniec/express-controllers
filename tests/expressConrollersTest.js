var expressControllers = require('../lib/expressControllers')

module.exports = {

	setDirectoryShouldReturnInstance : function(test) {
		//Given that I have a controller named HomeController with an index-method,
		//express-controllers should generate the path "/"
		var controllersDir = __dirname + '/controllers';
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
		var res = expressControllers.translatePath('get_index', 'home');
		test.equal(res.path, '/');
		test.done();
	},

	translateMethod : function(test) {
		var res = expressControllers.translatePath('post_index', 'home');
		test.equal(res.method, 'post');
		var res = expressControllers.translatePath('get_index', 'home');
		test.equal(res.method, 'get');
		test.done();
	},

	translatePeopleIndex : function(test) {
		var res = expressControllers.translatePath('get_index', 'people');
		test.equal(res.path, '/people');
		test.equal(res.method, 'get');
		test.done();
	},

	translateFunctionBodyToParameterArray : function(test) {
		var body = "function (req, res, parameter1, parameter2) {}";
		var res = expressControllers.translateFunctionBodyToParameterArray(body);
		test.equal(res[0], 'parameter1');
		test.equal(res[1], 'parameter2');
		test.done();
	},

	
	translateParameter : function(test) {
		var res = expressControllers.translatePath('get_index', 'people', ['id']);
		test.equal(res.path, '/people/:id');
		test.equal(res.method, 'get');
		test.done();
	},

	bindingHomeIndex : function(test) {
		var controllersDir = __dirname + '/controllers/bindingHomeIndex/';
		expressControllers
			.setDirectory(controllersDir);
		test.expect(1);
		var app = {
			get : function(path, method) {
				test.equal(path, '/');
			}
		};
		
		expressControllers.bind(app, function() {
			test.done();

		});
	}
}