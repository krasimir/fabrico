<?php

    require_once("tools/view.php");

    class Action {
    
        public $fieldsMap = array();
        public $fieldsToIgnore = array();
    
        protected $controller;
        protected $fields = array();
        protected $req;
        protected $res;
        
        public $events;
        
        public function __construct($controller) {
            $this->controller = $controller;
            $this->fieldsMap = isset($this->controller->fieldsMap) ? $this->controller->fieldsMap : array();
            $this->events = (object) array();
        }
        public function run($req, $res) {
            $this->req = $req;
            $this->res = $res;
            // getting the fields of the table
            $this->fields = R::getColumns($this->controller->table);
        }
        public function __toString() {
            return "Action";
        }
        public function view($template, $data = array()) {
            $searchIn = array();
            $searchIn []= $this->controller."/".$this;
            $searchIn []= ViewConfig::$searchIn[count(ViewConfig::$searchIn)-1]."/".$this;
            return view($template, $data, $searchIn);
        }
    
    }

?>