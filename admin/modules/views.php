<?php

    function views() {
        return json_decode('
            {
                "type": "views",
                "paths": [
                    "/views/Default"
                ],
                "forEachView": {
                    "brand": "fabrico!"
                }
            }
        ');
    }

?>