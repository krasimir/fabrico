<?php

    require_once("Middleware.php");
    require_once("middleware/Router.php");
    require_once("middleware/Router.php");
    
    class Page extends Middleware {
    
        public $model;
        public $url;
    
        protected $router;
        protected $defaultRoutes = array();
        protected $defaultController = "actions/Listing.php";
        protected $matchedRouterRule;
        
        private $routes = array();
        
        public function __construct($router = null) {
            $this->matchedRouterRule = $router->matchedRule;
        }
        public function run($req, $res) {
        
            // administrate a model if there is any associated with this controller
            if(isset($this->matchedRouterRule->model) && $this->model = $req->fabrico->models->get($this->matchedRouterRule->model)) {
            
                $this->url = $this->filterRoutePattern($this->matchedRouterRule->pattern);
                
                // routes
                $pattern = $this->matchedRouterRule->pattern;
                $this->routes = array(
                    // showing data from the database
                    $pattern."/listing" => "actions/Listing.php",
                    // adding data from the database
                    $pattern."/adding" => "actions/Adding.php",
                    // editing data from the database
                    $pattern."/editing/@id" => "actions/Editing.php",
                    // deleting data from the database
                    $pattern."/deleting/@id" => "actions/Deleting.php",
                    // ordering
                    $pattern."/ordering/@type/@id" => "actions/Ordering.php",
                    // default route
                    $pattern => $this->defaultController
                );
                
                // adding custom routes if any
                foreach($this->defaultRoutes as $route => $path) {
                    if(!isset($this->routes[$route])) {
                        $this->routes[$route] = $path;
                    }
                }
                
                // setup middleware
                $this->using(array(
                    "router" => "middleware/Router.php"
                ));
                
                // setup routes
                foreach($this->routes as $pattern => $action) {
                    $rule = new RouterRule(array(
                        "pattern" => $pattern,
                        "handler" => $action,
                        "controller" => $this,
                        "model" => $this->model
                    ));
                    $this->router->all($rule);
                }
                
                parent::run($req, $res);
            
            }
            
        }
        // output (send result to the browser)
        public function response($content, $req, $res) {
            $res->send(view("layout.html", array(
                "javascript" => $req->fabrico->assets->get("javascript"),
                "stylesheet" => $req->fabrico->assets->get("css"),
                "pageTitle" => isset($this->title) ? $this->title : "fabrico",
                "title" => isset($this->title) ? $this->title : "fabrico",
                "httpFiles" => $req->fabrico->root->httpFiles,
                "mainNav" => view("mainnav.html", array(
                    "http" => $req->fabrico->root->http
                ), $this),
                "data" => $content
            ), $this));
        }
        // other
        public function __toString() {
            return "Default";
        }
        private function filterRoutePattern($pattern) {
            $charsToRemove = array("(", ")", ".", "?", "*");
            foreach($charsToRemove as $char) {
                $pattern = str_replace($char, "", $pattern);
            }
            return $pattern;
        }
    
    }

?>