operations.output = (function() {
    
    var echo = function(str) {
        str = str + $(".output").html();
        $(".output").html(str);
    };
    var error = function(str) {
        echo('<div class="alert alert-error">' + str + '</div>');
    };
    var info = function(str) {
        echo('<div class="alert alert-info">' + str + '</div>');
    };
    var success = function(str) {
        echo('<div class="alert alert-success">' + str + '</div>');
    };
    var message = function(str) {
        echo('<div class="alert">' + str + '</div>');
    };
    var json = function(json) {
        var json = JSON.parse(json);
        info(new JSONView(json).htmlPreview());
    };
    
    return {
        echo: echo,
        error: error,
        info: info,
        success: success,
        message: message,
        json: json
    }
    
})();