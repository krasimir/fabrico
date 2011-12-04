<?php
class BodyParser {
    public function __construct($app){
    }
    public function run($req, $res) {
        if($req->method != "POST" && $req->method != "PUT")
            return;
        if($req->header("content-type") == "application/json") {
            $req->body = json_decode($req->body);
        } else
            $req->body = $this->arrayToObject($_POST);
    }

    // http://www.richardcastera.com/blog/php-convert-array-to-object-with-stdclass
    private function arrayToObject($array) {
        if(!is_array($array)) {
            return $array;
        }
        
        $object = new stdClass();
        if (is_array($array) && count($array) > 0) {
          foreach ($array as $name=>$value) {
             $name = strtolower(trim($name));
             if (!empty($name)) {
                $object->$name = $this->arrayToObject($value);
             }
          }
          return $object; 
        }
        else {
          return FALSE;
        }
    }
}
?>