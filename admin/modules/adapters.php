<?php

    function adapters() {
        return json_decode('
            {
                "type": "adapters",
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