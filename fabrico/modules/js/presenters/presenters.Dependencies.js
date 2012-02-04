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
        var setHiddenFieldValue = function(fieldName, value) {
            var hidden = $('[name=' + fieldName + '_hidden]');
            if(hidden.length == 0) {
                var form = $('form');
                hidden = $('<input type="hidden" name="' + fieldName + '_hidden" value="' + value + '" />');
                form.append(hidden);
            } else {
                hidden.val(value);
            }
        };
        var evaluate = function(dependency) {
            var result = null;
            if($.isArray(dependency)) {
                var numOfDependencies = dependency.length;
                for(var i=0; i<numOfDependencies; i++) {
                    var res = evaluate(dependency[i]);
                    var isArray = $.isArray(dependency[i]);
                    if(result === null) {
                        result = res;
                    } else {
                        result = isArray ? result || res : result && res;
                    }
                }
            } else {
                var item = $('[name=' + dependency.field + ']');
                var regexp = new RegExp(dependency.shouldMatch, "gi");
                var value = item.val();
                if(item.attr("type") == "radio") {
                    value = $('input:radio[name=' + dependency.field + ']:checked').val();
                }
                result = regexp.test(value);
            }
            return result;
        };
        var onPresenterChange = function() {
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                if(field.dependencies) {
                    var passDependencies = evaluate(field.dependencies);
                    var presenter = global.fabrico.modules.presenters.get(field.presenter);
                    if(passDependencies) {
                        $("#" + field.name + "-row").css("display", "block");
                        if(presenter && presenter.dependencyShow) {
                            presenter.dependencyShow(field);
                        }
                        setHiddenFieldValue(field.name, "no");
                    } else {
                        $("#" + field.name + "-row").css("display", "none");
                        if(presenter && presenter.dependencyHide) {
                            presenter.dependencyHide(field);
                        } else {
                            dependencyHide(field.name);
                        }
                        setHiddenFieldValue(field.name, "yes");
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