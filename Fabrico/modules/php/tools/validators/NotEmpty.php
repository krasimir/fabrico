<?php
    
    /**
    * @package Fabrico\Modules\Tools\Validators
    */
    class NotEmpty {
        public function run($value, $parameters = null) {
            return $value === "" ? false : true;
        }
    }

?>