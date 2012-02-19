<?php
    
    /**
    * Usage:
    Definition:
    <pre class="code">
    {
        \t"name": "firstName",
        \t"presenter": "presenters/Text.php",
        \t"validators": [
            \t\t{
            \t\t\t"class": "validators/LengthMin.php",
            \t\t\t"parameters": {
                \t\t\t\t"length": 5
            \t\t\t},
            \t\t\t"method": "run", // optional
            \t\t\t"message": "Wrong input!" // optional
            \t\t}
        \t]
    }
    </pre>
    * @package Fabrico\Library\Validators
    */
    class LengthMin {
        public function run($value, $parameters = null) {
            if(!isset($parameters) || !isset($parameters->length)) {
                throw new Exception("LengthMin validator requires 'parameters': { 'length': '[your length here]' }");
            }
            return strlen($value) < $parameters->length ? false : true;
        }
    }

?>