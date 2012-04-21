<?php

    function consoleRouter() {
        return json_decode('{
            "type":"Router",
            "routes":[
                {
                    "url":"/command(.*)?",
                    "controller":
                    {
                        "class":"controllers/Console.php"
                    },
                    "action":"command",
                    "priority":false
                },
                {
                    "url":"/update-json(.*)?",
                    "controller":
                    {
                        "class":"controllers/Console.php"
                    },
                    "action":"updateJSON",
                    "priority":false
                },
                {
                    "url":"/test-command(.*)?",
                    "controller":
                    {
                        "class":"controllers/Console.php"
                    },
                    "action":"testCommand",
                    "priority":false
                },
                {
                    "url":"(.*)?",
                    "controller":
                    {
                        "class":"controllers/Console.php"
                    },
                    "action":"run",
                    "priority":false
                }
            ]
        }');
    };

?>