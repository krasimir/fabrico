<?php
    
    inject("pages/Page.php");

    /**
    * @package Fabrico\Controllers\Pages
    */
    class Error extends Page {
        public function __construct(Exception $e) {
            header("Status: 500 Internal Server Error");
            exit(view("errorpage.html", array(
                "message" => $e->getMessage(),
                "location" => "File: ".$e->getFile()." Line: ".$e->getLine(),
                "stackTrace" => '<li>'.implode(explode("\n", $e->getTraceAsString()), '<li>')
            )));
        }
    }

?>