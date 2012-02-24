<?php

    function access() {
        return json_decode('
            {
                "type": "access",
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