<?php

    inject("validators/RegEx.php");
    
    class OnlyLettersAndNumbers extends RegEx {
        public function run($value, $parameters = null) {
            $parameters = (object) array(
                "match" => "/^[a-zA-Z\d]+$/"
            );
            return parent::run($value, $parameters);
        }
    }

?>