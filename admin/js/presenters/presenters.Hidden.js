(function() {
    global.fabrico.modules.presenters.Hidden = function() {
        
        var init = function(field) {
            $("#" + field).parent().parent().parent().css("display", "none");
        };
        
        return {
            init: init
        }
        
    }();
})();