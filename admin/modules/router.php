<?php

    function router() {
        return json_decode('{
            "type":"Router",
            "routes":[
                {
                    "url":"(.*)?",
                    "controller":"controllers/Home.php",
                    "model":null,
                    "action":"run",
                    "priority":false
                }
            ]
        }');
    };

?>