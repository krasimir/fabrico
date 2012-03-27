<?php

    function router() {
        return (object) array(
            "type" => "Router",
            "routes" => array(
                (object) array(
                    "url" => "(.*)?",
                    "controller" => "controllers/Documentation.php"
                )
            )
        );
    }

?>