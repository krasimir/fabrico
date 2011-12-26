<?php

    inject("validators/RegEx.php");
    
    /**
    * @package Fabrico\Modules\Tools\Validators
    */
    class OnlyNumbers extends RegEx {
        public function run($value, $parameters = null) {
            $parameters = (object) array(
                "match" => "/^[0-9]+$/"
            );
            return parent::run($value, $parameters);
        }
    }

?>