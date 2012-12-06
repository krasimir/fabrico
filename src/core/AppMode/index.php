<?php

    class AppMode {

        private static $mode;
        private static $default = "local";
        private static $matches = array();
    
        public static function get() {
            if(AppMode::$mode == null) {
                if(isset($_SERVER) && isset($_SERVER["HTTP_REFERER"])) {
                    $url = $_SERVER["HTTP_REFERER"];
                    foreach(AppMode::$matches as $match) {
                        if(strpos($url, $match->part) !== false) {
                            AppMode::$mode = $match->mode;
                            return AppMode::$mode;
                        }
                    }
                }
                AppMode::$mode = AppMode::$default;             
            } 
            return AppMode::$mode;
        }
        public static function set($part, $mode) {
            AppMode::$matches []= (object) array(
                "part" => $part,
                "mode" => $mode
            );
        }
        public static function clear() {
            AppMode::$mode = null;
            AppMode::$matches = array();
        }
        public static function setDefault($def) {            
            AppMode::$default = $def;
        }
        
    }

?>