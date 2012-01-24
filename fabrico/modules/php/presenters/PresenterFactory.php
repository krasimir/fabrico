<?php

    /**
    * @package Fabrico\Modules\Presenters
    */
    class PresenterFactory {
        
        public static function get($field, $properties = array()) {
        
            $parts = explode("/", $field->presenter);
            $presenterName = str_replace(".php", "", array_pop($parts));
            
            foreach($properties as $key => $value) {
                $field->$key = $value;
            }
            
            inject($field->presenter);
            $presenter = new $presenterName($field);
            
            if(defined("DEBUG") && DEBUG) {
                PresenterFactory::log("presenter: ".$field->presenter, "#FFD9FF");
            }
            
            return $presenter;
        }
        private static function log($str, $color) {
            echo '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
        }
    
    }

?>