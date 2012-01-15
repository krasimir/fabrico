<?php
    
    /**
     * Take cares for the main routing of Fabrico
     * @package Fabrico\Controllers\Utils
     */
    class Routes {
        
        public function run($req, $res) {
        
            $access = $req->fabrico->access;
            $router = $req->fabrico->router;
            $config = $req->fabrico->config;
        
            // if the user is not logged in show the login page
            if(!$access->isLogged()) {
                $paths = $config->get("fabrico.paths");
                $router->removeAllRoutes();
                $router->all(new RouterRule(array("pattern" => $paths->http."(.*)?", "handler" => "pages/Login.php")));
                
            // setting routes from the config.json
            } else {
                $routes = $config->get("fabrico.routes");
                foreach($routes as $route) {
                    $rule = new RouterRule(array(
                        "pattern" => $route->url,
                        "handler" => $route->controller,
                        "action" => isset($route->action) ? $route->action : "run",
                        "priority" => isset($route->priority) ? $route->priority : false,
                        "model" => isset($route->model) ? $route->model : null,
                    ));
                    $router->all($rule);
                }
            }
            
            //var_dump($router->getAllRules());
            
        }
    
    }

?>