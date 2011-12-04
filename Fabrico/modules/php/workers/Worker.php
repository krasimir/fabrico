<?php

    class Worker {
    
        public $field = "";
        
        public function __construct($properties = array()) {
            if(!is_array($properties)) {
                $properties = array($properties);
            }
            foreach($properties as $prop => $value) {
                $this->$prop = $value;
            }
        }
        public function listing($value) {
            return $value;
        }
        public function add() {
            return "";
        }
        public function addAction() {
            return "";
        }
        public function edit($value) {
            return "";
        }
        public function editAction($value) {
            return "";
        }
        public function deleteAction($value) {
            return false;
        }
        public function __toString() {
            return "Worker";
        }
        public function view($template, $data) {
            $searchIn = array();
            $searchIn []= $this->controller."/".$this."/".$this->field;
            $searchIn []= $this->controller."/".$this;
            $searchIn []= ViewConfig::$searchIn[count(ViewConfig::$searchIn)-1]."/".$this;
            return view($template, $data, $searchIn);
        }
        public function getFieldPart($index) {
            if(isset($this->field)) {
                $parts = explode("_", $this->field);
                if(isset($parts[$index])) {
                    return $parts[$index];
                } else {
                    return null;
                }
            }
            return null;
        }
        protected function getConfig() {
            if(!isset($this->config)) {
                $configFieldPart = $this->getFieldPart(2);
                if(isset($configFieldPart)) {
                    $this->config = $this->req->fabrico->config->get("fabrico.workers")->$configFieldPart;
                } else {
                    $this->config = null;
                }
            }
            return $this->config;
        }
        
    }
    
    class WorkerFactory {
    
        private static $enableDebug = false;
        private static $root = "";
        
        public static function config($configs) {
            foreach($configs as $key => $value) {
                self::$$key = $value;
            }
        }
        public static function get($field, $properties = array()) {
            $fieldParts = explode("_", $field);
            if(isset($fieldParts[1])) {
                $workerName = $fieldParts[1];
                $path = "workers/".$workerName.".php";
                require_once($path);
                $worker = new $workerName($properties);
                $worker->field = $field;
                if(self::$enableDebug) {
                    var_dump("worker: ".$path);
                }
                return $worker;
            } else {
                return null;
            }
        }
        public static function debug($value) {
            self::$enableDebug = $value;
        }
    
    }

?>