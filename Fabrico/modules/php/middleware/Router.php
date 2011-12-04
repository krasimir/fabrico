<?php

require_once("Middleware.php");

class Router extends Middleware {

    private $_rules;
    
    public $noMatch = "";

    public function __construct($options){
        
    }
    public function addRule($method, $pattern, $handler, $action = "run") {
        $this->_rules[] = (object) array("pattern" => $pattern, "method" => $method, "handler" => $handler, "action" => $action);
    }
    public function all($pattern, $handler, $action = "run") {
        $this->get($pattern, $handler, $action);
        $this->post($pattern, $handler, $action);
        $this->delete($pattern, $handler, $action);
        $this->put($pattern, $handler, $action);
    }
    public function get($pattern, $handler, $action = "run") {
        $this->addRule("GET", $pattern, $handler, $action);
    }
    public function post($pattern, $handler, $action = "run") {
        $this->addRule("POST", $pattern, $handler, $action);
    }
    public function delete($pattern, $handler, $action = "run") {
        $this->addRule("DELETE", $pattern, $handler, $action);
    }
    public function put($pattern, $handler, $action = "run") {
        $this->addRule("PUT", $pattern, $handler, $action);
    }
    public function run($req, $res) {
        parent::run($req, $res);
        
        $numOfRules = count($this->_rules);
        $match = false;
        for($i=0; $i<$numOfRules; $i++) {
            $rule = $this->_rules[$i];
            $pattern = $req->fabrico->config->get("fabrico.paths.http").$rule->pattern;
            //var_dump($i.". ".$pattern." % ".$req->url." (".$rule->method.")");
            if($rule->method == $req->method && $this->match($pattern, $req->url, $req->params)) {
                $match = true;
                $handler = $rule->handler;
                if(is_callable($handler)) {
                    $handler($req, $res);
                } else if(is_string($handler)) {
                    $this->createController($handler, $rule, $req, $res);
                    break;
                } else {
                    throw new ErrorException("not usable ".$handler.' for route handler');
                }
            }
            
        }
        if(!$match && $this->noMatch != "") {
            $this->createController($this->noMatch, (object) array("action" => "run"), $req, $res);
        }
    }
    public function match($pattern, $url, array &$params = array()) {
        $ids = array();

        if($pattern == $url)
            return true;
       
        // Build the regex for matching
        $regex = '/^'.implode('\/', array_map(
            function($str) use (&$ids){
                if ($str == '*') {
                    $str = '(.*)';
                }
                else if ($str != "" && $str{0} == '@') {
                    if (preg_match('/@(\w+)(\:([^\/]*))?/', $str, $matches)) {
                        $ids[$matches[1]] = true;
                        return '(?P<'.$matches[1].'>'.(isset($matches[3]) ? $matches[3] : '[^(\/|\?)]+').')';
                    }
                }
                return $str; 
            },
            explode('/', $pattern)
        )).'\/?(?:\?.*)?$/i';

        // Attempt to match route and named parameters
        if (preg_match($regex, $url, $matches)) {
            if (!empty($ids)) {
                $params = array_intersect_key($matches, $ids);
            }
            return true;
        }

        return false;
    }
    public function removeAllRoutes() {
        $this->_rules = array();
    }
    private function createController($path, $rule, $req, $res) {
        require_once($path);
        $parts = explode("/", $path);
        $last =  array_pop($parts);
        $className = str_replace(".php", "", $last);
        $instance = new $className($this);
        $action = $rule->action;
        $instance->$action($req, $res);
    }
}
?>