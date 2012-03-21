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
                "root" => ROOT_UNIT,
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
                    $moduleClass = $moduleConfig->type.".php";
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