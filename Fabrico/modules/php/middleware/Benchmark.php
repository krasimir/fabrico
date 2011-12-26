<?php
    /**
    * @package Fabrico\Modules\Middleware
    */
    class Benchmark {

        public $startTime;

        public function __construct($app){
            $this->startTime = microtime();
        }

        public function elpasedTime(){
            return microtime() - $this->startTime;
        }

        public function run($req, $res) {
            $req->benchmark = $this;
        }
    }
?>