var expressControllers = require('../lib/expressController')

module.exports = {

	bindingHomeIndex : function(test) {
		var controllersDir = __dirname + '/mock/bindingHomeIndex/';
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
	},
	
	bindingPeopleFind : function(test) {
		var controllersDir = __dirname + '/mock/bindingPeopleFind/';
		expressControllers
			.setDirectory(controllersDir);
		test.expect(1);
		var app = {
			get : function(path, method) {
				test.equal(path, '/people/find');
			}
		};
		
		expressControllers.bind(app, function() {
			test.done();
		});
	},
	
	bindingPeopleFriends : function(test) {
		var controllersDir = __dirname + '/mock/bindingPeopleFriends/';
		expressControllers
			.setDirectory(controllersDir);
		test.expect(1);
		var app = {
			get : function(path, method) {
				test.equal(path, '/people/:id/friends');
			}
		};
		
		expressControllers.bind(app, function() {
			test.done();
		});
	},

	parameterValuePassAlong : function(test) {
		var controllersDir = __dirname + '/mock/parameterValuePassAlong/';
		expressControllers
			.setDirectory(controllersDir);
		test.expect(1);
		var app = {
			get : function(path, method) {
				test.equal(method.toString(), 'function (req, res) {f(req, res, req.params[params[0]]);}');
			}
		};
		
		expressControllers.bind(app, function() {
			test.done();
		});
	},

	ignoreBindingWithoutRequestMethod: function(test) {
		var controllersDir = __dirname + '/mock/ignoreBindingWithoutRequestMethod/';
		expressControllers
			.setDirectory(controllersDir);
		test.expect(1); // There's 1  valid method out of 3 in mock
		var app = {
			get : function(path, method) {
				test.equal(path, '/people');
			}
		};
		
		expressControllers.bind(app, function() {
			test.done();
		});
	},

	ignoreInvalidFiles : function(test) {
		var controllersDir = __dirname + '/mock/ignoreInvalidFiles/';
		expressControllers
			.setDirectory(controllersDir);
		var app = {
			get : function(path, method) {
				test.equal(path, '/valid');
			}
		};
		expressControllers.bind(app, function() {
			test.done();
		})
	}
}