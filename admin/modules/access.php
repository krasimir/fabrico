<?php

    function access() {
        return (object) array(
            "type" => "access",
            "users" => array(
                (object) array(
                    "username" => "admin",
                    "password" => "admin"
                )
            )
        );
    }

?>