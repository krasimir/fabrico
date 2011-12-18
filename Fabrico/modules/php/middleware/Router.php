<?php

    require_once("Middleware.php");

    class Router extends Middleware {

        private $_rules;
        
        public $noMatch = "";
        public $matchedRule = "";

        public function __construct($options){
            
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
            parent::run($req, $res);
            
            $numOfRules = count($this->_rules);
            $match = false;
            $fabricoPathHTTP = $req->fabrico->config->get("fabrico.paths.http");
            for($i=0; $i<$numOfRules; $i++) {
                $rule = $this->_rules[$i];
                $pattern = $fabricoPathHTTP.$rule->pattern;
                //var_dump($i.". ".$pattern." (".$req->method.") % ".$req->url." (".$rule->method.")");
                if($rule->method == $req->method && $this->match($pattern, $req->url, $req->params)) {
                    $match = true;
                    $handler = $rule->handler;
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
        public function getAllRules() {
            return $this->_rules;
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