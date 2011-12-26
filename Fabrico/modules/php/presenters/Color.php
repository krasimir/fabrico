<?php

    inject("presenters/Text.php");

    class Color extends Text {
        
        public function __toString() {
            return "Color";
        }
        public function listing($value) {
            $this->response = $this->view("listing.html", array(
                "color" => $value
            ));
            return $this;
        }
    
    }
    
?>