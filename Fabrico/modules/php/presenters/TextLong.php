<?php

    require_once("presenters/Text.php");

    class TextLong extends Text {
    
        public function __toString() {
            return "TextLong";
        }
        public function listing($value) {
            if(strlen($value) > 300) {
                return substr($value, 0, 300)."...";
            } else {
                return $value;
            }
        }
    
    }
    
?>