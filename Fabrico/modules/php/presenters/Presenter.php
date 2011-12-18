<?php

    class Presenter {
        
        public function __construct($properties = array()) {
            foreach($properties as $prop => $value) {
                $this->$prop = $value;
            }
        }
        public function __toString() {
            return "Presenter";
        }
        public function listing($value) {
            return $value;
        }
        public function add() {
            return "";
        }
        public function addAction() {
            return "";
        }
        public function edit($value) {
            return "";
        }
        public function editAction($value) {
            return "";
        }
        public function deleteAction($value) {
            return false;
        }
        public function view($template, $data) {
            $searchIn = array();
            $searchIn []= $this->model->name."/".$this->name;
            $searchIn []= $this->controller."/".$this->model->name."/".$this->name;
            $searchIn []= $this->controller."/".$this."/".$this->name;
            $searchIn []= $this->controller."/".$this;
            $searchIn []= ViewConfig::$searchIn[count(ViewConfig::$searchIn)-1]."/".$this;
            return view($template, $data, $searchIn);
        }
        
    }
    
    class PresenterFactory {
    
        private static $enableDebug = false;
        
        public static function get($field, $properties = array()) {
        
            $parts = explode("/", $field->presenter);
            $presenterName = str_replace(".php", "", array_pop($parts));
            
            foreach($properties as $key => $value) {
                $field->$key = $value;
            }
            
            require_once($field->presenter);
            $presenter = new $presenterName($field);
            
            if(self::$enableDebug) {
                var_dump("presenter: ".$field->presenter);
            }
            
            return $presenter;
        }
        public static function debug($value) {
            self::$enableDebug = $value;
        }
    
    }

?>