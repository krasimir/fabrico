<?php

    inject("presenters/Presenter.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "category",
        \t"presenter": "presenters/Select.php",
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
            $found = false;
            foreach($this->config->options as $option) {
                if($option->key == $value) {
                    $found = true;
                    $this->setResponse($option->label);
                }
            }
            if(!$found) {
                $this->setResponse($value);
            }
            return $this;
        }
        public function add($default = null) {
            $options = "";
            $default = $default == null ? (isset($this->defaultValue) ? $this->defaultValue : null) : $default;
            foreach($this->config->options as $option) {
                $options .= $this->view("option.html", array(
                    "key" => $option->key,
                    "label" => $option->label,
                    "selected" => $default == $option->key ? 'selected="selected"' : ""
                ));
            }
            $this->setResponse($this->view("adding.html", array(
                "field" => $this->name,
                "options" => $options
            )));
            return $this;
        }
        public function addAction() {
            if(isset($this->req->body->{strtolower($this->name)})) {
                $this->setResponse($this->req->body->{strtolower($this->name)});
            } else {
                $this->setResponse(null);
            }
            return $this;
        }
        public function edit($value) {
            $this->setResponse($this->add($value)->response->value);
            return $this;
        }
        public function editAction($value) {
            if(isset($this->req->body->{strtolower($this->name)})) {
                $this->setResponse($this->req->body->{strtolower($this->name)});
            } else {
                $this->setResponse(null);
            }
            return $this;
        }
    
    }
    
?>