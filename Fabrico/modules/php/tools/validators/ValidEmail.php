<?php

    inject("validators/RegEx.php");
    
    class ValidEmail extends RegEx {
        public function run($value, $parameters = null) {
            $parameters = (object) array(
                "match" => "/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/"
            );
            return parent::run($value, $parameters);
        }
    }

?>