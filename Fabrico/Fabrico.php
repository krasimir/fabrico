<?php

    /** The root path of Fabrico's files. */
    define("FABRICO_ROOT", dirname(__FILE__));
    /** If ?debug=1 an additional information is shown on the page. */
    define("DEBUG_MODE", isset($_GET["debug"]) && $_GET["debug"] == 1);
    
    require(FABRICO_ROOT."/modules/php/utils/Injector.php");
    /**
    * Instance of Injector class.
    * @see Injector
    */
    $fabricoInjector = new Injector();
    $fabricoInjector->setRoot(FABRICO_ROOT."/../");
    
    /**
    * Global function for injecting files. Replacement of php's require.
    * @package Fabrico
    */
    function inject($args) {
        global $fabricoInjector;
        return $fabricoInjector->inject($args);
    }
    
    inject(array(
        "utils/ErrorHandler.php",
        "utils/view.php",
        "Middleware.php",
        "Request.php",
        "Response.php",
        "middleware/Router.php",
        "presenters/PresenterFactory.php"
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
    
        public $paths;
        public $benchmark;
        public $config;
        public $models;
        public $bodyParser;
        public $assets;
        public $access;
        public $routes;
        public $router;
        
        public function __construct($configFile = "/config/config.json", $req = null, $res = null) {
        
            // setup middleware
            $this->using(array(
                // it stores the configurations and also setup redbean
                "benchmark" => "middleware/Benchmark.php",
                // it stores the configurations
                "config" => "utils/JSONConfig.php",
                // read and construct the current application's models
                "models" => "middleware/ModelsManager.php",
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
            
            // showing benchmark information if fabrico is in debug mode
            if(DEBUG_MODE) {
                ViewConfig::config(array(
                    "debug" => true
                ));
                PresenterFactory::debug(true);
                $res->beforeExitHandler = array((object) array("obj" => $this, "method" => "onExit"));
                $this->router->debug = true;
                $this->assets->debug = true;
            }
            
            forEachView($this->paths = (object) array(
                "httpRoot" =>$req->host.($req->base == "/" ? "" : $req->base),
                "httpFabrico" =>$req->host.($req->base == "/" ? "" : $req->base).$this->config->get("fabrico.paths.http"),
                "httpFabricoFiles" =>$req->host.($req->base == "/" ? "" : $req->base).$this->config->get("fabrico.paths.files"),
                "filesRoot" =>FABRICO_ROOT."/../",
                "filesFabrico" => FABRICO_ROOT
            ));
            
            // setting a pointer to the fabrico
            $req->fabrico = $this;
            
            // running middleware
            parent::run($req, $res);
            
        }
        
        /**
        * Called if ?debug=1. Displays information Benchmark and ModelsManager information.
        */
        public function onExit() {
            global $fabricoInjector;
            foreach($this->models->models as $model) {
                $model->report();
            }
            $fabricoInjector->report("#E9E9E9");
            $this->log("Benchmark: ".$this->benchmark->elpasedTime(), "#D5D5FF");
        }
        
        private function log($str, $color) {
            echo '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
        }
    
    }

?>