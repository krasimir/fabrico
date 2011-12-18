<?php

    require_once("presenters/Presenter.php");

    class Text extends Presenter {
        
        public function __toString() {
            return "Text";
        }
        public function listing($value) {
            return $value;
        }
        public function add() {
            return $this->view("view.html", array(
                "field" => $this->name,
                "value" => ""
            ));
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->name)})) {
                return $this->req->body->{strtolower($this->name)};
            } else {
                return null;
            }
        }
        public function edit($value) {
            return $this->view("view.html", array(
                "field" => $this->name,
                "value" => $value
            ));
        }
        public function editAction($value) {        
            if(isset($this->req->body->{strtolower($this->name)})) {
                return $this->req->body->{strtolower($this->name)};
            } else {
                return null;
            }
        }
    
    }
    
?>