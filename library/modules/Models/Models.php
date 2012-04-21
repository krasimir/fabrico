<?php

    inject(array(
        "modules/Module.php"
    ));

    /**
    * @package Fabrico\Library\Modules
    */
    class Models extends Module {
    
        public $root = "/";
        public $models;
        public $config;
        
        private $req;
        private $res;
        
        public function __construct() {
            $this->models = (object) array();
        }
        public function __toString() {
            return "ModelsManager";
        }
        public function init($config) {
            $this->config = $config;
        }
        public function get($name) {
        
            if(isset($this->models->$name)) {
                return $this->models->$name;
            }
            
            if(!isset($this->config->models->$name)) {
                throw new Exception($this.": model '".$name."' is missing. Please check your module definition.");
            }
            
            // reading model's json
            $modelConfig = $this->config->models->$name;
            $modelConfig->adapter = isset($modelConfig->adapter) ? $modelConfig->adapter : "adapters/MySQL.php";
            
            // getting model's classes names
            $className = $this->getFilename($modelConfig->adapter);
            $classNameConfig = $className."Config";
            
            // including model's adapter 
            inject($modelConfig->adapter);
            
            $adaptersSettings = explode(".", basename($this->config->adapters));
            $adaptersSettings = $adaptersSettings[0];
            
            // adding the properties from fabrico's config file
            if(!isset($this->req->fabrico->$adaptersSettings->$className)) {
                throw new Exception($this.": missing configuration for '".$className."'. Check your adapters module.");
            }
            $fabricoAdapterConfig = $this->req->fabrico->$adaptersSettings->$className;
            foreach($fabricoAdapterConfig as $key => $value) {
                $modelConfig->$key = $value;
            }
            
            // setting debug flag and the name of the model
            $modelConfig->debug = defined("DEBUG") && DEBUG;
            $modelConfig->name = $name;
            
            // created the model
            $model = new $className(new $classNameConfig($modelConfig));
            $this->{$modelConfig->name} = $model;
            $this->models->$name = $model;
            
            return $model;
        
        }
        public function getConfig($name) {
            if(!isset($this->config->models->$name)) {
                throw new Exception($this.": model '".$name."' is missing. Please check your module definition.");
            } else {
                return $this->config->models->$name;
            }
        }
        public function run($req, $res) {
            $this->req = $req;
            $this->res = $res;
        }
        public function log() {
            foreach($this->models as $model) {
                $model->report();
            }
        }
        private function getFilename($path) {
            $parts = explode("/", $path);
            $parts = explode(".", array_pop($parts));
            return $parts[0];
        }
    
    }
    
    

?>