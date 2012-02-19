<?php
    
    /**
    Definition:
    <pre class="code">
    {
        \t"name": "firstName",
        \t"presenter": "presenters/Text.php",
        \t"validators": [
            \t\t{
            \t\t\t"class": "validators/NotEmpty.php",
            \t\t\t"method": "run", // optional
            \t\t\t"message": "Wrong input!" // optional
            \t\t}
        \t]
    }
    </pre>
    * @package Fabrico\Library\Validators
    */
    class NotEmpty {
        public function run($value, $parameters = null) {
            return $value === "" ? false : true;
        }
    }

?>