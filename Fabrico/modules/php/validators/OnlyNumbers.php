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
            \t\t\t"class": "validators/OnlyNumbers.php",
            \t\t\t"method": "run", // optional
            \t\t\t"message": "Wrong input!" // optional
            \t\t{
        \t]
    }
    </pre>
    * @package Fabrico\Modules\Validators
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