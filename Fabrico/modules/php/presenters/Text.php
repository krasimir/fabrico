<?php

    inject("presenters/Presenter.php");

    /**
    * @package Fabrico\Modules\Presenters
    */
    class Text extends Presenter {
        
        public function __toString() {
            return "Text";
        }
        public function listing($value) {
            $this->response = $value;
            return $this;
        }
        public function add($default = null) {
            $this->response = $this->view("view.html", array(
                "field" => $this->name,
                "value" => $default === null ? "" : $default
            ));
            return $this;
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->name)})) {
                $this->response = $this->req->body->{strtolower($this->name)};
            } else {
                $this->response = null;
            }
            return $this;
        }
        public function edit($value) {
            $this->response = $this->view("view.html", array(
                "field" => $this->name,
                "value" => $value
            ));
            return $this;
        }
        public function editAction($value) {        
            if(isset($this->req->body->{strtolower($this->name)})) {
                $this->response = $this->req->body->{strtolower($this->name)};
            } else {
                $this->response = null;
            }
            return $this;
        }
    
    }
    
?>