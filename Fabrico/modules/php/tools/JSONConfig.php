<?php
class JSONConfig {

    private $data;
    
    public function __construct(){
        $this->data = new stdClass();
    }

    public function source($source) {      
        if(!is_array($source)) {
            $source = array($source);
        }
        foreach($source as $key => $path) {
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
            $current = $current->$part;
        }

        return $current;
    }
}
?>