<?php

    /**
    * @package Fabrico\Library\Utils
    */
    class Signal {
    
        private $listeners = array();
        
        public function __construct($target) {
            $this->target = $target;
        }
        public function add($scope, $method) {
            $this->listeners []= (object) array(
                "scope" => $scope, 
                "method" => $method
            );
        }
        public function dispatch($data = null) {
            $event = (object) array(
                "data" => $data,
                "target" => $this->target
            );
            foreach($this->listeners as $listener) {
                $listener->scope->{$listener->method}($event);
            }
        }
        public function numOfListeners() {
            return count($this->listeners);
        }
        
    }

?>