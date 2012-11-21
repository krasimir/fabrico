<?php

    require(__DIR__."/../../src/fabrico.php");

    $F->loadModule("ErrorHandler", "Router", "View", "TestWidget");
    
    /******************************************************/

    View::$root = __DIR__;

    class ControllerHome {
        public function __construct($params) {
            die(view("/tpl/home.html", array(
                "titleOfThePage" => "Fabrico test",
                "title" => "Fabrico",
                "content" => "It works!"
            )));
        }
    }

    class ControllerUsers {
        public function __construct($params) {
            $userId = isset($params["id"]) ? $params["id"] : "none (please add something after /users/)";
            die(view("/tpl/users.html", array(
                "titleOfThePage" => "Fabrico test",
                "title" => "Users",
                "content" => "The user id is: ".$userId
            )));
        }   
    }

    $router = new Router();
    $router
    ->register("/users/@id", "ControllerUsers")
    ->register("/users", "ControllerUsers")
    ->register("", "ControllerHome")
    ->run();


?>