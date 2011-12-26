<?php

    inject("pages/Page.php");

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