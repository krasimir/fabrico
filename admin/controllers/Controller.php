<?php
    
    inject(array(
        "Middleware.php",
        "modules/Router.php",
        "utils/Signal.php"
    ));

    class Controller extends Middleware {
    
        public $model;
        public $url;
        public $title;
        public $pageTitle;
        public $events;
    
        protected $config;
        protected $uid;
        protected $router;
        protected $defaultRoutes = array();
        protected $defaultController = "actions/Listing.php";
        protected $matchedRouterRule;
        
        private $routes = array();
        
        public function __construct($router, $config) {
            $this->matchedRouterRule = $router->matchedRule;
            $this->uid = isset($config->uid) ? $config->uid : "";
            $this->events = (object) array(
                "ON_ADD" => new Signal($this),
                "ON_EDIT" => new Signal($this),
                "ON_DELETE" => new Signal($this)
            );
        }
        public function run($req, $res) {
        
            $this->config = $req->fabrico->controllers->get($this->uid);
        
            // administrate a model if there is any associated with this controller
            if($this->model = $this->getModel($req)) {
            
                $this->url = $this->url === null ? $this->filterRoutePattern($this->matchedRouterRule->pattern) : $this->url;
                $this->title = $this->title === null ? ($this->config->title !== null ? $this->config->title : "...") : $this->title;
                $this->pageTitle = $this->config->pageTitle !== null ? $this->config->pageTitle : "...";
                
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
                        "controller" => (object) array("class" => $action),
                        "parentController" => $this,
                        "model" => $this->model
                    ));
                    $this->router->all($rule);
                }
                
                parent::run($req, $res);
            
            } else {
                $this->response("There is no model associated with this controller.", $req, $res);
            }
            
        }
        // output (send result to the browser)
        public function response($content, $req, $res) {
            $res->send(view("layout.html", array(
                "javascript" => $req->fabrico->assets->get("javascript"),
                "stylesheet" => $req->fabrico->assets->get("css"),
                "title" => $this->title,
                "pageTitle" => $this->pageTitle,
                "mainNav" => view("mainnav.html", array(), "/views/".$this),
                "data" => $content
            ), "/views/".$this));
        }
        // other
        public function __toString() {
            return "Controller";
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
        private function getModel($req) {
            if($this->config !== false && isset($this->config->modelToAdministrate)) {
                $model = $req->fabrico->models->get($this->config->modelToAdministrate);
                $modelFields = $model->getFields();
                foreach($modelFields as $modelField) {
                    $defined = false;
                    foreach($this->config->fields as $configField) {
                        if($configField->name === $modelField->name) {
                            $defined = true;
                            foreach($configField as $key => $value) {
                                $modelField->$key = $value;
                            }
                        }
                    }
                    if(!$defined) {
                        $modelField->presenter = "presenters/Text.php";
                    }
                }
                return $model;
            }
            return false;
        }
    
    }

?>