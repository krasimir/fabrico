<?php

    function assets() {
        return (object) array(
            "type" => "assets",
            "assets" => array(
                (object) array(
                    "name" => "javascript", 
                    "sourceToCompile" => array(
                        "/js/jquery/jquery-1.7.1.min.js",
                        "/js/calendar/*.js",
                        "/js/color/*.js",
                        "/js/utils/*.js",
                        "/js/presenters/*.js",
                        "/js/bootstrap/*.js"
                    ),
                    "sourceToInclude" => array(
                        "/js/tinymce/tiny_mce.js"
                    ),
                    "destination" => "/assets/compiled/",
                    "extension" => "js",
                    "preventCompiling" => false
                ),
                (object) array(
                    "name" => "css", 
                    "sourceToCompile" => array(
                        "/assets/css/*.css"
                    ),
                    "sourceToInclude" => array(
                    
                    ),
                    "destination" => "/assets/compiled/",
                    "extension" => "css"
                )
            )
        );
    }
    
?>