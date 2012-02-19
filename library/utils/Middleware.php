<?php

    /**
     * Class that realize a middleware architecture. I.e. components/classes which are run one after each other. Normally every part of the middleware has method 'run' which accepts $request and $response.
     * @package Fabrico\Library\Utils
     */
    class Middleware {
        
        /**
        * Stores the current middleware elements.
        */
        private $modules = array();
        
        /**
        * @param array options Associative array. All the array's items are attached as public properties.
        */
        public function __construct($options = array()){
            foreach($options as $key => $value)
                $this->{$key} = $value;
        }
        /**
        * Set the middleware items.
        * Example:
        * <pre>
        * $this->using(array(                
        *    "benchmark" => "modules/Benchmark.php",
        *    "config" => "utils/JSONConfig.php",
        *    "models" => "modules/ModelsManager.php"
        * ));
        * </pre>
        * @param array|string modules The middleware items
        */
        public function using($modules) {
        
            if(is_string($modules)) {
                $modules = array($modules);
            }

            foreach($modules as $name => $path) {
                inject($path);
                $parts = explode("/", $path);
                $className = str_replace(".php", "", array_pop($parts));
                $instance = new $className($this);
                $this->modules []= array("instance" => $instance);
                if(is_string($name)) {
                    $this->$name = $instance;
                }
            }

            return $this;
        }

        public function run($req, $res) {

            // then, execute all middleware modules in FIFO sequence
            foreach($this->modules as $module) {
                $module["instance"]->run($req, $res);
            }
            
        }
    }
    
?>