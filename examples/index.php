<?php

    require(dirname(__FILE__)."/../src/fabrico.php");

    $F->loadModule("Router");
    var_dump($F->loaded());
    
    // new Router();

?>