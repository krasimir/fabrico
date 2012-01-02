<?php

    /**
    * @package Fabrico\Modules\Middleware
    */
    class ModelsManager {
    
        public $root = "/";
        public $models = array();
        
        private $req;
        private $res;
        
        public function __toString() {
            return "ModelsManager";
        }
        public function get($modelJSONFile) {
        
            if(isset($this->models[$modelJSONFile])) {
                return $this->models[$modelJSONFile];
            }
            
            if(!file_exists($this->root."/".$modelJSONFile)) {
                throw new Exception($this.": file '".$modelJSONFile."' is missing.");
            }
            
            // reading model's json
            $jsonConfig = new JSONConfig();
            $jsonConfig->source(array("model" => $this->root."/".$modelJSONFile));
            $jsonConfig = $jsonConfig->data->model;
            if($jsonConfig === null) {
                throw new Exception($this.": error reading '".$modelJSONFile."'");
            }
            $jsonConfig->adapter = isset($jsonConfig->adapter) ? $jsonConfig->adapter : "adapters/MySQL.php";
            
            // getting model's classes names
            $className = $this->getFilename($jsonConfig->adapter);
            $classNameConfig = $className."Config";
            
            // including model's classes 
            inject($jsonConfig->adapter);
            
            // adding the properties from fabrico's config file
            $fabricoAdapterConfig = $this->req->fabrico->config->get("fabrico.adapters.".$className);
            if(!$fabricoAdapterConfig) {
                throw new Exception($this.": missing configuration for '".$className."'. Check Fabrico's configuration file.");
            }
            foreach($fabricoAdapterConfig as $key => $value) {
                $jsonConfig->$key = $value;
            }
            
            // setting debug flag and the name of the model
            $jsonConfig->debug = DEBUG_MODE;
            $jsonConfig->name = $this->getFilename($modelJSONFile);
            
            // created the model
            $model = new $className(new $classNameConfig($jsonConfig));
            $this->{$jsonConfig->name} = $model;
            $this->models[$modelJSONFile] = $model;
            
            return $model;
        
        }
        public function run($req, $res) {
            $this->req = $req;
            $this->res = $res;
        }
        private function getFilename($path) {
            $parts = explode("/", $path);
            $parts = explode(".", array_pop($parts));
            return $parts[0];
        }
    
    }
    
    

?>