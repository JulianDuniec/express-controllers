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
				test.equal(method.toString(), 'function (req, res) {\n\t\t\t\t\tvar reqKey = req.method.toLowerCase()+req.route.path;\n\t\t\t\t\tif(!self.pathParams[reqKey]) reqKey = \'get\'+req.route.path;\n\t\t\t\t\tvar clonedParams = self.pathParams[reqKey].slice(0);\n\t\t\t\t\tclonedParams = self.translateKeysArrayToValuesArray(clonedParams, req.params);\n\t\t\t\t\tclonedParams.unshift(req, res);\n\t\t\t\t\tself.pathFunctions[reqKey].apply(self, clonedParams);\n\t\t\t\t}');
			}
		};

		expressControllers.bind(app, function() {
			test.done();
		});
	},

	middlewareFunctions: function(test) {
		var controllersDir = __dirname + '/mock/middlewareFunctions/';

		expressControllers
						.setDirectory(controllersDir);
				test.expect(1);
				var app = {
						get : function(path, method) {
								test.equal(method.toString(), 'function (req, res, next){}');
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
	},

	controllerAlias : function(test) {
		var controllersDir = __dirname + '/mock/controllerAlias/';
		expressControllers
			.setDirectory(controllersDir);
		test.expect(3); // There's 1  valid method out of 3 in mock
		var urls = [];
		var app = {
			get : function(path, method) {
				urls.push(path);
				if(urls.length == 3) {
					test.equal(urls[2], '/alias');
					test.equal(urls[1], '/alias2');
					test.equal(urls[0], '/test');
				}
			}
		};

		expressControllers.bind(app, function() {
			test.done();
		});
	},

    es2015Support : function(test) {
        var controllersDir = __dirname + '/mock/es2015Support/';
        expressControllers
            .setDirectory(controllersDir);
        test.expect(3);
        var urls = [];
        var app = {
            get : function(path, method) {
                urls.push(path);
                if(urls.length == 3) {
                    test.equal(urls[2], '/es2015/a');
                    test.equal(urls[1], '/es2015/b');
                    test.equal(urls[0], '/es2015/c');
                }
            }
        };

        expressControllers.bind(app, function() {
            test.done();
        });
    },
}
