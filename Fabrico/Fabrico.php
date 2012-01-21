<?php

    inject(array(
        "utils/view.php",
        "Middleware.php",
        "middleware/Router.php",
        "presenters/PresenterFactory.php"
    ));
    
    /**
     * Main class of Fabrico.
     * @package Fabrico
     */
    class Fabrico extends Middleware {
    
        public $req;
        public $res;
        public $paths;
        
        /**
        * @param $configs Associative array
        <pre class="code">
        
        </pre>
        */
        public function __construct($configs) {
        
            // setting request and response
            $this->req = new Request();
            $this->res = new Response();
        
            // setting the root
            $this->paths = (object) array(
                "root" => defined("ROOT") && ROOT != NULL ? ROOT : dirname(__FILE__),
                "host" => $this->req->host,
                "slug" => $this->req->slug,
                "url" => $this->req->url
            );
            
            // ************************************************************************************** MODULES *** 
            
            // config
            if(isset($configs->adapters)) {
                $this->log("Fabrico creates module 'adapters'.", "#575757");
                $this->adapters = readJSON($this->paths->root.$configs->adapters);
            }
            
            // benchmark
            if(isset($configs->benchmark)) {
                $this->log("Fabrico creates module 'benchmark'.", "#575757");
                $this->using(array(
                    "benchmark" => "middleware/Benchmark.php",
                ));
            }
            
            // models
            if(isset($configs->models)) {
                $this->log("Fabrico creates module 'models'.", "#575757");
                $this->using(array(
                    "models" => "middleware/ModelsManager.php",
                ));
                $this->models->root = $this->paths->root.$configs->models;
            }
            
            // assets
            if(isset($configs->assets)) {
                $this->log("Fabrico creates module 'assets'.", "#575757");
                $this->using(array(
                    "assets" => "middleware/AssetsManager.php",
                ));
                $this->assets->root = $this->paths->root;
                $assets = $configs->assets;
                foreach($assets as $asset) {
                    $this->assets->add($asset);
                }
            }
            
            // models
            if(isset($configs->access)) {
                $this->log("Fabrico creates module 'access'.", "#575757");
                $this->using(array(
                    "access" => "middleware/Access.php",
                ));
                $this->access->setCredentials(
                    $configs->access->user, 
                    $configs->access->pass
                );
            }
            
            // router
            if(isset($configs->router)) {
                $this->log("Fabrico creates module 'router'.", "#575757");
                $this->using(array(
                    "router" => "middleware/Router.php",
                ));
                $routes = $configs->router;
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
            }
            
            // views
            if(isset($configs->views)) {
                $this->log("Fabrico creates module 'views'.", "#575757");
                inject(array("utils/view.php"));
                ViewConfig::config(array(
                    "root" => $this->paths->root,
                    "searchIn" => $configs->views
                ));
                forEachView($this->paths);
            }
    
            $this->run($this->req, $this->res);
            
        }
        public function run($req, $res) {
        
            if(isset($this->access) && !$this->access->isLogged($req) && isset($this->router)) {
                $this->router->removeAllRoutes();
                $this->router->all(new RouterRule(array(
                    "pattern" => "(.*)?", 
                    "handler" => "pages/Login.php"
                )));
            }
            
            // showing benchmark information if fabrico is in debug mode
            if(defined("DEBUG") && DEBUG) {
                $res->beforeExitHandler = array((object) array("obj" => $this, "method" => "onExit"));
            }
            
            // setting a pointer to the fabrico
            $this->req->fabrico = $this;
            
            // running middleware
            parent::run($this->req, $this->res);
            
        }
        /**
        * Called if ?debug=1. Displays information Benchmark and ModelsManager information.
        */
        public function onExit() {
            global $injector;
            if(isset($this->models)) {
                foreach($this->models->models as $model) {
                    $model->report();
                }
            }
            if(isset($injector)) {
                $injector->report("#E9E9E9");
            }
            if(isset($this->benchmark)) {
                $this->log("Benchmark: ".$this->benchmark->elpasedTime(), "#D5D5FF");
            }
            
        }
        private function log($str, $color) {
            if(defined("DEBUG") && DEBUG) {
                echo '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
            }
        }
    
    }

?>