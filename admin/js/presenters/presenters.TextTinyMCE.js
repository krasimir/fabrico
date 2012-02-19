(function() {
    global.fabrico.modules.presenters.TextTinyMCE = function() {
        
        var init = function(settings, field) {
            settings.editor_selector = "textarea-tinymce-" + field;
            tinyMCE.init(settings);
        };
        
        return {
            init: init
        }
        
    }();
})();