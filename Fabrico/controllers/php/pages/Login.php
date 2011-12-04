<?php

    require_once("pages/Page.php");
    require_once("tools/view.php");

    class Login extends Page {
        
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            if($req->fabrico->access->logged) {
                header("Location: ".$req->fabrico->root->http);
                exit();
            }
            $res->send(view("layout.html", array(
                "javascript" => $req->fabrico->assets->get("javascript"),
                "stylesheet" => $req->fabrico->assets->get("css"),
                "pageTitle" => "fabrico / login",
                "title" => "fabrico / login",
                "mainNav" => "",
                "httpFiles" => $req->fabrico->root->httpFiles,
                "data" => view("login.html", array(
                    "http" => $req->fabrico->root->http
                )),
                "error" => $req->fabrico->access->loginError != "" ? view("errormessage.html", array("text" => $req->fabrico->access->loginError), $this) : ""
            )));
        }
    
    }

?>