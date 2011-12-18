<?php

    require_once("presenters/Text.php");

    class Digit extends Text {
        
        public function __toString() {
            return "Digit";
        }
    
    }
    
?>