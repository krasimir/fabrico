<?php

    /*
    
    The following configuration could be added in /config/config.json:
    "workers": {
        [your custom key here]: {
            "showsTime" => "false",
            "formatWithoutTime" => "%Y-%m-%d",
            "formatWithTime" => "%Y-%m-%d %H-%M"
        }
    }
    
    */

    require_once("workers/Text.php");

    class Date extends Text {
    
        protected $settings;
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            $this->settings = (object) array(
                "showsTime" => "false",
                "formatWithoutTime" => "%Y-%m-%d",
                "formatWithTime" => "%Y-%m-%d %H-%M"
            );
        }
        public function __toString() {
            return "Date";
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
            return $this->view("view.html", array(
                "field" => $this->field,
                "value" => $default != null ? $default : $this->getCurrentDate(),
                "showsTime" => $this->settings->showsTime,
                "format" => $this->settings->showsTime == "true" ? $this->settings->formatWithTime : $this->settings->formatWithoutTime
            ));
        }
        public function edit($value) {
            return $this->add($value);
        }
        private function getCurrentDate() {
            if($this->settings->showsTime == "true") {
                $str = $this->settings->formatWithTime;  
            } else {
                $str = $this->settings->formatWithoutTime;
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