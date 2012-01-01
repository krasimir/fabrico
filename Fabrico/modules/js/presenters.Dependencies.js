(function() {
    global.fabrico.modules.presenters.Dependencies = function() {
        
        var fields = [];
        
        var dependencyHide = function(fieldName) {
            var item = $('[name=' + fieldName + ']');
            var clone = item.clone(false, false);
            clone.val("");
            item.replaceWith(clone);
            setItemEvents(clone);
        };
        var onPresenterChange = function() {
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                if(field.dependencies) {
                    var numOfDependencies = field.dependencies.length;
                    var passDependencies = true;
                    for(var j=0; j<numOfDependencies; j++) {
                        var item = $('[name=' + field.dependencies[j].field + ']');
                        var regexp = new RegExp(field.dependencies[j].shouldMatch, "gi");
                        var pass = regexp.test(item.val());
                        if(!pass) {
                            passDependencies = false; 
                        }
                    }
                    var presenter = global.fabrico.modules.presenters.get(field.presenter);
                    if(passDependencies) {
                        $("#" + field.name + "-row").css("display", "table-row");
                        if(presenter && presenter.dependencyShow) {
                            presenter.dependencyShow(field.name);
                        }
                    } else {
                        $("#" + field.name + "-row").css("display", "none");
                        if(presenter && presenter.dependencyShow) {
                            presenter.dependencyHide(field.name);
                        } else {
                            dependencyHide(field.name);
                        }
                    }
                }
            }
            return;
        };
        var setItemEvents = function(item) {
            item.change(function() {
                onPresenterChange();
            });
        };
        var config = function(allFields) {
            // global.debug("Dependencies fields=").log(allFields);
            fields = allFields;
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                var fieldName = field.name;
                var item = $('[name=' + fieldName + ']');
                if(item.length > 0) {
                    (function(item, fieldName) {
                        setItemEvents(item);
                        onPresenterChange();
                    })(item, fieldName);
                }
            }
        };
        
        return {
            config: config
        };
        
    }();
})();