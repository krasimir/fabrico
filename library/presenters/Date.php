<?php

    inject("presenters/Text.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "date",
        \t"presenter": "presenters/Date.php",
        \t"config": {
            \t\t"showsTime": true
        \t},
        \t"label": "[string]", // optional
        \t"defaultValue": "[string]", // optional,
        \t"dependencies": [dependencies], // optional
        \t"validators": [validators] // optional
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
    class Date extends Text {
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            if(!isset($this->config)) {
                $this->config = (object) array(
                    "showsTime" => "false"
                );
            } else {
                $this->config->showsTime = isset($this->config->showsTime) ? $this->config->showsTime : "false";
            }
            $this->config->formatWithoutTime = "%Y-%m-%d";
            $this->config->formatWithTime = "%Y-%m-%d %H:%M";
        }
        public function __toString() {
            return "Date";
        }
        public function add($default = null) {
            $this->setResponse($this->view("view.html", array(
                "field" => $this->name,
                "value" => $default != null ? $default : (isset($this->defaultValue) ? $this->defaultValue : $this->getCurrentDate()),
                "currentDate" => $this->getCurrentDate(),
                "showsTime" => $this->config->showsTime,
                "format" => $this->config->showsTime == "true" ? $this->config->formatWithTime : $this->config->formatWithoutTime
            )));
            return $this;
        }
        public function edit($value) {
            $this->setResponse($this->add($value)->response->value);
            return $this;
        }
        private function getCurrentDate() {
            if($this->config->showsTime == "true") {
                $str = $this->config->formatWithTime;  
            } else {
                $str = $this->config->formatWithoutTime;
            }
            $str = str_replace("%Y", date("Y"), $str);
            $str = str_replace("%m", date("m"), $str);
            $str = str_replace("%d", date("d"), $str);
            $str = str_replace("%H", date("H"), $str);
            $str = str_replace("%M", date("i"), $str);
            return $str;
        }
    
    }
    
?>