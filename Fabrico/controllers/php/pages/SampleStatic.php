<?php

    inject(array(
        "Middleware.php",
        "middleware/Router.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages
    */
    class SampleStatic extends Page {
    
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            $this->title = "fabrico / Sample static page";
            $this->response("<br />SampleStatic content ...", $req, $res);
        }
        
    }

?>