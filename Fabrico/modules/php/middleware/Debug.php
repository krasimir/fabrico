<?php
    
    inject("tools/RedBean.php");
    inject("tools/view.php");
    inject("presenters/Presenter.php");

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