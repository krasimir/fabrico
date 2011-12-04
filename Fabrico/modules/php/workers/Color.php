<?php

    require_once("workers/Text.php");

    class Color extends Text {
        
        public function __toString() {
            return "Color";
        }
        public function listing($value) {
            return $this->view("listing.html", array(
                "color" => $value
            ));
        }
    
    }
    
?>