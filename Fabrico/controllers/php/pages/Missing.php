<?php

    require_once("pages/Page.php");

    class Missing extends Page {
        public function run($req, $res) {
            $res->send($this->view("layout.html", array(
                "javascript" => $req->fabrico->assets->get("javascript"),
                "stylesheet" => $req->fabrico->assets->get("css"),
                "pageTitle" => "Fabrico / Missing page",
                "title" => "Fabrico / Missing page",
                "mainNav" => "",
                "data" => $this->view("missingpage.html")
            )));
        }
    }

?>