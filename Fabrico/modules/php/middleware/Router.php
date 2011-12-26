<?php

    /**
    * @package Fabrico\Modules\Middleware
    */
    class Router {

        private $_rules;
        
        public $matchedRule = "";

        public function __construct(){
            
        }
        public function addRule($rule) {
            $rule = $this->validateRule($rule);
            if($rule->priority) {
                $arr = array($rule);
                $this->_rules = array_merge($arr, $this->_rules);
            } else {
                $this->_rules []= $rule;
            }
        }
        public function all($rule) {
            $this->get(clone $rule);
            $this->post(clone $rule);
            $this->delete(clone $rule);
            $this->put(clone $rule);
        }
        public function get($rule) {
            $rule->method = "GET";
            $this->addRule($rule);
        }
        public function post($rule) {
            $rule->method = "POST";
            $this->addRule($rule);
        }
        public function delete($rule) {
            $rule->method = "DELETE";
            $this->addRule($rule);
        }
        public function put($rule) {
            $rule->method = "PUT";
            $this->addRule($rule);
        }
        public function run($req, $res) {
            $numOfRules = count($this->_rules);
            $fabricoPathHTTP = $req->fabrico->config->get("fabrico.paths.http");
            for($i=0; $i<$numOfRules; $i++) {
                $rule = $this->_rules[$i];
                $handler = $rule->handler;
                $pattern = $fabricoPathHTTP.$rule->pattern;
                if($rule->method == $req->method) {
                    $match = $this->match($pattern, $req->url, $req->params);
                    /*var_dump("('".$pattern."' == '".$req->url."') ('".$req->method."' == '".$rule->method."') (handler=".$handler.") (match=".($match ? "true" : "false").")");
                    var_dump($match);*/
                    if($match) {
                        $this->matchedRule = $rule;
                        if(is_callable($handler)) {
                            $handler($req, $res);
                        } else if(is_string($handler)) {
                            $this->createController($handler, $rule, $req, $res);
                            break;
                        } else {
                            throw new Exception("not usable ".$handler.' for route handler');
                        }
                    }
                }                
            }
        }
        public function match($pattern, $url, &$params) {
        
            $matched = false;
            $regex = "";
            $vars = array();
            $patternParts = preg_split("/\//", $pattern);
            $numOfParts = count($patternParts);
            for($i=0; $i<$numOfParts; $i++) {
                $part = $patternParts[$i];
                if(substr($part, 0, 1) == "@") {
                    $vars []= (object) array(
                        "index" => $i,
                        "name" => str_replace("@", "", $part)
                    );
                    $regex  .= "[a-zA-Z0-9-_]+";
                } else {
                    $regex .= $part;
                }
                $regex .= $i < $numOfParts-1 ? "/" : "";
            }
        
            $pattern = str_replace("/", "\/", $regex);
            $result = preg_match("/".$pattern."/", $url);
            
            if($result) {
                if(count($vars) > 0) {
                    $urlParts = preg_split("/\//", $url);
                    $numOfParts = count($urlParts);
                    for($i=0; $i<$numOfParts; $i++) {
                        foreach($vars as $variable) {
                            if($variable->index == $i) {
                                $params[$variable->name] = $urlParts[$i];
                            }
                        }
                    }
                }
                $matched = true;
            } else {
                $matched = false;
            }
            
            return $matched;
            
        }
        public function removeAllRoutes() {
            $this->_rules = array();
        }
        public function getAllRules() {
            return $this->_rules;
        }
        private function createController($path, $rule, $req, $res) {
            inject($path);
            $parts = explode("/", $path);
            $last =  array_pop($parts);
            $className = str_replace(".php", "", $last);
            $instance = new $className($this);
            $action = $rule->action;
            $instance->$action($req, $res);
        }
        private function validateRule($rule) {
            if(!isset($rule->method)) {
                throw new Exception("Missing 'method' in a rule.");
            }
            if(!isset($rule->pattern)) {
                throw new Exception("Missing 'pattern' in a rule.");
            }
            if(!isset($rule->handler)) {
                throw new Exception("Missing 'handler' in a rule.");
            }
            if(!isset($rule->action)) {
                $rule->action = "run";
            }
            if(!isset($rule->priority)) {
                $rule->priority = false;
            }
            return $rule;
        }
    }
    
    /**
    * @package Fabrico\Modules\Middleware
    */
    class RouterRule {
    
        public $pattern = null;
        public $handler = null;
        public $action = "run";
        public $priority = false;
        public $model = null;
        
        public function __construct($props = null) {
            if($props != null) {
                foreach($props as $key => $value) {
                    $this->$key = $value;
                }
            }
        }
        
    }
    
?>