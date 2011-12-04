<?php
    
    require_once("tools/RedBean.php");
    require_once("tools/view.php");
    require_once("workers/Worker.php");

    class Debug {
    
        public $enable = false;
    
        public function __construct($adminer) {
            
        }
        public function run($req, $res) {
            $this->status($this->enable);
        }
        public function status($value) {
                
            $this->enable = $value;
            
            // showing all the loaded views
            ViewConfig::config(array("debug" => $this->enable));
            
            // showing all the db queries
            R::debug($this->enable);
            
            // showing all the loaded workers
            WorkerFactory::debug($this->enable);
            
        }
    }


?>