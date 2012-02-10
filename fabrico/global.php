<?php

    // checking for debug mode
    define("DEBUG", isset($_GET["debug"]) && $_GET["debug"] == 1);
    
    // defininf root
    define("ROOT", dirname(__FILE__));
    
    require(dirname(__FILE__)."/modules/php/utils/Injector.php");
    $injector->setRoot(ROOT);
    
?>