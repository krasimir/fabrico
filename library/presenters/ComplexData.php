<?php

    inject("presenters/Presenter.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "nameField",
        \t"presenter": "presenters/ComplexData.php",
        \t"config": {
            \t\t"elementsSeparator": "(!~~~^)",
            \t\t"elementsFieldsSeparator": "(@!!!%)",
            \t\t"fields": [
                \t\t\t{
                    \t\t\t\t"name": "name",
                    \t\t\t\t"label": "Name of your field"
                \t\t\t},
                \t\t\t...
                \t\t\t...
            \t\t]
        \t},
        \t"label": "[string]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optional
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
    class ComplexData extends Presenter {
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            $this->config->elementsSeparator = isset($this->config->elementsSeparator) ? $this->config->elementsSeparator : "(!~~~^)";
            $this->config->elementsFieldsSeparator = isset($this->config->elementsFieldsSeparator) ? $this->config->elementsFieldsSeparator : "(@!!!%)";
        }
        public function __toString() {
            return "ComplexData";
        }
        public function listing($value) {
            if($value != "") {
                $arr1 = explode($this->config->elementsSeparator, $value);
                $result = '';
                foreach($arr1 as $element) {
                    $arr2 = explode($this->config->elementsFieldsSeparator, $element);
                    foreach($arr2 as $field) {
                        $result .= $field." / ";
                    }
                    $result .= '<br />';
                }
                $this->setResponse($result);
            } else {
                $this->setResponse("");
            }
            return $this;
        }
        public function add($default = null) {
            $this->setResponse($this->view("view.html", array(
                "field" => $this->name,
                "value" => $default === null ? (isset($this->defaultValue) ? $this->defaultValue : "") : $default,
                "config" => json_encode($this->config),
                "label" => isset($this->label) ? $this->label : $this->name
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
            $this->setResponse($this->view("view.html", array(
                "field" => $this->name,
                "value" => $value,
                "config" => json_encode($this->config),
                "label" => isset($this->label) ? $this->label : $this->name
            )));
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