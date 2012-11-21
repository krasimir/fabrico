<?php

    require(dirname(__FILE__)."/../src/fabrico.php");

    $F->loadModule("ErrorHandler", "Router", "View", "TestWidget");
    var_dump($F->loaded());



?>