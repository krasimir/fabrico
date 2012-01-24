(function() {
    global.fabrico.modules.presenters.TextTinyMCE = function() {
        
        var isInit = false;
        
        var init = function(settings) {
            if(!isInit) {
                isInit = true;
                tinyMCE.init(settings);
            }
        };
        
        return {
            init: init
        }
        
    }();
})();