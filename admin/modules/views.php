<?php

    function views() {
        return json_decode('
            {
                "type": "Views",
                "paths": [
                    "/views/Controller"
                ],
                "forEachView": {
                    "brand": "fabrico!"
                }
            }
        ');
    }

?>