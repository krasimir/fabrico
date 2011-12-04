<?php

class Middleware {
    
    private $modules = array();

    public function __construct($options = array()){
        foreach($options as $key => $value)
            $this->{$key} = $value;
    }

    public function using($modules) {
	
        if(is_string($modules)) {
            $modules = array($modules);
		}

        foreach($modules as $name => $path) {
            require_once($path);
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

    public function run($request, $response) {

        // then, execute all middleware modules in FIFO sequence
        foreach($this->modules as $module) {
            $module["instance"]->run($request, $response);
        }
		
    }
}
?>