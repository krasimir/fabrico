<?php

    inject(array(
        "modules/Module.php"
    ));

    /**
    * @package Fabrico\Library\Modules
    */
    class Views extends Module {
    
        private $config;

        public function __construct($app){
            
        }
        public function init($config) {
            $this->config = $config;
        }
        public function run($req, $res) {
            inject(array("utils/view.php"));
            ViewConfig::config(array(
                "root" => ROOT_APP,
                "searchIn" => $this->config->paths
            ));
            forEachView($req->fabrico->paths);
            forEachView($this->config->forEachView);
        }
    }
?>