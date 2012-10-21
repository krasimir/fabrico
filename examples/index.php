<?php

    $APP_ROOT = dirname(__FILE__);
    require(dirname(__FILE__)."/../src/fabrico.php");

    F::dumpFiles();

    F::load(array("View", "Router"));

    F::dumpInjected();

?>