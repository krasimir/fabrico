(function() {
    global.fabrico.modules.presenters.TextRich = function() {
        
        var defaultTexts = {};
        var settings = {};
        
        var register = function(field, defaultText, settingsParams) {
            defaultTexts[field] = defaultText;
            settings = settingsParams;
            var rand = Math.floor(Math.random()*1000000);
            var swf = new FlashObject(settings.swfURL + "?tmp=" + rand, field + "_swf", "100%", "400", "9", "#FFFFFF");
            swf.addParam("wmode", "opaque");
            swf.addVariable("field", field);
            for(var i in settings) {
                swf.addVariable(i, settings[i]);
            }
            window.onload = function() {
                swf.write(field + "_wysiwygHolder");
            }
        };
        var onTextChange = function(field, text) {
            $('input[name*="' + field + '"]').val(text);
        };
        var getDefaultText = function(field) {
            document.getElementById(field + "_swf").setText(defaultTexts[field]);
        }
        
        return {
            register: register,
            onTextChange: onTextChange,
            getDefaultText: getDefaultText
        }
        
    }();
})();