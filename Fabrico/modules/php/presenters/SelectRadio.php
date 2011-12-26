<?php

    inject("presenters/Select.php");

    /**
    * Configuration:
    * <code><pre>
    * {
    *    &nbsp;&nbsp;&nbsp;&nbsp;"name": "category",
    *    &nbsp;&nbsp;&nbsp;&nbsp;"presenter": "presenters/SelectRadio.php",
    *    &nbsp;&nbsp;&nbsp;&nbsp;"config": {
    *        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"options": [
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"key": "yes", "label": "answer Yes"},
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"key": "no", "label": "answer No"},
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"key": "maybe", "label": "answer Maybe"}
    *        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]
    *    &nbsp;&nbsp;&nbsp;&nbsp;}
    * }
    * </pre></code>
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