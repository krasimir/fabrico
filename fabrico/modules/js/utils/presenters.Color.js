(function() {
    global.fabrico.modules.presenters.Color = function() {
        
        var dependencyHide = function(field) {
            
        };
        var dependencyShow = function(field) {
            var item = $('[name=' + field.name + ']');
            $(".color-" + field.name).val("FFFFFF");
            jscolor.bind();
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();