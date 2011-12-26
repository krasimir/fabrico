(function() {
    global.fabrico = function() {
        
        var modules = {};
        modules.workers = {};
        
        var run = function() {
            global.debug("fabrico").log("run");
        };
        
        return {
            modules: modules,
            run: run
        };
        
    }();
})();