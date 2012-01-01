(function() {
    global.fabrico.modules.presenters.SelectRadio = function() {
        
        var dependencyHide = function(fieldName) {
            var selector = 'input[name="' + fieldName + '"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    input.checked = false;
                    input.removeAttr('checked');
                }
            }
        };
        var dependencyShow = function(fieldName) {
            
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();