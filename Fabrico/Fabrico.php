<?php

    /**
    * The root path of Fabrico's files.
    */
    define("FABRICO_ROOT", dirname(__FILE__));
    
    require(FABRICO_ROOT."/modules/php/tools/Injector.php");
    /**
    * Instance of Injector class.
    * @see Injector
    */
    $fabricoInjector = new Injector();
    $fabricoInjector->setRoot(FABRICO_ROOT);
    
    /**
    * Global function for injecting files. Replacement of php's require.
    * @package Fabrico
    */
    function inject($args) {
        global $fabricoInjector;
        return $fabricoInjector->inject($args);
    }
    
    inject(array(
        "tools/ErrorHandler.php",
        "tools/view.php",
        "Middleware.php",
        "Request.php",
        "Response.php",
        "middleware/Router.php"
    ));
    
    /**
    * Setup error handler callback.
    * @package Fabrico
    */
    $ERROR_HANDLER_CONTROLLER = "pages/Error.php";
    
    /**
    * Configure the views
    * @package Fabrico
    */
    ViewConfig::config(array(
        "root" => FABRICO_ROOT."/views/",
        "searchIn" => "Default"
    ));
    
    /**
     * Main class of Fabrico.
     * @package Fabrico
     */
    class Fabrico extends Middleware {
        
        public function __construct($configFile = "/config/config.json", $req = null, $res = null) {
        
            // setup middleware
            $this->using(array(
                // it stores the configurations and also setup redbean
                "benchmark" => "middleware/Benchmark.php",
                // it stores the configurations and also setup redbean
                "config" => "tools/JSONConfig.php",
                // read and construct the current application's models
                "models" => "middleware/ModelsManager.php",
                // debugging
                "debug" => "middleware/Debug.php",
                // $request->body will be parsed to object if incoming request is POST or PUT
                "bodyParser" => "middleware/BodyParser.php",
                // taking care for the assets
                "assets" => "middleware/AssetsManager.php",
                // control the access
                "access" => "middleware/Access.php",
                // setting the routes
                "routes" => "Routes.php",
                // router
                "router" => "middleware/Router.php"
            ));
            
            // Fabrico's configuration
            $this->config->source(array(
                "fabrico" => FABRICO_ROOT.$configFile
            ));
            
            // setting the Fabrico's credentials
            $this->access->setCredentials(
                $this->config->get("fabrico.access.user"), 
                $this->config->get("fabrico.access.pass")
            );
            
            // the ModelsManager uses the path to find the models' json files
            $this->models->root = FABRICO_ROOT;
            
            // assets configuration
            $this->assets->root = FABRICO_ROOT;
            $this->assets->using("Assets.php");
            
    
            $this->run($req, $res);
            
        }
        public function run($req, $res) {
        
            if($req == null) { $req = new Request(); }
            if($res == null) { $res = new Response(); }
            
            $this->root = (object) array(
                "http" => $req->host.($req->base == "/" ? "" : $req->base).$this->config->get("fabrico.paths.http"),
                "httpFiles" => $req->host.($req->base == "/" ? "" : $req->base).$this->config->get("fabrico.paths.files"),
                "files" => FABRICO_ROOT
            );
        
            // enable debug mode if ?debug=1
            $this->debug->enable = isset($req->params["debug"]) && $req->params["debug"] == 1;
            
            // showing benchmark information if fabrico is in debug mode
            if($this->debug->enable) {
                $res->beforeExitHandler = array((object) array("obj" => $this, "method" => "onExit"));
            }
            
             // setting a pointer to the fabrico
            $req->fabrico = $this;
            
            // running middleware
            parent::run($req, $res);
            
        }
        private function onExit() {
            var_dump("Benchmark: ".$this->benchmark->elpasedTime());
            foreach($this->models->models as $model) {
                $model->report();
            }
        }
    
    }

?>