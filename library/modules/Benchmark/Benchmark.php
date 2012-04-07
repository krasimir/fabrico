<?php

    inject(array(
        "modules/Module.php"
    ));

    /**
    * @package Fabrico\Library\Modules
    */
    class Benchmark extends Module {

        public $startTime;

        public function __construct($app){
            $this->startTime = microtime();
        }
        public function init($config) {
        
        }
        public function elpasedTime(){
            return microtime() - $this->startTime;
        }
        public function run($req, $res) {
            $req->benchmark = $this;
        }
        public function log() {
            echo '<div class="debug" style="background:#D5D5FF">Benchmark: '.$this->elpasedTime().'</div>';
        }
    }
?>