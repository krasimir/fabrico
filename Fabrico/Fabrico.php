<?php

    define("FABRICO_ROOT", dirname(__FILE__));

    // set include path
    require_once(FABRICO_ROOT."/modules/php/tools/IncludePath.php");
    IncludePath::add(FABRICO_ROOT."/modules/php");
    IncludePath::add(FABRICO_ROOT."/controllers/php");
    
     // setup error handler callback
    require_once("tools/ErrorHandler.php");
    require_once("pages/Error.php");
    $errorHandler = new ErrorHandler();
    $errorHandler->onError = function(Exception $e) {
        new Error($e);
    };
    
    // configure the views
    require_once("tools/view.php");
    ViewConfig::config(array(
        "root" => FABRICO_ROOT."/views/",
        "searchIn" => "Default"
    ));
    
    require_once("Middleware.php");
    require_once("Request.php");
    require_once("Response.php");
    
    class Fabrico extends Middleware {
        
        public function __construct($configFile = "/config/config.json") {
        
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
                // router of the adminer
                "router" => "middleware/Router.php"
            ));
            
            // Fabrico's configuration
            $this->config->source(array(
                "fabrico" => FABRICO_ROOT.$configFile
            ));
            
            // the ModelsManager uses the path to find the models' json files
            $this->models->root = FABRICO_ROOT;
            
            // setting the routes of fabrico
            $this->router->using("Routes.php");
            
            // assets configuration
            $this->assets->root = FABRICO_ROOT;
            $this->assets->using("Assets.php");           
            
        }
        public function run($req = null, $res = null) {
        
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
                $benchmark = $this->benchmark;
                $self = $this;
                $res->beforeExitHandler = function() use ($benchmark, $self) {
                    var_dump("Benchmark: ".$benchmark->elpasedTime());
                    foreach($self->models->models as $model) {
                        $model->report();
                    }
                };
            }
            
             // setting a pointer to the fabrico
            $req->fabrico = $this;
            
            // running middleware
            parent::run($req, $res);
            
        }        
    
    }

?>