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
        \t}
    }
    </pre>
    * @package Fabrico\Modules\Presenters
    */
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
            $this->response = $this->view("adding.html", array(
                "field" => $this->name,
                "options" => $options
            ));
            return $this;
        }
    
    }
    
?>