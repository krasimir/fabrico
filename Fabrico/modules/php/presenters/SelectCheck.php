<?php

    /*
    
    {
        "name": "category",
        "presenter": "presenters/SelectCheck.php",
        "config": {
            "options": [
                {"key": "yes", "label": "answer Yes"},
                {"key": "no", "label": "answer No"},
                {"key": "maybe", "label": "answer Maybe"}
            ]
        }
    }
    
    */

    inject("presenters/Select.php");

    class SelectCheck extends Select {
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            if(!isset($this->config)) {
                throw new Exception($this.": missing config. Please check '".$this->name."'.");
            }
        }
        public function __toString() {
            return "SelectCheck";
        }
        public function listing($value) {
            $result = "";
            $arr = explode("|", $value);
            foreach($arr as $arrValue) {
                if($arrValue != "") {
                    foreach($this->config->options as $option) {
                        if($option->key == $arrValue) {
                            $result .= $option->label."<br />";
                        }
                    }
                    
                }
            }
            $this->response = $result;
            return $this;
        }
        public function add($default = null) {
            $boxes = "";
            $defaultArr = $default != null ? explode("|", $default) : array();
            foreach($this->config->options as $option) {
                $boxes .= $this->view("box.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "name" => $this->name."_".$option->key,
                    "checked" => in_array($option->key, $defaultArr) ? 'checked="checked"' : ""
                ));
            }
            $this->response = $this->view("adding.html", array(
                "boxes" => $boxes
            ));
            return $this;
        }
        public function addAction() {
            $result = "";
            foreach($this->config->options as $option) {
               if(isset($this->req->body->{strtolower($this->name."_".$option->key)})) {
                    $result .= $this->req->body->{strtolower($this->name."_".$option->key)}."|";
                }
            }
            $this->response = $result;
            return $this;
        }
        public function editAction($value) {
           $this->response = $this->addAction()->response->value;
           return $this;
        }
    
    }
    
?>