(function() {
    global.fabrico.modules.presenters = function() {
        
        var get = function(presenterPath) {
            var presenterNameParts = presenterPath.split("/");
            var presenter = global.fabrico.modules.presenters[presenterNameParts[presenterNameParts.length-1].replace(".php", "")];
            if(presenter) {
                return presenter;
            } else {
                return null;
            }
        };
        
        return {
            get: get
        }
        
    }();
})();