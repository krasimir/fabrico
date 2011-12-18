<?php

    /*
    
    {
        "name": "category",
        "presenter": "presenters/SelectRadio.php",
        "config": {
            "options": [
                {"key": "yes", "label": "answer Yes"},
                {"key": "no", "label": "answer No"},
                {"key": "maybe", "label": "answer Maybe"}
            ]
        }
    }
    
    */

    require_once("presenters/Select.php");

    class SelectRadio extends Select {
        
        public function __toString() {
            return "SelectRadio";
        }
        public function add($default = null) {
            $options = "";
            foreach($this->config->options as $option) {
                $options .= $this->view("option.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "field" => $this->name,
                    "checked" => $default == $option->key ? 'checked="checked"' : ""
                ));
            }
            return $this->view("adding.html", array(
                "field" => $this->name,
                "options" => $options
            ));
        }
    
    }
    
?>