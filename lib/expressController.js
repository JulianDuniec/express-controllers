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
				var fileName = me.directory + '/' + file;
				if(fileName.indexOf('Controller') == -1)
					return;
				var controller = require(fileName);
				var aliases = controller['aliases'] || [];
				delete controller['aliases'];
				aliases.push(me.translateFileNameToControllerName(file));
				for(var key in controller) {
					//The function in the controller
					var f = controller[key];
					
					//Array of route middleware support
					if(Array.isArray(f)) {
						if(f.length == 1) {
							f = f[0];
						}
						else if(f.length > 1) {
							var controllerFunction = f.pop();
							me.middlewareFunctions = f;
							f = controllerFunction;
						}
						else {
							throw new Error('No controller function defined');	
						}
					}
					
					//The parameters in the controller-function
					var params = me.translateFunctionBodyToParameterArray(f);
				
					aliases.forEach(function(alias) {
							//The generated path (method and url)
						var path = me.translatePath(key, alias, params);
						//Does this function translate to a valid path for routing?
						if(path !== false) 
							//Binds the route in the app to the method
							me.bindFunction(app, path, params, f);
					});
				}
				if(cb)
					cb();
			});
			
		});
	},

	bindFunction : function(app, path, params, f) {
		
		var self = this;
		
		if(self.middlewareFunctions && Array.isArray(self.middlewareFunctions)) {
			app[path.method](path.path, self.middlewareFunctions, function(req, res) {
				params.unshift(req, res);
				f.apply(self, params);
			});
		}
		else {
			app[path.method](path.path, function(req, res) {
				params.unshift(req, res);
				f.apply(self, params);
			});	
		}
		
	},

	translateFunctionBodyToParameterArray : function(f) {
		
		if (typeof f == 'function') {
			var params = f.toString()
			  .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
			  .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
			  .split(/,/)
			
			if(params.length >= 2) {
				params.splice(0,2);
				return params;
			}
			else {
				throw new Error('Defined controller function has too few parameters');
			}
		}
		else {
			throw new Error('Defined controller object is not a function');
		}
		
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
		parameters = parameters || [];
		
		var parts = methodName.split('_');
		
		//Extract the method from parts
		var method = parts[0].toLowerCase();
		
		// Return false if this request method is not valid
		// or if the action name is missing
		if(['get', 'post', 'put', 'delete'].indexOf(method) == -1) return false;
		if(parts.length < 1) return false;

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
				if(separator == '/'){
		                    //Replaces the camelCased section with a hyphenated lowercase string
		                    part = part.replace(/([A-Z])/g, '-$1').toLowerCase();
		                }
				path += separator + part;

			}
		});

		parameters.forEach(function(parameter) {
			if(!~parts.indexOf(parameter))
				path += "/:" + parameter;
		});

		return {
			path : path,
			method : method
		}
	}
};
