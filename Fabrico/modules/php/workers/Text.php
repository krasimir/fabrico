<?php

    require_once("workers/Worker.php");

    class Text extends Worker {
        
        public function __toString() {
            return "Text";
        }
        public function listing($value) {
            return $value;
        }
        public function add() {
            return $this->view("view.html", array(
                "field" => $this->field,
                "value" => ""
            ));
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->field)})) {
                return $this->req->body->{strtolower($this->field)};
            } else {
                return null;
            }
        }
        public function edit($value) {
            return $this->view("view.html", array(
                "field" => $this->field,
                "value" => $value
            ));
        }
        public function editAction($value) {
            if(isset($this->req->body->{strtolower($this->field)})) {
                return $this->req->body->{strtolower($this->field)};
            } else {
                return null;
            }
        }
    
    }
    
?>