<?php

    function adapters() {
        return json_decode('
            {
                "type": "Adapters",
                "MySQL": {
                    "host": "localhost",
                    "user": "root",
                    "pass": "",
                    "dbname": "fabrico_test"
                }
            }
        ');
    };

?>