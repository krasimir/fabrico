(function() {
    global.fabrico.modules.presenters.Color = function() {
        
        var dependencyHide = function(fieldName) {
            
        };
        var dependencyShow = function(fieldName) {
            var item = $('[name=' + fieldName + ']');
            $(".color-" + fieldName).val("FFFFFF");
            jscolor.bind();
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();