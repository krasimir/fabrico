<?php

    require_once("pages/Page.php");
    require_once("tools/view.php");

    class Home extends Page {
            
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            $this->response("<br />Welcome to <i><strong>fabrico</strong></i>.", $req, $res);            
        }
    
    }

?>