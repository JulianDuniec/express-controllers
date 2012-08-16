var fs = require('fs');

module.exports = {

	setDirectory : function(directory) {
		this.directory = directory;
		return this;
	},

	bind : function(app, cb) {
		//Save this in local variable, as we loose "this"-context in readdir
		var me = this;

		fs.readdir(me.directory, function(err, list) {
			list.forEach(function(file) {
				var controller = require(me.directory + '/' + file);
				for(var key in controller) {
					//The function in the controller
					var f = controller[key];
					//The parameters in the controller-function
					var params = me.translateFunctionBodyToParameterArray(f.toString());
					//The generated path (method and url)
					var path = me
						.translatePath(key, 
							me.translateFileNameToControllerName(file), 
							params);
					//Binds the route in the app to the method
					me.bindFunction(app, path, params, f);
				}
			});
			if(cb)
				cb();
		});
	},

	bindFunction : function(app, path, params, f) {
		//Switch-of-the-year
		switch(params.length) {
			case 0:
				app[path.method](path.path, f);
				break;
			case 1:
				app[path.method](path.path, function(req, res) {f(req, res, params[0]);});
				break;
			case 2:
				app[path.method](path.path, function(req, res) {f(req, res, params[0], params[1]);});
				break;
			case 3:
				app[path.method](path.path, function(req, res) {f(req, res, params[0], params[1], params[2]);});
				break;
			case 4:
				app[path.method](path.path, function(req, res) {f(req, res, params[0], params[1], params[2], params[3]);});
				break;
			case 5:
				app[path.method](path.path, function(req, res) {f(req, res, params[0], params[1], params[2], params[3], params[4]);});
				break;
			case 6:
				app[path.method](path.path, function(req, res) {f(req, res, params[0], params[1], params[2], params[3], params[4], params[5]);});
				break;
		}
	},

	translateFunctionBodyToParameterArray : function(f) {
		var r = /function[ ]?[(][ ]?[a-zA-Z0-9]*[ ]?,[ ]?[a-zA-Z0-9]*[ ]?,[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*),?[ ]?([a-zA-Z0-9]*)/.exec(f);
		//We don't have a match, hence no parameters.
		if(r == null)
			return [];
		//Removes the first capturing group
		r.splice(0, 1);
		var n = [];
		var s;
		//Push the parameters to the array, as long as they contain anything.
		while((s = r.shift()) != '') {
			n.push(s);
		}
		return n;
	},

	translateFileNameToControllerName : function(fileName) {
		return fileName
			.slice(	0, 
					//Get everything before the last dot
					fileName.lastIndexOf('.'))
			.replace('Controller', '');
	},
	
	translatePath : function(methodName, controllerName, parameters) {
		//Ensure that both strings are lower-case
		controllerName = controllerName.toLowerCase();
		methodName = methodName.toLowerCase();
		parameters = parameters || [];
		
		var parts = methodName.split('_');
		//Extract the method from parts
		var method = parts[0];
		//Remove method from parts
		parts.splice(0, 1);

		var path = '/';
		
		//Append controller-name to path, if different from 'home'
		if(controllerName != 'home')
			path += controllerName;
		
		//Append the rest of the parts
		parts.forEach(function(part) {
			if(part != 'index') {
				var separator = !!~parameters.indexOf(part) ? '/:' : '/';
				path += separator + part;

			}
		});

		parameters.forEach(function(parameter) {
			if(!~parts.indexOf(parameter))
				path += "/:" + parameter;
		});

		return {
			path : path,
			//First part of method-name is POST
			method : method
		}
	}
};