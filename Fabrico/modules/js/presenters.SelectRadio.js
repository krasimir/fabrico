(function() {
    global.fabrico.modules.presenters.SelectRadio = function() {
        
        var dependencyHide = function(field) {
            var selector = 'input[name="' + field.name + '"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    input.checked = false;
                    input.removeAttr('checked');
                }
            }
            field.hidden = true;
        };
        var dependencyShow = function(field) {
            var selector = 'input[name="' + field.name + '"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    (function(input) {
                        if(field.defaultValue == input.val() && field.hidden) {
                            input.checked = true;
                            input.attr('checked', 'checked');
                        }
                    })(input);
                }
            }
            field.hidden = false;
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();