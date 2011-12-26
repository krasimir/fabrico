<?php
    /**
    * @package Fabrico\Modules\Tools
    */
    class JSONConfig {

        public $data;
        
        public function __construct(){
            $this->data = new stdClass();
        }
        public function __toString() {
            return "JSONConfig";
        }
        public function source($source) {      
            if(!is_array($source)) {
                $source = array($source);
            }
            foreach($source as $key => $path) {
                if(!file_exists($path)) {
                    throw new Exception($this.": missing file '".$path."'.");
                }
                $this->data->{$key} = json_decode(file_get_contents($path));
            }
        }
        
        public function run($req, $res) {
            $req->config = $this;
        }
        public function get($key){

            $parts = explode(".", $key);
            $current = $this->data;
            foreach($parts as $part) {
                if(isset($current->$part)) {
                    $current = $current->$part;
                } else {
                    return null;
                }
            }

            return $current;
        }
        
    }
?>