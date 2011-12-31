<?php
    
    /**
    Definition:
    <pre class="code">
    {
        \t"name": "firstName",
        \t"presenter": "presenters/Text.php",
        \t"validators": [
            \t\t{
            \t\t\t"class": "validators/LengthExact.php",
            \t\t\t"parameters": {
                \t\t\t\t"length": 5
            \t\t\t},
            \t\t\t"method": "run", // optional
            \t\t\t"message": "Wrong input!" // optional
            \t\t{
        \t]
    }
    </pre>
    * @package Fabrico\Modules\Validators
    */
    class LengthExact {
        public function run($value, $parameters = null) {
            if(!isset($parameters) || !isset($parameters->length)) {
                throw new Exception("LengthExact validator requires 'parameters': { 'length': '[your length here]' }");
            }
            return strlen($value) === $parameters->length ? true : false;
        }
    }

?>