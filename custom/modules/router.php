<?php

    function router() {
        return (object) array(
            "type" => "router",
            "routes" => array(
                (object) array(
                    "url" => "(.*)?", 
                    "controller" => "controllers/Custom.php",
                    "model" => null,
                    "action" => "run", 
                    "priority" => false
                )
            )
        );
    }

?>