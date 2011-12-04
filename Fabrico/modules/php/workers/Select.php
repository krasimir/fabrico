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

    require_once("workers/Worker.php");

    class Select extends Worker {
        
        public function __toString() {
            return "Select";
        }
        public function listing($value) {
            $config = $this->getConfig();
            foreach($config->options as $option) {
                if($option->key == $value) {
                    return $option->label;
                }
            }
            return $value;
        }
        public function add($default = null) {
            $options = "";
            $config = $this->getConfig();
            foreach($config->options as $option) {
                $options .= $this->view("option.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "selected" => $default == $option->key ? 'selected="selected"' : ""
                ));
            }
            return $this->view("adding.html", array(
                "field" => $this->field,
                "options" => $options
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
            return $this->add($value);
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