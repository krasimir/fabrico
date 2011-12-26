<?php
    
    /**
    * @package Fabrico\Modules\Tools\Validators
    */
    class LengthMax {
        public function run($value, $parameters = null) {
            if(!isset($parameters) || !isset($parameters->length)) {
                throw new Exception("StrictLength validator requires 'parameters': { 'length': '[your length here]' }");
            }
            return strlen($value) > $parameters->length ? false : true;
        }
    }

?>