<?php

    /**
    Creates and execute validator.<br />
    Method 'get' accepts an object ($validator) and the value that will be tested ($value):
    <pre class="code">
    {
        \t"class": "validators/RegEx.php",
        \t"parameters": {
            \t\t"match": "/^[0-9]+$/"
        \t},
        \t"method": "run", // optional
        \t"message": "Wrong input!" // optional
    }
    </pre>
    Returns:
    <pre class="code">
        (object) array(
            \t"validator" => $validatorInstance, // if the validation passes returns 'null', otherwise it returns the validator
            \t"message" => isset($validator->message) ? $validator->message : "Wrong input."
        );
    </pre>
    * @package Fabrico\Library\Validators
    */
    class ValidatorFactory {
        public static function get($validator, $value) {
            if(!isset($validator) || !isset($validator->class)) {
                throw new Exception($this." missing ->class property of validator.");
            } else {
                $className = inject($validator->class);
                $validatorInstance = new $className();
                $method = isset($validator->method) ? $validator->method : "run";
                if(!$validatorInstance->$method($value, isset($validator->parameters) ? $validator->parameters : null)) {
                    return (object) array(
                        "validator" => $validatorInstance,
                        "message" => isset($validator->message) ? $validator->message : "Wrong input."
                    );
                } else {
                    return (object) array(
                        "validator" => null,
                        "message" => ""
                    );    
                }
            }
        }
    }


?>