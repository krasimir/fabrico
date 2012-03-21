var debug = function(message) {
    
    var log = function() {
        var numOfArguments = arguments.length;
        for(var i=0; i<numOfArguments; i++) {
            console.log(arguments[i]);
        };
    };
    
    message = "---------------> " + message;
    console.log(message);
    
    return {
        log: log
    }
    
};