<?php

    // checking for debug mode
    define("DEBUG", isset($_GET["debug"]) && $_GET["debug"] == 1);
    
    // defininf root
    define("ROOT", isset($_SERVER["SCRIPT_FILENAME"]) ? dirname($_SERVER["SCRIPT_FILENAME"]) : NULL);
    
    require(dirname(__FILE__)."/modules/php/utils/Injector.php");
    $injector->setRoot(ROOT);
    
    inject(array(
        "utils/ErrorHandler.php",
        "utils/Request.php",
        "utils/Response.php",
        "utils/Middleware.php",
        "utils/readJSON.php",
        "Fabrico.php"
    ));
    
?>