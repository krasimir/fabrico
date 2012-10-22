<?php

    require(dirname(__FILE__)."/../src/fabrico.php");
    F::load(array("Router", "aaa.php"));

    var_dump("Injected: ", F::getInjected());die();

?>