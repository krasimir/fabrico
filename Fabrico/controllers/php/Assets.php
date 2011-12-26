<?php
    /**
    * Initialize the assests of Fabrico
    * @package Fabrico\Controllers
    */
    class Assets {
        
        public function __construct($assetsManager){
        
            // set javascript
            $assetsManager->add(array(
                "name" => "javascript", 
                "source" => "/modules/js/*.js", 
                "destination" => "/assets/compiled/",
                "extension" => "js"
            ));
        
            // set css
            $assetsManager->add(array(
                "name" => "css", 
                "source" => "/assets/css/*.css", 
                "destination" => "/assets/compiled/",
                "extension" => "css"
            ));
            
        }

        public function run($req, $res) {}
    }
?>