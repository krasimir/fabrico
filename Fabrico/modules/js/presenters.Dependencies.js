(function() {
    global.fabrico.modules.presenters.Dependencies = function() {
        
        var fields = [];
        
        var onPresenterChange = function(fieldName, newValue) {
            global.debug("Dependencies.onPresenterChange").log("'" + fieldName + "' changed to '" + newValue + "'");
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                if(field.dependencies) {
                    var numOfDependencies = field.dependencies.length;
                    for(var j=0; j<numOfDependencies; j++) {
                        if(field.dependencies[j].field == fieldName) {
                            if(!field.dependencies[j].shouldMatch) {
                                global.debug("Dependencies.onPresenterChange").log(field.name + " should have 'shouldMatch' property in its dependencies.");
                            } else {
                                var regexp = new RegExp(field.dependencies[j].shouldMatch);
                                var pass = regexp.test(newValue);
                                global.debug("Dependencies.check " + fieldName).log(field.dependencies[j].shouldMatch + "=" + newValue + " pass=" + pass);
                            }
                        }
                    }
                }
            }
            
        };
        var config = function(allFields) {
            global.debug("Dependencies fields=").log(allFields);
            fields = allFields;
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                var fieldName = field.name;
                var item = $('[name=' + fieldName + ']');
                if(item.length > 0) {
                    (function(item, fieldName) {
                        item.change(function() {
                            onPresenterChange(fieldName, item.val());
                        });
                    })(item, fieldName);
                }
            }
        };
        
        return {
            config: config
        };
        
    }();
})();