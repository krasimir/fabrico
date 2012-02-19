<?php

    inject("validators/RegEx.php");
    
    /**
    Definition:
    <pre class="code">
    {
        \t"name": "firstName",
        \t"presenter": "presenters/Text.php",
        \t"validators": [
            \t\t{
            \t\t\t"class": "validators/OnlyLettersAndNumbers.php",
            \t\t\t"method": "run", // optional
            \t\t\t"message": "Wrong input!" // optional
            \t\t}
        \t]
    }
    </pre>
    * @package Fabrico\Library\Validators
    */
    class OnlyLettersAndNumbers extends RegEx {
        public function run($value, $parameters = null) {
            $parameters = (object) array(
                "match" => "/^[a-zA-Z\d]+$/"
            );
            return parent::run($value, $parameters);
        }
    }

?>