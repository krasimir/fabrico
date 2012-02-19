<?php

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "firstName",
        \t"presenter": "presenters/Text.php",
        \t"validators": [
            \t\t{
            \t\t\t"class": "validators/RegEx.php",
            \t\t\t"parameters": {
                \t\t\t\t"match": "/^[0-9]+$/"
            \t\t\t},
            \t\t\t"method": "run", // optional
            \t\t\t"message": "Wrong input!" // optional
            \t\t}
        \t]
    }
    </pre>
    * @package Fabrico\Library\Validators
    */
    class RegEx {
        public function run($value, $parameters = null) {
            if(!isset($parameters) || !isset($parameters->match) || $parameters == null) {
                throw new Exception("RegEx validator requires 'parameters': { 'match': '[your regular expression here]' }");
            }
            $result = preg_match($parameters->match, $value);
            return $result === 0 ? false : true;
        }
    }

?>