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
					var f = controller[key];
					var path = me
						.translatePath(key, 
							me.translateFileNameToControllerName(file), 
							me.translateFunctionBodyToParameterArray(f.toString()));
					console.log();
					app[path.method](path.path, f);
				}
			});
			cb();
		});
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
		
		var parts = methodName.split('_');

		var path = '/';
		
		//Append controller-name to path, if different from 'home'
		if(controllerName != 'home')
			path += controllerName;
		parameters = parameters || [];
		for (var i = 0; i < parameters.length; i++) {
			path += "/:" + parameters[i]
		};

		return {
			path : path,
			//First part of method-name is POST
			method : parts[0]
		}
	}
};