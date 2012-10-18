<?php

    require_once(dirname(__FILE__)."/../../src/Fabrico.php");

    class Application extends Fabrico {
        public function __construct() {
            parent::__construct();
            
        }
    }

    new Application();
    
    // $router = new Router();
    // $router->register("/mypage/articles/@articleId/@commentId/@username", function($params) {
    //         var_dump($params);
    //     })
    //     ->register("/mypage/articles/@articleId/@commentId", function($params) {
    //         var_dump($params);
    //     }, "GET,POST")
    //     ->register("/", function($params) {
    //         die(view("template.html", array(
    //             "titleOfThePage" => "Fabrico(2)",
    //             "title" => "Fabrico(2) - PHP Micro Framework"
    //         ), dirname(__FILE__)."/tpl/"));
    //     })
    //     ->run();
 
?>