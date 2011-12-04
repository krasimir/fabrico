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

    require_once("workers/Text.php");

    class TextRich extends Text {
    
        protected $settings;
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            $this->settings = (object) array(
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
        }
        public function __toString() {
            return "TextRich";
        }
        public function listing($value) {
            $value = strip_tags($value);
            if(strlen($value) > 300) {
                return substr($value, 0, 300)."...";
            } else {
                return $value;
            }
        }
        public function add($default = null) {
            $config = $this->getConfig();
            foreach($this->settings as $key => $value) {
                if($config != null) {
                    if(isset($config->$key)) {
                        $this->settings->$key = $config->$key;
                    }
                }
            }
            $this->settings->swfURL = $this->req->fabrico->root->httpFiles.$this->settings->swfURL;
            return $this->view("view.html", array(
                "settings" => json_encode($this->settings),
                "field" => $this->field,
                "value" => $default != null ? $default : ""
            ));
        }
        public function edit($value) {
            return $this->add(addslashes($value));
        }
    
    }
    
?>