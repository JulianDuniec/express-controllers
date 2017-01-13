var file = require('file');
var path = require('path');
var getParams = require('get-parameter-names');

module.exports = {

	setDirectory : function(directory) {
		this.directory = path.resolve(directory);
		this.pathParams = {};
		this.pathFunctions = {};
		this.pathMiddlewares = {};

		return this;
	},

	bind : function(app, cb) {
		//Save this in local variable, as we loose "this"-context in readdir
		var self = this;
		var errors = [];

		file.walk(self.directory, function(err, dirPath, dirs, list) {
			if(err) {
				errors.push(err);
				return;
			}

			list.forEach(function(file) {
				file = file.replace(dirPath + '/', '');
				// Check for windows directory
				file = file.replace(dirPath + '\\', '');

				var fileName = dirPath + '/' + file;
				
				if(file.indexOf('Controller') == -1 || !self.isFileModule(file)) return;

				var controller = require(fileName);
				var aliases = controller['aliases'] || [];
				delete controller['aliases'];
				aliases.push(self.translateFileNameToControllerName(file));

				var paths = [];
				for(var key in controller) {
					//The function in the controller
					var f = controller[key];
					var middlewareFunctions = undefined;

					//Array of route middleware support
					if(Array.isArray(f)) {
						if(f.length == 1) {
							f = f[0];
						}
						else if(f.length > 1) {
							var controllerFunction = f.pop();
							middlewareFunctions = f;
							f = controllerFunction;
						}
						else throw new Error('No controller function defined');
					}

					//The parameters in the controller-function
					var params = self.translateFunctionBodyToParameterArray(f);

					aliases.forEach(function(alias) {
						//The generated path (method and url)
						var path = self.translatePath(dirPath, key, alias, params);
						//Does this function translate to a valid path for routing?
						if(path !== false) {
							self.pathMiddlewares[path.method.toLowerCase()+path.path] = middlewareFunctions;
							var pathObj = {path: path, params: params, f: f};
							paths.push(pathObj);
						}
					});
				}

				paths.sort(function(a, b){
					return b.path.path.localeCompare(a.path.path);
				});

				paths.forEach(function(pathObj){
					//Binds the route in the app to the method
					self.bindFunction(app, pathObj.path, pathObj.params, pathObj.f);
				})
			});

			if(cb && dirs.length === 0) {
				if (errors.length > 0) {
					cb(errors[0]);
					return;
				}

				cb();
			}
		});
	},

	bindFunction : function(app, path, params, f) {
		var self = this;
		var pathKey = path.method.toLowerCase()+path.path;
		self.pathParams[pathKey] = params;
		self.pathFunctions[pathKey] = f;

		if(self.pathMiddlewares[pathKey] && Array.isArray(self.pathMiddlewares[pathKey])) {
			app[path.method.toLowerCase()](
				path.path,
				self.pathMiddlewares[pathKey],
				function(req, res) {
					var reqKey = req.method.toLowerCase()+req.route.path;
					if(!self.pathParams[reqKey]) reqKey = 'get'+req.route.path;
					var clonedParams = self.pathParams[reqKey].slice(0);
					clonedParams = self.translateKeysArrayToValuesArray(clonedParams, req.params);
					clonedParams.unshift(req, res);
					self.pathFunctions[reqKey].apply(self, clonedParams);
				}
			);
		}
		else {
			app[path.method.toLowerCase()](
				path.path,
				function(req, res) {
					var reqKey = req.method.toLowerCase()+req.route.path;
					if(!self.pathParams[reqKey]) reqKey = 'get'+req.route.path;
					var clonedParams = self.pathParams[reqKey].slice(0);
					clonedParams = self.translateKeysArrayToValuesArray(clonedParams, req.params);
					clonedParams.unshift(req, res);
					self.pathFunctions[reqKey].apply(self, clonedParams);
				}
			);
		}
	},

	translateKeysArrayToValuesArray : function(keysArray, keyValueObject) {
		var valuesArray = [];
		for(var i=0;i<keysArray.length;i++) {
			valuesArray.push(keyValueObject[keysArray[i]]);
		}

		return valuesArray;
	},

	translateFunctionBodyToParameterArray : function(f) {
		if (typeof f != 'function') {
			throw new Error('Defined controller object is not a function');
		}
		var params = getParams(f);
		if (params.length < 2) {
			throw new Error('Defined controller function has too few parameters');
		}
		params.splice(0, 2);
		return params;
	},

	translateFileNameToControllerName : function(fileName) {
		return fileName
			.slice(0,
				//Get everything before the last dot
				fileName.lastIndexOf('.'))
			.replace('Controller', '');
	},

	translatePath : function(dirPath, methodName, controllerName, parameters) {
		//Ensure that both strings are lower-case
		controllerName = controllerName.toLowerCase();
		parameters = parameters || [];
		var parts = methodName.split('_');
		//Extract the method from parts
		var method = parts[0].toLowerCase();

		// Return false if this request method is not valid
		// or if the action name is missing
		if(['get', 'post', 'put', 'delete', 'patch'].indexOf(method) == -1) return false;
		if(parts.length < 1) return false;

		//Remove method from parts
		parts.splice(0, 1);
		var path = dirPath.replace(this.directory, '') + '/';

		//Append controller-name to path, if different from 'home'
		if(controllerName != 'home') {
			path += controllerName;
		}

		//Append the rest of the parts
		parts.forEach(function(part) {
			if(part != 'index') {
				var separator = !!~parameters.indexOf(part) ? '/:' : '/';
				if(separator == '/') {
					//Replaces the camelCased section with a hyphenated lowercase string
					part = part.replace(/([A-Z])/g, '-$1').toLowerCase();
				}
				path += separator + part;
			}
		});

		parameters.forEach(function(parameter) {
			if(!~parts.indexOf(parameter)) {
				path += "/:" + parameter;
			}
		});

		return {
			path : path,
			method : method
		};
	},

	isFileModule: function(file) {
		var ext = path.extname(file);

		if (path.basename(file, ext)[0] === '.') {
			return false;
		}

		if (ext !== '' && !this.isValidExtension(ext)) {
			return false;
		}

		return true;
	},

	isValidExtension: function(ext) {
		var keys = Object.keys(require.extensions);
		return keys.indexOf(ext) !== -1;
	}
};
