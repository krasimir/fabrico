<?php

    function router() {
        return json_decode('
            {
                "type": "Router",
                "routes": [
                    {
                        "url": "/logout(.*)?", 
                        "controller": "controllers/Logout.php",
                        "model": null,
                        "action": "run", 
                        "priority": false
                    },
                    {
                        "url": "/login(.*)?", 
                        "controller": "controllers/Login.php",
                        "model": null,
                        "action": "run", 
                        "priority": false
                    },
                    {
                        "url": "(.*)?", 
                        "controller": "controllers/Home.php",
                        "model": null,
                        "action": "run", 
                        "priority": false
                    }
                ]
            }
        ');
    }

?>