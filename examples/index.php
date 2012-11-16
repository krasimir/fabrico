<?php

    require(dirname(__FILE__)."/../src/fabrico.php");

    $F->loadModule("ErrorHandler", "Router", "View");
    var_dump($F->loaded());

?>