var JSONViewsHolder = (function() {
    
    var click = function(viewID, divID) {
        var view = JSONViewsHolder[viewID] ? JSONViewsHolder[viewID] : null;
        if(view) {
            var div = $("#" + divID);
            if(div.length > 0) {
                if(view[divID]) {
                    div.find("div").show();
                    div.children().find("div").show();
                    div.children().children().find("div").show();
                    view[divID] = false;
                } else {
                    div.find("div").hide();
                    div.children().find("div").hide();
                    div.children().children().find("div").hide();
                    view[divID] = true;
                }
            }
        }
    };
    
    return {
        click: click
    }
    
})();
var JSONView = function(json) {
    
    var viewID = "jsonview_" + Math.floor(Math.random()*100000000);
    var divIterator = 0;
    var json = json;
    var indentStep = 20;
    
    var htmlPreview = function() {
        var html = htmlParse(json, 0);
        return html;
    };
    var htmlParse = function(o, indent, propName) {
        debug("htmlParse " + (typeof o) + "/" + indent);
        propName = propName ? propName : "";
        switch(typeof o) {
            case "object":
                if(isArray(o)) {
                    return htmlDisplayArray(o, indent, propName);
                } else {
                    return htmlDisplayObject(o, indent, propName);
                }
            break;
            case "string":
                return htmlDisplayString(o, indent, propName);
            break;
            case "number":
                return htmlDisplayNumber(o, indent, propName);
            break;
            case "boolean":
                return htmlDisplayBoolean(o, indent, propName);
            break;
            default:
                return htmlDisplayDefault(o, indent, propName);
            break;
        }
    };
    var htmlDisplayObject = function(o, indent, propName) {
        debug("htmlDisplayObject");
        var divID = "json-view-div-" + (++divIterator);
        var html = '';
        html += divStart(indent, "object", divID);
        html += (propName != "" ? '<span style="color:#000">' + propName + ":</span> " : "") + '<a href="javascript:JSONViewsHolder.click(\'' + viewID + '\', \'' + divID + '\');" title="object" style=""><span class="label">object</span></a> {<br />';
        for(var i in o) {
            html += divStart(indent + indentStep);
            html += htmlParse(o[i], indent, i);
            html += divEnd();
        }
        html += "}" + divEnd();
        return html;
    };
    var htmlDisplayArray = function(o, indent, propName) {
        debug("htmlDisplayArray");
        var divID = "json-view-div-" + (++divIterator);
        var html = '';
        html += divStart(indent, "array", divID);
        html += (propName != "" ? '<span style="color:#000">' + propName + ":</span> " : "") + '<a href="javascript:JSONViewsHolder.click(\'' + viewID + '\', \'' + divID + '\');" title="object" style=""><span class="label label-success">array</span></a> [<br />';
        for(var i in o) {
            html += divStart(indent + indentStep);
            html += htmlParse(o[i], indent);
            html += divEnd();
        }
        html += "]" + divEnd();
        return html;
    };
    var htmlDisplayString = function(o, indent, propName) {
        debug("htmlDisplayString");
        return (propName != "" ? '<span style="color:#000">' + propName + ":</span> " : "") + '<span style="color:#0083C1">"' + o + '"</span>';
    };
    var htmlDisplayNumber = function(o, indent, propName) {
        debug("htmlDisplayNumber");
        return (propName != "" ? '<span style="color:#000">' + propName + ":</span> " : "") + '<span style="color:#0083C1">' + o + '</span>';
    };
    var htmlDisplayBoolean = function(o, indent, propName) {
        debug("htmlDisplayBoolean");
        return (propName != "" ? '<span style="color:#000">' + propName + ":</span> " : "") + '<span style="color:#0083C1">' + (o ? "true" : "false") + '</span>';
    };
    var htmlDisplayDefault = function(o, indent, propName) {
        debug("htmlDisplayDefault");
        return (propName != "" ? '<span style="color:#000">' + propName + ":</span> " : "") + '<span style="color:#0083C1">' + o + '</span>';
    };
    
    // utils    
    var isArray = function(obj) {
        return typeof obj === "object" && obj instanceof Array;
    };
    var divStart = function(indent, useStyle, divID) {
        divID = divID ? divID : "";
        if(useStyle) {
            var style = '';
            switch(useStyle) {
                case 'object':
                   style += 'padding: 2px 2px 2px ' + indent + 'px; background: #FFF;';
                break;
                case 'array':
                   style += 'padding: 2px 2px 2px ' + indent + 'px; background: #FFF;';
                break;
            }
            return '<div style="' + style + '" id="' + divID + '">';
        } else {
            return '<div style="padding: 2px 0 0 ' + indent + 'px; background: #FFF;" id="' + divID + '">';
        }        
    };
    var divEnd = function() {
        return '</div>';
    };
    var debug = function(str) {
        console.log(str);
    };
    var getIndent = function(num) {
        var indent = '';
        for(var i=0; i<num; i++) {
            indent += '&nbsp;';
        }
        return indent;
    };
    
    JSONViewsHolder[viewID] = this;
    
    return {
        htmlPreview: htmlPreview
    };
    
};