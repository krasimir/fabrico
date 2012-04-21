<?php

    inject(array(
        "utils/view.php"
    ));

    class Documentation {
        public function run($req, $res) {
            $res->send(view(dirname(__FILE__)."/../views/Documentation.html", array(
                "url" => $req->fabrico->paths->url
            )));
        }
    }

?>