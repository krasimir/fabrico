(function() {
    global.fabrico.modules.presenters.ComplexData = function() {
        
        var elements = {};
        var elementsSeparator;
        var elementsFieldsSeparator;
        
        var dependencyHide = function(field) {
            
        };
        var dependencyShow = function(field) {
            
        };
        var manage = function(field, initialValue, config) {
            
            elementsSeparator = config.elementsSeparator;
            elementsFieldsSeparator = config.elementsFieldsSeparator;
            
            elements[field] = (function(field, config, initialValue) {
                
                var currentData = [];
                var initialValueString = initialValue;
                var values = [];
                var editing = -1;
                
                var getComplexDataFields = function(config) {
                    var form = '<div>';
                    if(config && config.fields) {
                        var numOfFields = config.fields.length;
                        for(var i=0; i<numOfFields; i++) {
                            var label = config.fields[i].label ? config.fields[i].label : config.fields[i].name;
                            form += '<div class="control-group">';
                            form += '<label class="control-label">' + config.fields[i].label + '</label>';
                            form += '<div class="controls">';
                            form += '<input type="text" id="' + field + '_' + config.fields[i].name + '" class="span4" />';
                            form += '</div>';
                            form += '</div>';
                        }
                    } else {
                        global.debug("getComplexDataFields field=" + field).log("Missing fields!");
                    }
                    form += '</div>';
                    return form;
                };
                var show = function() {
                    var form = $(getComplexDataFields(config));
                    $('#modal' + field + '>.modal-body>.modal-body-holder').empty();
                    $('#modal' + field + '>.modal-body>.modal-body-holder').replaceWith(form);
                    $('#modal' + field).modal();
                };
                var close = function() {
                    $('#modal' + field).modal("hide");
                    editing = -1;
                    if(config && config.fields) {
                        var numOfFields = config.fields.length;
                        for(var i=0; i<numOfFields; i++) {
                            $("#" + field + '_' + config.fields[i].name).val("");
                        }
                    }
                };
                var save = function() {
                    if(config && config.fields) {
                        var numOfFields = config.fields.length;
                        var value = {};
                        for(var i=0; i<numOfFields; i++) {
                            value[config.fields[i].name] = $("#" + field + '_' + config.fields[i].name).val();
                            $("#" + field + '_' + config.fields[i].name).val("");
                        }
                        if(editing >= 0) {
                            var numOfValues = values.length;
                            for(var i=0; i<numOfValues; i++) {
                                if(editing == i) {
                                    values[i] = value;
                                }
                            }
                            editing = -1;
                        } else {
                            values.push(value);
                        }
                    } else {
                        global.debug("getComplexDataFields field=" + field).log("Missing fields!");
                    }
                    close();
                    showValues();
                    updateInput();
                };
                var deleteValue = function(index) {
                    var arr = [];
                    var numOfValues = values.length;
                    for(var i=0; i<numOfValues; i++) {
                        if(i != index) {
                            arr.push(values[i]);
                        }
                    }
                    values = arr;
                    showValues();
                    updateInput();
                };
                var edit = function(index) {
                    var numOfValues = values.length;
                    var element;
                    for(var i=0; i<numOfValues; i++) {
                        if(i == index) {
                            element = values[i];
                        }
                    }
                    show();
                    if(config && config.fields) {
                        var numOfFields = config.fields.length;
                        for(var i=0; i<numOfFields; i++) {
                            $("#" + field + '_' + config.fields[i].name).val(element[config.fields[i].name]);
                        }
                    } else {
                        global.debug("getComplexDataFields field=" + field).log("Missing fields!");
                    }
                    editing = index;
                };
                var valuesToString = function(arr) {
                    var numOfElements = arr.length;
                    var str = '';
                    if(config && config.fields) {
                        var fields = config.fields;
                        var numOfFields = fields.length;
                        for(var i=0; i<numOfElements; i++) {
                            var element = arr[i];
                            var strElement = '';
                            for(var j=0; j<numOfFields; j++) {
                                strElement += element[fields[j].name];
                                if(j < numOfFields-1) {
                                    strElement += elementsFieldsSeparator;
                                }
                            }
                            str += strElement;
                            if(i < numOfElements-1) {
                                str += elementsSeparator;
                            }
                        }
                    }
                    return str;
                };
                var stringToValues = function(str) {
                    if(!str || str == "") {
                        return [];
                    } else {
                        if(config && config.fields) {
                            var fields = config.fields;
                            var numOfFields = fields.length;
                            var arr = [];
                            var elements = str.split(elementsSeparator);
                            var numOfElements = elements.length;
                            for(var i=0; i<numOfElements; i++) {
                                var elementValues = elements[i].split(elementsFieldsSeparator);
                                var element = {};
                                for(var j=0; j<numOfFields; j++) {
                                    element[fields[j].name] = elementValues[j];
                                }
                                arr.push(element);
                            }
                            return arr;
                        } else {
                            global.debug("getComplexDataFields field=" + field).log("Missing fields!");
                            return [];
                        }                        
                    }
                };
                var showValues = function() {
                    var numOfValues = values.length;
                    if(config && config.fields) {
                        var numOfValues = values.length;
                        if(numOfValues > 0) {
                            var table = '<div><table class="table table-bordered">';
                            table += '<thead>';
                            var fields = config.fields;
                            var numOfFields = fields.length;
                            table += '<tr>';
                            for(var i=0; i<numOfFields; i++) {
                                var label = config.fields[i].label ? config.fields[i].label : config.fields[i].name;
                                table += '<th>' + label + '</th>';
                            }
                            table += '<th></th>';
                            table += '</tr>';
                            table += '</thead>';
                            table += '<tbody>';
                            for(var i=0; i<numOfValues; i++) {
                                table += '<tr>';
                                for(var j=0; j<numOfFields; j++) {
                                    table += '<td>' + values[i][fields[j].name] + '</td>';
                                }
                                table += '<td>';
                                table += '<a href="javascript:global.fabrico.modules.presenters.ComplexData.action(\'' + field + '\', \'edit\', ' + i + ');" class="data-icon"><i class="icon-pencil"></i></a>';
                                table += '<a href="javascript:global.fabrico.modules.presenters.ComplexData.action(\'' + field + '\', \'deleteValue\', ' + i + ');" class="data-icon"><i class="icon-remove"></i></a>';
                                table += '</td>';
                                table += '</tr>';
                            }
                            table += '</tbody>';
                            table += '</table></div>';
                            $(".values" + field + ">div").replaceWith($(table));
                        } else {
                            $(".values" + field + ">div").replaceWith($('<div></div>'));
                        }
                    } else {
                        global.debug("getComplexDataFields field=" + field).log("Missing fields!");
                    }
                    
                };
                var updateInput = function() {
                    var inputValue = valuesToString(values);
                    $("#" + field).val(inputValue);
                };
                
                values = stringToValues(initialValueString);
                showValues();
                
                return {
                    show: show,
                    close: close,
                    save: save,
                    deleteValue: deleteValue,
                    edit: edit
                };
                
            })(field, config, initialValue);
            
        };
        var action = function(field, actionType, param) {
            elements[field][actionType](param);
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow,
            manage: manage,
            action: action
        }
        
    }();
})();