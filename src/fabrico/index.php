<?php

    // defining global variables
    $FABRICO_ROOT = dirname(__FILE__)."/";
    $APP_ROOT = getcwd()."/";

    // running the package manager
    if(php_sapi_name() === "cli") {
        require($FABRICO_ROOT."fpm.php");
        $manager = new FabricoPackageManager();
    }

 
?>