<?php

    inject("presenters/Select.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "category",
        \t"presenter": "presenters/SelectRadio.php",
        \t"config": {
            \t\t"options": [
                \t\t\t{"key": "yes", "label": "answer Yes"},
                \t\t\t{"key": "no", "label": "answer No"},
                \t\t\t{"key": "maybe", "label": "answer Maybe"}
            \t\t]
        \t},
        \t"label": "[string]", // optional
        \t"defaultValue": "[key]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optional
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
    class SelectRadio extends Select {
        
        public function __toString() {
            return "SelectRadio";
        }
        public function add($default = null) {
            $options = "";
            $default = $default == null ? (isset($this->defaultValue) ? $this->defaultValue : null) : $default;
            foreach($this->config->options as $option) {
                $options .= $this->view("option.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "field" => $this->name,
                    "checked" => $default == $option->key ? 'checked="checked"' : ""
                ));
            }
            $this->setResponse($this->view("adding.html", array(
                "field" => $this->name,
                "options" => $options
            )));
            return $this;
        }
    
    }
    
?>