<?php

    require("../fabrico/global.php");
    $injector->setRoot(dirname(__FILE__)."/../");
    require("../fabrico/inject.php");
    
    $configs = (object) array(
        "router" => array(
            (object) array(
                "url" => "(.*)?",
                "controller" => "controllers/Custom.php"
            )
        )
    );
    
    $fabrico = new Fabrico($configs);

?>