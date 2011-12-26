<?php

    /**
    * @package Fabrico\Modules\Tools\Validators
    */
    class RegEx {
        public function __construct($presenter) {
        
        }
        public function run($value, $parameters) {
            if(!isset($parameters) || !isset($parameters->match)) {
                throw new Exception("RegEx validator requires 'parameters': { 'match': '[your regular expression here]' }");
            }
            $result = preg_match($parameters->match, $value);
            return $result === 0 ? false : true;
        }
    }

?>