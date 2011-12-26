<?php
    
    inject(array(
        "tools/RedBean.php",
        "tools/view.php",
        "presenters/Presenter.php"
    ));

    /**
    * @package Fabrico\Modules\Middleware
    */
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
            
            // showing all the loaded workers
            PresenterFactory::debug($this->enable);
            
        }
    }


?>