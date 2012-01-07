(function() {
    global.fabrico.modules.presenters.SelectCheck = function() {
        
        var hidden = false;
        
        var dependencyHide = function(field) {
            var selector = 'input[name^="' + field.name + '_"]';
            var inputs = $(selector);
            if(inputs.length > 0) {
                var numOfInputs = inputs.length;
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    input.checked = false;
                    input.attr("checked", false);
                }
            }
            hidden = true;
        };
        var dependencyShow = function(field) {
            var selector = 'input[name^="' + field.name + '_"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    (function(input) {
                        if(field.defaultValue == input.val() && hidden) {
                            input.checked = true;
                            input.attr('checked', 'checked');
                        }
                    })(input);
                }
            }
            hidden = false;
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();