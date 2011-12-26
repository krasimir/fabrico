<?php

    inject("presenters/Text.php");

    /**
    * @package Fabrico\Modules\Presenters
    */
    class TextLong extends Text {
    
        public function __toString() {
            return "TextLong";
        }
        public function listing($value) {
            if(strlen($value) > 300) {
                $this->response = substr($value, 0, 300)."...";
            } else {
                $this->response = $value;
            }
            return $this;
        }
    
    }
    
?>