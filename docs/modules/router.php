<?php

    function router() {
        return json_decode('
            {
                "type": "Router",
                "routes": [
                    {
                        "url": "(.*)?", 
                        "controller": {"class": "controllers/Documentation.php"}
                    }
                ]
            }
        ');
    }

?>