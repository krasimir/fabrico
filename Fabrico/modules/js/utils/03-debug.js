(function() {
	
	var log = function() {
		var numOfArguments = arguments.length;
		for(var i=0; i<numOfArguments; i++) {
			console.log(arguments[i]);
		};
	};
	
	global.debug = function(message) {
		message = "---------------> " + message;
		console.log(message);
		this.log = log;
		return this;
	};
	
})();