$(document).ready(function() {
    
    // fixing the tabs 
    var codes = $("pre.code");
    var numOfCodes = codes.length;
    for(var i=0; i<numOfCodes; i++) {
        var code = codes.eq(i);
        var html = code.html();
        html = html.replace(/\\t/gi, "&nbsp;&nbsp;&nbsp;&nbsp;");
        code.html(html);
    }
    
    // running the snippet
    $("pre.code").snippet("php", {style: "dull", collapse: false});
    
});