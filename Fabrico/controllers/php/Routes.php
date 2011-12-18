<?php    

    class Routes {
        
        private $router;

        public function __construct($router){
            $this->router = $router;
        }
        public function run($req, $res) {
        
            // setting routes from the config.json
            $routes = $req->fabrico->config->get("fabrico.routes");
            foreach($routes as $route) {
                $rule = new RouterRule(array(
                    "pattern" => $route->url,
                    "handler" => $route->controller,
                    "action" => isset($route->action) ? $route->action : "run",
                    "priority" => isset($route->priority) ? $route->priority : false,
                    "model" => isset($route->model) ? $route->model : null,
                ));
                $this->router->all($rule);
            }
            
            // if the user is not logged in show the login page
            if(!$req->fabrico->access->logged) {
                $this->router->removeAllRoutes();
                $this->router->all(new RouterRule(array("pattern" => "(.*)?", "handler" => "pages/Login.php")));
            }
            
            //var_dump($this->router->getAllRules());die("");
            
        }
    }
    
    
?>