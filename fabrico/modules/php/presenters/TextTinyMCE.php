<?php

    inject("presenters/Text.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "description",
        \t"presenter": "presenters/TextTinyMCE.php",
        \t"config": {
            \t\t"mode" : "textareas",
            \t\t"theme" : "[simple|advanced]",
            \t\t"theme_advanced_buttons1": "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,formatselect",
            \t\t"theme_advanced_buttons2": "cut,copy,paste,pastetext,pasteword,|,bullist,numlist,|,outdent,indent,blockquote",
            \t\t"theme_advanced_buttons3": "search,replace",
            \t\t"theme_advanced_buttons4": ""
            \t\t... 
        \t},
        \t"label": "[string]", // optional
        \t"defaultValue": "[string]", // optional
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optiona
    }
    </pre>
    <br /><br />Check <a href="http://www.tinymce.com/">http://www.tinymce.com/</a> for more options
    * @package Fabrico\Modules\Presenters
    */
    class TextTinyMCE extends Text {
    
        protected $settings;
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            if(!isset($this->config)) {
                $this->config = (object) array(
                    "mode" => "textareas",
                    "theme" => "simple"
                );
            } else {
                $this->config->mode = isset($this->config->mode) ? $this->config->mode : "textareas";
                $this->config->theme = isset($this->config->theme) ? $this->config->theme : "simple";
            }
        }
        public function __toString() {
            return "TextTinyMCE";
        }
        public function listing($value) {
            $value = strip_tags($value);
            if(strlen($value) > 300) {
                $this->setResponse(substr($value, 0, 300)."...");
            } else {
                $this->setResponse($value);
            }
            return $this;
        }
        public function add($default = null) {
            $this->setResponse($this->view("view.html", array(
                "settings" => json_encode($this->config),
                "field" => $this->name,
                "value" => $default != null ? $default : (isset($this->defaultValue) ? $this->defaultValue : "")
            )));
            return $this;
        }
        public function edit($value) {
            $this->setResponse($this->add(addslashes($value))->response->value);
            return $this;
        }
    
    }
    
?>