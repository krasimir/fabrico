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
            /*var_dump($this->config->paths);
            var_dump(ROOT_UNIT);die('');*/
            ViewConfig::config(array(
                "root" => ROOT_UNIT,
                "searchIn" => $this->config->paths
            ));
            forEachView($req->fabrico->paths);
            forEachView($this->config->forEachView);
        }
    }
?>