<?php

    function consoleRouter() {
        return json_decode('
            {
                "type": "Router",
                "routes": [
                    {
                        "url": "/command(.*)?", 
                        "controller": "controllers/Console.php",
                        "model": null,
                        "action": "command", 
                        "priority": false
                    },
                    {
                        "url": "/update-json(.*)?", 
                        "controller": "controllers/Console.php",
                        "model": null,
                        "action": "updateJSON", 
                        "priority": false
                    },
                    {
                        "url": "/test-command(.*)?", 
                        "controller": "controllers/Console.php",
                        "model": null,
                        "action": "testCommand", 
                        "priority": false
                    },
                    {
                        "url": "(.*)?", 
                        "controller": "controllers/Console.php",
                        "model": null,
                        "action": "run", 
                        "priority": false
                    }
                ]
            }
        ');
    }

?>