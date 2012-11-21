<?php

    require(dirname(__FILE__)."/../../src/fabrico.php");

    $F->loadModule("ErrorHandler", "Router", "View", "TestWidget");
    
    /******************************************************/

    class Controller {
        public function __construct($params) {
            var_dump($params);die();
        }
    }

    $router = new Router();
    $router
    ->register("/users", "Controller")
    ->register("", "Controller")
    ->run();


?>