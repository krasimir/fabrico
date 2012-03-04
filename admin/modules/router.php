<?php

    function router() {
        return json_decode('
            {
                "type": "router",
                "routes": [
                    {
                        "url": "/sample(.*)?", 
                        "controller": "controllers/Page.php", 
                        "model": "sample", 
                        "action": "run", 
                        "priority": false
                    },
                    {
                        "url": "/types(.*)?", 
                        "controller": "controllers/Page.php", 
                        "model": "types", 
                        "action": "run", 
                        "priority": false
                    },
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