<?php

    /*
    
    The following configuration must be added in /config/config.json:
    "workers": {
        [your custom key here]: {
            "options": [
                {"key": "[your key]", "label": "[your text/description]"},
                {"key": "[your key]", "label": "[your text/description]"},
                {"key": "[your key]", "label": "[your text/description]"}
            ]
        }
    }
    
    */

    require_once("workers/Select.php");

    class SelectCheck extends Select {
        
        public function __toString() {
            return "SelectCheck";
        }
        public function listing($value) {
            $result = "";
            $arr = explode("|", $value);
            foreach($arr as $arrValue) {
                if($arrValue != "") {
                    $result .= $arrValue."<br />";
                }
            }
            return $result;
        }
        public function add($default = null) {
            $boxes = "";
            $config = $this->getConfig();
            $defaultArr = $default != null ? explode("|", $default) : array();
            foreach($config->options as $option) {
                $boxes .= $this->view("box.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "name" => $this->field."_".$option->key,
                    "checked" => in_array($option->key, $defaultArr) ? 'checked="checked"' : ""
                ));
            }
            return $this->view("adding.html", array(
                "boxes" => $boxes
            ));
        }
        public function addAction() {
            $config = $this->getConfig();
            $result = "";
            foreach($config->options as $option) {
               if(isset($this->req->body->{strtolower($this->field."_".$option->key)})) {
                    $result .= $this->req->body->{strtolower($this->field."_".$option->key)}."|";
                }
            }
            return $result;
        }
        public function editAction($value) {
            return $this->addAction();
        }
    
    }
    
?>