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

    require_once("presenters/Presenter.php");

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
            foreach($this->config->options as $option) {
                if($option->key == $value) {
                    return $option->label;
                }
            }
            return $value;
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
            return $this->view("adding.html", array(
                "field" => $this->name,
                "options" => $options
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
            return $this->add($value);
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