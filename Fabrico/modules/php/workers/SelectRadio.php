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

    class SelectRadio extends Select {
        
        public function __toString() {
            return "SelectRadio";
        }
        public function add($default = null) {
            $options = "";
            $config = $this->getConfig();
            foreach($config->options as $option) {
                $options .= $this->view("option.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "field" => $this->field,
                    "checked" => $default == $option->key ? 'checked="checked"' : ""
                ));
            }
            return $this->view("adding.html", array(
                "field" => $this->field,
                "options" => $options
            ));
        }
    
    }
    
?>