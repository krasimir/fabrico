<?php

    function views() {
        return json_decode('
            {
                "type": "Views",
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