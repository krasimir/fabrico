<?php

    /**
    * @package Fabrico\Modules\Utils
    */
    class Signal {
    
        private $listeners = array();
        public $target;
        public $data;
        
        public function __construct($target) {
            $this->target = $target;
        }
        public function add($listener) {
            $this->listeners []= $listener;
        }
        public function dispatch($data = null) {
            $this->data = $data;
            foreach($this->listeners as $listener) {
                $listener($this);
            }
        }
        public function numOfListeners() {
            return count($this->listeners);
        }
        
    }

?>