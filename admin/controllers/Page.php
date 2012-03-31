<?php
    
    inject(array(
        "Middleware.php",
        "modules/Router.php",
        "utils/Signal.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages
    */
    class Page extends Middleware {
    
        public $model;
        public $url;
        public $title;
        public $pageTitle;
        public $events;
    
        protected $router;
        protected $defaultRoutes = array();
        protected $defaultController = "actions/Listing.php";
        protected $matchedRouterRule;
        
        private $routes = array();
        
        public function __construct($router = null) {
            $this->matchedRouterRule = $router->matchedRule;
            $this->events = (object) array(
                "ON_ADD" => new Signal($this),
                "ON_EDIT" => new Signal($this),
                "ON_DELETE" => new Signal($this)
            );
        }
        public function run($req, $res) {
        
            // administrate a model if there is any associated with this controller
            if(isset($this->matchedRouterRule->model) && $this->model = $req->fabrico->models->get($this->matchedRouterRule->model)) {
            
                $this->url = $this->url === null ? $this->filterRoutePattern($this->matchedRouterRule->pattern) : $this->url;
                $this->title = $this->title === null ? ($this->model->title !== null ? $this->model->title : "...") : $this->title;
                $this->pageTitle = $this->model->pageTitle !== null ? $this->model->pageTitle : "...";
                
                // routes
                $pattern = $this->matchedRouterRule->pattern;
                $this->routes = array(
                    // showing data from the database
                    $pattern."/listing" => $this->getActionController("listing", "actions/Listing.php"),
                    // adding data from the database
                    $pattern."/adding" => $this->getActionController("adding", "actions/Adding.php"),
                    // editing data from the database
                    $pattern."/editing/@id" => $this->getActionController("editing", "actions/Editing.php"),
                    // deleting data from the database
                    $pattern."/deleting/@id" => $this->getActionController("deleting", "actions/Deleting.php"),
                    // ordering
                    $pattern."/ordering/@type/@id/@position" => "actions/Ordering.php",
                    // ordering
                    $pattern."/ordering/@type/@id" => "actions/Ordering.php"
                );
                
                // adding custom routes if any
                foreach($this->defaultRoutes as $route => $path) {
                    $this->routes[$route] = $path;
                }
                
                // default route
                $this->routes[$pattern] = $this->getActionController("listing", $this->defaultController);
                
                // setup middleware
                $this->using(array(
                    "router" => "modules/Router.php"
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
                "title" => $this->title,
                "pageTitle" => $this->pageTitle,
                "mainNav" => view("mainnav.html", array(), $this),
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
        private function getActionController($propName, $default) {
            if(isset($this->model->configs->actions->{$propName}) && isset($this->model->configs->actions->{$propName}->controller)) {
                return $this->model->configs->actions->{$propName}->controller;
            } else {
                return $default;
            }
        }
    
    }

?>