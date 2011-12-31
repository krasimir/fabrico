<?php

    /**
    * @package Fabrico\Modules\Presenters
    */
    class PresenterFactory {
    
        private static $enableDebug = false;
        
        public static function get($field, $properties = array()) {
        
            $parts = explode("/", $field->presenter);
            $presenterName = str_replace(".php", "", array_pop($parts));
            
            foreach($properties as $key => $value) {
                $field->$key = $value;
            }
            
            inject($field->presenter);
            $presenter = new $presenterName($field);
            
            if(self::$enableDebug) {
                PresenterFactory::log("presenter: ".$field->presenter, "#FFD9FF");
            }
            
            return $presenter;
        }
        public static function debug($value) {
            self::$enableDebug = $value;
        }
        private static function log($str, $color) {
            echo '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
        }
    
    }

?>