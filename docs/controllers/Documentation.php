<?php

    inject(array(
        "utils/view.php"
    ));

    class Documentation {
        public function __construct() {
        
        }
        public function run($req, $res) {
            $res->send(view(dirname(__FILE__)."/../views/Documentation.html", array(
                "host" => $req->fabrico->paths->host
            )));
        }
    }

?>