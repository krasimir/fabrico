<?php

    inject("presenters/Select.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "category",
        \t"presenter": "presenters/SelectCheck.php",
        \t"config": {
            \t\t"options": [
                \t\t\t{"key": "yes", "label": "answer Yes"},
                \t\t\t{"key": "no", "label": "answer No"},
                \t\t\t{"key": "maybe", "label": "answer Maybe"}
            \t\t]
        \t},
        \t"label": "[string]", // optional
        \t"defaultValue": "[key|key|...]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optional
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
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
            $this->setResponse($result);
            return $this;
        }
        public function add($default = null) {
            $boxes = "";
            $default = $default == null ? isset($this->defaultValue) ? $this->defaultValue : array() : $default;
            $defaultArr = $default != null ? explode("|", $default) : array();
            foreach($this->config->options as $option) {
                $boxes .= $this->view("box.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "name" => $this->name."_".$option->key,
                    "checked" => in_array($option->key, $defaultArr) ? 'checked="checked"' : ""
                ));
            }
            $this->setResponse($this->view("adding.html", array(
                "boxes" => $boxes
            )));
            return $this;
        }
        public function addAction() {
            $result = "";
            foreach($this->config->options as $option) {
               if(isset($this->req->body->{strtolower($this->name."_".$option->key)})) {
                    $result .= $this->req->body->{strtolower($this->name."_".$option->key)}."|";
                }
            }
            $this->setResponse($result);
            return $this;
        }
        public function editAction($value) {
           $this->setResponse($this->addAction()->response->value);
           return $this;
        }
    
    }
    
?>