<?php

    require(__DIR__."/../../src/fabrico.php");

    $F->loadModule("Router", "View", "TestWidget");
    $F->loadResource("resources/*", "utils/ErrorHandler/index.php");
    
    /******************************************************/

    View::$root = __DIR__;
    View::$forEachView = array(
        "globalVar" => "global variable"
    );

    class CheckSession {
        public function __construct($params) {
            var_dump("Controller CheckSession run");
        }
    }

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

    // test instance of custom resource
    $config = new MyCustomConfig();

    $router = new Router();
    $router
    ->register("/users/@id", array("CheckSession", "ControllerUsers"))
    ->register("/users", "ControllerUsers")
    ->register("", "ControllerHome")
    ->run();


?>