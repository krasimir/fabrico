(function() {
    global.fabrico.modules.presenters.Files = function() {
        
        var input = null;
        var numOfFields = 0;
        var formField = "";
        
        var updateNumOfFields = function() {
            $('input[name*="' + formField + '_numOfFields"]').val(numOfFields);
        };
        var addInput = function(field) {
            global.debug("presenters.Files").log("addInput field=" + field);
            formField = field;
            if(!input) {
                input = $("#filesInputHolder > .filesInputHolderItem").clone();
            }
            var newInput = input.clone();
            newInput.attr("class", formField + "_" + numOfFields + "_row");
            newInput.find("input").attr("name", formField + "_" + numOfFields);
            newInput.find(".remove").css("display", "inline");
            newInput.find(".remove").attr("href", "javascript:global.fabrico.modules.presenters.Files.removeInput('" + formField + "_" + numOfFields + "_row');");
            $("#filesInputHolder").append(newInput);
            numOfFields += 1;
            updateNumOfFields();
        };
        var removeInput = function(field) {
            $("." + field).remove();
        };
        var removeFile = function(field, linkId) {
            global.fabrico.modules.areYouSure.callback(function() {
               $("#" + linkId).parent().css("display", "none");
               var value = $('input[name*="' + field + '_filesToRemove"]').val();
               $('input[name*="' + field + '_filesToRemove"]').val(value + "|" + linkId)
            });
        };
        var dependencyHide = function(field) {
            var numOfFieldsInput = $('[name=' + field.name + '_numOfFields]');
            if(numOfFieldsInput.length > 0) {
                var numOfFields = numOfFieldsInput.val();
                for(var i=0; i<numOfFields; i++) {
                    $("." + field.name + "_" + i + "_row").remove();
                }
            }
        };
        var dependencyShow = function(field) {
            
        };
        
        return {
            addInput: addInput,
            removeInput: removeInput,
            removeFile: removeFile,
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        };
        
    }();
})();