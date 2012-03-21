<?php

    class ConsoleResponse {
    
        private $res;
    
        public function __construct($res) {
            $this->res = $res;
        }
        public function unauthorized($msg) {
            header('HTTP/1.0 401 Unauthorized', true, 401);
            header("Content-type: text/html");
            $this->end($msg);
        }
        public function error($msg) {
            header('HTTP/1.0 400 Bad Request', true, 400);
            header("Content-type: text/html");
            $this->end($msg);
        }
        public function send($obj) {
            header('HTTP/1.0 200 OK', true, 200);
            header("Content-type: application/json");
            $this->end(json_encode($obj));
        }
        private function end($o) {
            die($o);
        }
        
    }

?>