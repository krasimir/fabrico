(function() {
    global.fabrico.modules.presenters.Date = function() {
        
        var dependencyHide = function(field) {
        };
        var dependencyShow = function(field) {
            if(global.fabrico.modules.presenters.Date["init" + field.name]) {
                var item = $('[name=' + field.name + ']');
                global.fabrico.modules.presenters.Date["init" + field.name]();
                item.val(global.fabrico.modules.presenters.currentDate);                
            }
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();