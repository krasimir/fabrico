<?php

    // checking for debug mode
    define("DEBUG", isset($_GET["debug"]) && $_GET["debug"] == 1);
    
    // defininf root
    define("ROOT", dirname(__FILE__));
    define("ROOT_APP", dirname($_SERVER["SCRIPT_FILENAME"]));
    
    require(ROOT."/library/utils/Injector.php");
    
    $injector->path(array(
        ROOT."/library",
        ROOT_APP."/controllers"
    ));
    
    inject(array(
        "utils/ErrorHandler.php",
        "utils/Request.php",
        "utils/Response.php",
        "utils/Middleware.php",
        "Fabrico.php"
    ));
    
?>