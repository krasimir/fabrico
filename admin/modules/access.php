<?php

    function access() {
        return json_decode('
            {
                "type": "Access",
                "title": "Login",
                "users": [
                    {
                        "username": "admin",
                        "password": "admin",
                        "type": "admin"
                    },
                    {
                        "username": "customer",
                        "password": "customer",
                        "type": "customer"
                    }
                ]
            }
        ');
    }

?>