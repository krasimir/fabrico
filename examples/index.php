<?php

    require(dirname(__FILE__)."/../src/fabrico.php");

    $F->loadModule("View", "Router");
    var_dump($F->loaded());
    
    // new Router();

?>