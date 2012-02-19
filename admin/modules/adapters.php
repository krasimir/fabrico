<?php

    function adapters() {
        return (object) array(
            "type" => "adapters",
            "MySQL" => (object) array(
                "host" => "localhost",
                "user" => "root",
                "pass" => "",
                "dbname" => "fabrico_test"
            )
        );
    };

?>