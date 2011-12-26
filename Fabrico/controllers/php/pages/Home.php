<?php

    inject(array(
        "pages/Page.php",
        "tools/view.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages
    */
    class Home extends Page {
            
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            $this->response("<br />Welcome to <i><strong>fabrico</strong></i>.", $req, $res);            
        }
    
    }

?>