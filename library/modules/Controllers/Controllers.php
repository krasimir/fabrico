<?php

    inject(array(
        "modules/Module.php"
    ));

    class Controllers extends Module {
    
        public $config;

        public function __construct(){
            
        }
        public function init($config) {
            $this->config = $config;
        }
        public function run($req, $res) {
            
        }
        public function get($nameOfTheController) {
            if(isset($this->config->controllers->{$nameOfTheController})) {
                return $this->config->controllers->{$nameOfTheController};
            } else {
                return false;
            }
        }
    }
    
?>