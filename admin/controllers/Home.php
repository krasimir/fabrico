<?php

    inject(array(
        "controllers/Controller.php",
        "utils/view.php"
    ));

    class Home extends Controller {
            
        public function __construct($configKey) {
            
        }
        public function run($req, $res) {
            $this->title = 'Welcome '.$req->fabrico->currentUser->username.'.';
            $this->pageTitle = 'Home';
            $this->response(view("home.html"), $req, $res);            
        }
    
    }

?>