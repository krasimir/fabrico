operations.manage = (function() {
  
    var save = function(formId) {
        var form = $("#" + formId);
        var host = "/";
        if(form.length > 0) {
            var unit = form.find('input[name="unit"]').val();
            var file = form.find('input[name="file"]').val();
            var json = form.find('textarea[name="json"]').val();
            var formId = form.find('input[name="formId"]').val();
            try {
                var obj = JSON.parse(json);
                var request = $.ajax({
                    url: host + "console/update-json?preventCache=" + Math.floor(Math.random()*10000000),
                    type: "POST",
                    data: {
                        unit: unit,
                        file: file,
                        json: json
                    }
                });
                request.done(function(res) {
                    fconsole.requestDone(res);
                    var form = $("#" + formId);
                    form.find('textarea[name="json"]').val(json + "");
                });
                request.fail(function(res) {
                    fconsole.requestFail(res);
                    var form = $("#" + formId);
                    form.find('textarea[name="json"]').val(json + "");
                });
            } catch(err) {
                alert("Broken JSON!");
            }
        } else {
            alert("There is no form with ID = " + formId);
        }
    };
    
    return {
        save: save
    }
    
})();