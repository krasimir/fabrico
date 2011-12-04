<?php

    require_once("Middleware.php");
    require_once("middleware/Router.php");

    class Page extends Middleware {
        
        private $defaultRoutes;
        private $routes = null;
        
        public $url = "";
        public $table = "";
        public $defaultController = "actions/Listing.php";
        
        public function __construct($options = array()) {
        
            // adding options
            foreach($options as $option => $value) {
                $this->$option = $value;
            }
            
            // default routes
            $this->defaultRoutes = array(
                // showing data from the database
                $this->url."/listing" => "actions/Listing.php",
                // adding data from the database
                $this->url."/adding" => "actions/Adding.php",
                // editing data from the database
                $this->url."/editing/@id" => "actions/Editing.php",
                // deleting data from the database
                $this->url."/deleting/@id" => "actions/Deleting.php",
                // ordering
                $this->url."/ordering/@type/@id" => "actions/Ordering.php",
                // default route
                $this->url."(.*)?" => $this->defaultController
            );
            
            // adding custom routes if any
            if(isset($this->routes)) {
                foreach($this->defaultRoutes as $route => $path) {
                    if(!isset($this->routes[$route])) {
                        $this->routes[$route] = $path;
                    }
                }
            } else {
                $this->routes = $this->defaultRoutes;
            }
            
            // setup middleware
            $this->using(array(
                "router" => "middleware/Router.php"
            ));
            
            // passing a pointer to this controller in the router
            $this->router->controller = $this;
            
            // setup routes
            foreach($this->routes as $pattern => $controller) {
                $this->router->all($pattern, $controller);
            }
            
        }
        public function __toString() {
            return "Default";
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
    }

?>