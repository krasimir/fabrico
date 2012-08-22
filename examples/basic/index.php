<?php

    require_once(dirname(__FILE__)."/../../src/fabrico/Fabrico.php");
    
    $fabrico = new Fabrico();
    $fabrico->router()
        ->register("/mypage/articles/@articleId/@commentId/@username", function($params) {
            var_dump($params);
        })
        ->register("/mypage/articles/@articleId/@commentId", function($params) {
            var_dump($params);
        }, "GET,POST")
        ->register("/", function($params) {
            die(view("template.html", array(
                "titleOfThePage" => "Fabrico(2)",
                "title" => "Fabrico(2) - PHP Micro Framework"
            ), dirname(__FILE__)."/tpl/"));
        })
        ->run();
 
?>