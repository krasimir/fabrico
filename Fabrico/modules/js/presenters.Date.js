(function() {
    global.fabrico.modules.presenters.Date = function() {
        
        var dependencyHide = function(fieldName) {
        };
        var dependencyShow = function(fieldName) {
            if(global.fabrico.modules.presenters.Date["init" + fieldName]) {
                var item = $('[name=' + fieldName + ']');
                global.fabrico.modules.presenters.Date["init" + fieldName]();
                item.val(global.fabrico.modules.presenters.currentDate);                
            }
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();