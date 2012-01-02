<?php

    inject(array(
        "pages/Page.php",
        "utils/view.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages
    */

    class Logout extends Page {
        
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            $req->fabrico->access->logout();
            header("Location: ".$req->fabrico->root->http);
            exit();
        }
    
    }

?>