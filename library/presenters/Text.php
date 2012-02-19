<?php

    inject("presenters/Presenter.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "nameField",
        \t"presenter": "presenters/Text.php",
        \t"label": "[string]", // optional
        \t"defaultValue": "[string]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optiona
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
    class Text extends Presenter {
        
        public function __toString() {
            return "Text";
        }
        public function listing($value) {
            $this->setResponse($value);
            return $this;
        }
        public function add($default = null) {
            $this->setResponse($this->view("view.html", array(
                "field" => $this->name,
                "value" => $default === null ? (isset($this->defaultValue) ? $this->defaultValue : "") : $default
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
                "value" => $value
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