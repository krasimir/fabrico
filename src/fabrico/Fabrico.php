<?php

    class Fabrico {

        private $paths;
        private $coreModules;
        
        public function __construct() {
            $this->paths = (object) array(
                "fabricoRoot" => dirname(__FILE__)."/",
                "appRoot" => dirname(isset($_SERVER["SCRIPT_FILENAME"]) ? $_SERVER["SCRIPT_FILENAME"] : "")."/"
            );
            $this->coreModules = array(
                (object) array(
                    "name" => "ErrorHandler"
                ),
                (object) array(
                    "name" => "Router"
                ),
                (object) array(
                    "name" => "View"
                )
            );
            $this->initialize($this->coreModules);
        }

        public function initialize($modules) {
            if(!is_array($modules)) $modules = array($modules);
            foreach($modules as $module) {
                if(file_exists($this->paths->fabricoRoot."modules/".$module->name."/index.php")) {
                    require($this->paths->fabricoRoot."modules/".$module->name."/index.php");
                } else if(file_exists($this->paths->appRoot."modules/".$module->name."/index.php")) {
                    require($this->paths->appRoot."modules/".$module->name."/index.php");
                } else {
                    throw new Exception("Missing module '".$module->name."'!");
                }
            }
        }
        
    }

?>