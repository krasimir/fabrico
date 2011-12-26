<?php

    /*
    
    {
        "name": "category",
        "presenter": "presenters/Select.php",
        "config": {
            "options": [
                {"key": "yes", "label": "answer Yes"},
                {"key": "no", "label": "answer No"},
                {"key": "maybe", "label": "answer Maybe"}
            ]
        }
    }
    
    */

    inject("presenters/Presenter.php");

    class Select extends Presenter {
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            if(!isset($this->config)) {
                throw new Exception($this.": missing config. Please check '".$this->name."'.");
            }
        }
        public function __toString() {
            return "Select";
        }
        public function listing($value) {
            $found = false;
            foreach($this->config->options as $option) {
                if($option->key == $value) {
                    $found = true;
                    $this->response = $option->label;
                }
            }
            if(!$found) {
                $this->response = $value;
            }
            return $this;
        }
        public function add($default = null) {
            $options = "";
            foreach($this->config->options as $option) {
                $options .= $this->view("option.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "selected" => $default == $option->key ? 'selected="selected"' : ""
                ));
            }
            $this->response = $this->view("adding.html", array(
                "field" => $this->name,
                "options" => $options
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
            $this->response = $this->add($value)->response->value;
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