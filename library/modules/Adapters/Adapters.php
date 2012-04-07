<?php

    inject(array(
        "modules/Module.php"
    ));

    /**
    * @package Fabrico\Library\Modules
    */
    class Adapters extends Module {

        public function __construct(){
            
        }
        public function init($config) {
            foreach($config as $key => $value) {
                $this->$key = $value;
            }
        }
        public function run($req, $res) {
            
        }
    }
?>