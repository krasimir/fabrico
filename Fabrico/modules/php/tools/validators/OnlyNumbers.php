<?php

    inject("validators/RegEx.php");
    
    class OnlyNumbers extends RegEx {
        public function run($value, $parameters = null) {
            $parameters = (object) array(
                "match" => "/^[0-9]+$/"
            );
            return parent::run($value, $parameters);
        }
    }

?>