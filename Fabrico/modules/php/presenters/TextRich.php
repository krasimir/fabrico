<?php

    /*
    
    The following configuration could be added in /config/config.json:
    "workers": {
        [your custom key here]: {
            "swfURL": "/assets/swf/wysiwyg/bin/swf/Project.swf",
            "fontFamily": "no",
            "bullets": "no",
            "linkInput": "yes",
            "fontSize": "no",
            "colorPicker": "no",
            "alignButtons": "no",
            "bold": "yes",
            "italic": "yes",
            "underline": "yes"
        }
    }
    
    */

    inject("presenters/Text.php");

    class TextRich extends Text {
    
        protected $settings;
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            if(!isset($this->config)) {
                $this->config = (object) array(
                    "swfURL" => "/assets/swf/wysiwyg/bin/swf/Project.swf",
                    "fontFamily" => "no",
                    "bullets" => "no",
                    "linkInput" => "yes",
                    "fontSize" => "no",
                    "colorPicker" => "no",
                    "alignButtons" => "no",
                    "bold" => "yes",
                    "italic" => "yes",
                    "underline" => "yes"
                );
            } else {
                $this->config->swfURL = isset($this->config->swfURL) ? $this->config->swfURL : "/assets/swf/wysiwyg/bin/swf/Project.swf";
                $this->config->fontFamily = isset($this->config->fontFamily) ? $this->config->fontFamily : "no";
                $this->config->bullets = isset($this->config->bullets) ? $this->config->bullets : "no";
                $this->config->linkInput = isset($this->config->linkInput) ? $this->config->linkInput : "yes";
                $this->config->fontSize = isset($this->config->fontSize) ? $this->config->fontSize : "no";
                $this->config->colorPicker = isset($this->config->colorPicker) ? $this->config->colorPicker : "no";
                $this->config->alignButtons = isset($this->config->alignButtons) ? $this->config->alignButtons : "no";
                $this->config->bold = isset($this->config->bold) ? $this->config->bold : "yes";
                $this->config->italic = isset($this->config->italic) ? $this->config->italic : "yes";
                $this->config->underline = isset($this->config->underline) ? $this->config->underline : "yes";
            }
        }
        public function __toString() {
            return "TextRich";
        }
        public function listing($value) {
            $value = strip_tags($value);
            if(strlen($value) > 300) {
                $this->response = substr($value, 0, 300)."...";
            } else {
                $this->response = $value;
            }
            return $this;
        }
        public function add($default = null) {
            $this->config->swfURL = $this->req->fabrico->root->httpFiles.$this->config->swfURL;
            $this->response = $this->view("view.html", array(
                "settings" => json_encode($this->config),
                "field" => $this->name,
                "value" => $default != null ? $default : ""
            ));
            return $this;
        }
        public function edit($value) {
            $this->response = $this->add(addslashes($value))->response->value;
            return $this;
        }
    
    }
    
?>