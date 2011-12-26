<?php
    
    class NotEmpty {
        public function run($value, $parameters = null) {
            return $value === "" ? false : true;
        }
    }

?>