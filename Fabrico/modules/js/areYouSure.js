(function() {
    global.fabrico.modules.areYouSure = function() {
        
        var question = "Are you sure!";
        
        var forward = function(url) {
            if(confirm(question)) {
                window.location.href = url;
            }
        };
        var callback = function(callback) {
            if(confirm(question)) {
                callback();
            }
        };
        
        return {
            forward: forward,
            callback: callback
        };
        
    }();
})();