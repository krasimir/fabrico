var fconsole = (function() {
    
    var commandIndex = 0;
    var commands = [];
    var host = "/";
    var welcomeText = "Welcome to Fabrico's console. Type <b>help</b> to see the available commands.";
    
    var sendCommand = function(command) {
        
        var commandObj = {
            command: command,
            rawResponse: null
        };
        commands.push(commandObj);
        commandIndex = commands.length-1;
        
        if(command === "clear") {
            $(".output").html("");
            operations.output.message(welcomeText);
        } else if(command != "") {
            var request = $.ajax({
                url: host + "/console/command?preventCache=" + Math.floor(Math.random()*10000000),
                type: "POST",
                data: {
                    command: command
                }
            });
            request.done(function(res) {
                commandObj.rawResponse = JSON.stringify(res);
                debug("back-end response").log(res);
                if(typeof res.queue !== "undefined") {
                    var numOfItems = res.queue.length;
                    for(var i=0; i<numOfItems; i++) {
                        var operationsParts = res.queue[i].operation.split(".");
                        if(typeof operations[operationsParts[0]] !== "undefined") {
                            operations[operationsParts[0]][operationsParts[1]](res.queue[i].params);
                        } else {
                            operations.output.error("Missing operation <b>" + res.queue[i].operation + "</b>.");
                        }
                    }
                } else {
                    operations.output.error("Wrong back-end response (missing queue)!");
                }
            });
            request.fail(function(res) {
                commandObj.rawResponse = JSON.stringify(res.responseText);
                operations.output.error(res.responseText);
            });
            operations.output.echo('<div class="alert"><i class="icon-share-alt"></i>&nbsp;&nbsp;' + command + '</div>');
        }
    };
    
    var init = function(hostURL) {
        host = hostURL;        
        $("#input-field").keydown(function(event) {
            if(event.which == 38) {
                if(commands[commandIndex]) {
                    $("#input-field").val(commands[commandIndex].command);
                    if(commandIndex > 0) {
                        commandIndex -= 1;
                    }
                }
            }
            if(event.which == 40) {
                if(commands[commandIndex]) {
                    $("#input-field").val(commands[commandIndex].command);
                    if(commandIndex < commands.length-1) {
                        commandIndex += 1;
                    }
                }
            }
            if(event.which == 13) {
                event.preventDefault();
                sendCommand($("#input-field").val());
                $("#input-field").val("");
            }
        });
        $("#input-field").focus();        
        operations.output.message(welcomeText);
    };
    
    return {
        init: init
    }
    
})();