<?php
    
    /**
     * Main class of Fabrico.
     * @package Fabrico
     */
    class Fabrico extends Middleware {
    
        public $req;
        public $res;
        public $paths;
        public $currentUser;
        public $usedModules;
        
        /**
        * @param $configs
        */
        public function __construct($modules) {
        
            // setting request and response
            $this->req = new Request();
            $this->res = new Response();
            
            $this->usedModules = (object) array();
        
            // setting the root
            $this->paths = (object) array(
                "root" => ROOT_APP,
                "host" => $this->req->host,
                "slug" => $this->req->slug,
                "url" => $this->req->url
            );
            
            foreach($modules as $module) {
                $moduleName = explode(".", basename($module));
                $moduleName = $moduleName[0];
                require($module);
                if(!function_exists($moduleName)) {
                    throw new Exception("Fabrico: missing '".$moduleName."()' method in '".$module."'."); 
                } else {
                    $moduleConfig = $moduleName();
                    if($moduleConfig === null) {
                        throw new Exception("Fabrico: wrong definition in  '".$module."'."); 
                    }
                    $moduleClass = "";
                    switch($moduleConfig->type) {
                        case "access": $moduleClass = "modules/Access.php"; break;
                        case "router": $moduleClass = "modules/Router.php"; break;
                        case "assets": $moduleClass = "modules/AssetsManager.php"; break;
                        case "adapters": $moduleClass = "modules/Adapters.php"; break;
                        case "models": $moduleClass = "modules/ModelsManager.php"; break;
                        case "benchmark": $moduleClass = "modules/Benchmark.php"; break;
                        case "views": $moduleClass = "modules/Views.php"; break;
                    }
                    if($moduleClass == "") {
                        throw new Exception("Fabrico: missing module class for type '".$moduleConfig->type."'."); 
                    } else {
                        $this->using(array(
                            $moduleName => $moduleClass,
                        ));
                        $this->$moduleName->init($moduleConfig);
                        $this->usedModules->$moduleName = $this->$moduleName;
                        $this->log("Module <strong>".basename($module)."</strong> initialized.", "#C0C0C0");
                    }
                }
            }
    
            $this->run($this->req, $this->res);
            
        }
        public function run($req, $res) {
        
            // setting a pointer to the fabrico
            $this->req->fabrico = $this;
            
            // showing benchmark information if fabrico is in debug mode
            if(defined("DEBUG") && DEBUG) {
                $res->beforeExitHandler = array((object) array("obj" => $this, "method" => "onExit"));
            }
            
            // running middleware
            parent::run($this->req, $this->res);
            
        }
        /**
        * Called if ?debug=1
        */
        public function onExit() {
        
            global $injector;
            if(isset($injector)) {
                $injector->report("#E9E9E9");
            }
        
            foreach($this->usedModules as $module) {
                $module->log();
            }
            
        }
        private function log($str, $color) {
            if(defined("DEBUG") && DEBUG) {
                echo '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
            }
        }
    
    }

?>