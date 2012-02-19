<?php

    function router() {
        return (object) array(
            "type" => "router",
            "routes" => array(
                (object) array(
                    "url" => "/sample(.*)?", 
                    "controller" => "controllers/Page.php", 
                    "model" => "sample", 
                    "action" => "run", 
                    "priority" => false
                ),
                (object) array(
                    "url" => "/types(.*)?", 
                    "controller" => "controllers/Page.php", 
                    "model" => "types", 
                    "action" => "run", 
                    "priority" => false
                ),
                (object) array(
                    "url" => "/logout(.*)?", 
                    "controller" => "controllers/Logout.php",
                    "model" => null,
                    "action" => "run", 
                    "priority" => false
                ),
                (object) array(
                    "url" => "/login(.*)?", 
                    "controller" => "controllers/Login.php",
                    "model" => null,
                    "action" => "run", 
                    "priority" => false
                ),
                (object) array(
                    "url" => "(.*)?", 
                    "controller" => "controllers/Home.php",
                    "model" => null,
                    "action" => "run", 
                    "priority" => false
                )
            )
        );
    }

?>