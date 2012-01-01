(function() {
    global.fabrico.modules.presenters.SelectCheck = function() {
        
        var dependencyHide = function(fieldName) {
            var selector = 'input[name^="' + fieldName + '_"]';
            var inputs = $(selector);
            if(inputs.length > 0) {
                var numOfInputs = inputs.length;
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    input.attr("checked", false);
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