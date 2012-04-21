<?php

    inject(array(
        "modules/Module.php"
    ));

    /**
    * @package Fabrico\Library\Modules
    */
    class Router extends Module {
    
        public $config;

        private $_rules;
        private $logStr = "";
        
        public $matchedRule = "";

        public function __construct(){
            
        }
        public function init($config) {
            $this->config = $config;
            $routes = $config->routes;
            foreach($routes as $route) {
                $rule = new RouterRule(array(
                    "pattern" => $route->url,
                    "controller" => $route->controller,
                    "action" => isset($route->action) ? $route->action : "run",
                    "priority" => isset($route->priority) ? $route->priority : false,
                    "model" => isset($route->model) ? $route->model : null
                ));
                $this->all($rule);
            }
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
            for($i=0; $i<$numOfRules; $i++) {
                $rule = $this->_rules[$i];
                $controller = $rule->controller;
                $pattern = $rule->pattern;
                if($rule->method == $req->method) {
                    $match = $this->match($pattern, $req->slug, $req->params);
                    /*var_dump("('".$pattern."' == '".$req->slug."') ('".$req->method."' == '".$rule->method."') (controller=".$controller.") (match=".($match ? "true" : "false").")");
                    var_dump($match);*/
                    if($match) {
                        if(defined("DEBUG") && DEBUG) {
                            $this->toLog("Router:<br />matched pattern: '".$pattern."'<br />controller: '".$controller."'", "#D3D5E7");
                        }
                        $this->matchedRule = $rule;
                        if(is_callable($controller)) {
                            $controller($req, $res);
                        } if(is_object($controller)) {
                            $this->createController($controller, $rule, $req, $res);
                            break;
                        } else {
                            throw new Exception("not usable ".$controller.' for route controller');
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
        private function createController($controller, $rule, $req, $res) {
            $path = $controller->class;
            inject($path);
            $parts = explode("/", $path);
            $last =  array_pop($parts);
            $className = str_replace(".php", "", $last);
            $instance = new $className($this, $controller);
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
            if(!isset($rule->controller)) {
                throw new Exception("Missing 'controller' in a rule.");
            }
            if(!isset($rule->action)) {
                $rule->action = "run";
            }
            if(!isset($rule->priority)) {
                $rule->priority = false;
            }
            return $rule;
        }
        private function toLog($str, $color) {
            $this->logStr .= '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
        }
        public function log() {
            echo $this->logStr;
        }
    }
    
    /**
    * @package Fabrico\Library\Modules
    */
    class RouterRule {
    
        public $pattern = null;
        public $controller = null;
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