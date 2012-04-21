<?php

    function router() {
        return json_decode('{
            "type":"Router",
            "routes":[
                {
                    "url":"/testcontroller(.*)?",
                    "controller":
                    {
                        "class":"controllers/Controller.php",
                        "uid":"testcontroller"
                    },
                    "action":"run",
                    "priority":false
                },
                {
                    "url":"(.*)?",
                    "controller":
                    {
                        "class":"controllers/Home.php",
                        "config":null
                    },
                    "action":"run",
                    "priority":false
                }
            ]
        }');
    };

?>