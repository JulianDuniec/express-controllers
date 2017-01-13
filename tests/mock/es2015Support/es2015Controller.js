var controller = {
	get_a : function(req, res) {
		
	},
	get_b : function(req, res) {

	},
	get_c : function(req, res) {

	}
};

controller.get_a.toString = function() {
	return 'function(req, res = 2) {}';
};
controller.get_b.toString = function() {
	return '(req, res) => {}';
};
controller.get_c.toString = function() {
	return '(req, res = 2) => {}';
};

module.exports = controller;
