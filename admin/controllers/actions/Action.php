<?php

    inject(array(
        "utils/view.php",
        "presenters/PresenterFactory.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages\Actions
    */
    class Action {
    
        protected $controller;
        protected $model;
        protected $fields = array();
        protected $req;
        protected $res;
        protected $fieldsJson;
        
        public function __construct($router) {
            $this->controller = $router->matchedRule->controller;
            $this->model = $router->matchedRule->model;
            $this->fieldsJson = json_encode($this->model->fields);
        }
        public function run($req, $res) {
            $this->req = $req;
            $this->res = $res;
        }
        public function __toString() {
            return "Action";
        }
        public function view($template, $data = array()) {
            $searchIn = array();
            $searchIn []= "/views/".$this->model->name."/".$this;
            $searchIn []= "/views/".$this->controller."/".$this;
            $searchIn []= ViewConfig::$searchIn[count(ViewConfig::$searchIn)-1]."/".$this;
            return view($template, $data, $searchIn);
        }
        protected function getPresenter($field) {
            $properties = array(
                "controller" => $this->controller,
                "model" => $this->model,
                "req" => $this->req,
                "res" => $this->res
            );
            return PresenterFactory::get($field, $properties);
        }
    
    }

?>