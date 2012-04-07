<?php

    function access() {
        return json_decode('
            {
                "type": "Access",
                "title": "You must be logged in to use the console",
                "users": [
                    {
                        "username": "admin",
                        "password": "admin"
                    }
                ]
            }
        ');
    }

?>