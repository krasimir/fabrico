<?php

    class Command {
    
        protected $command;
        protected $response;
        protected $req;
        protected $res;
        protected $operations;
        protected $responseQueue;
        
        public function __construct($command, $response, $req, $res) {
        
            $this->command = $command;
            $this->response = $response;
            $this->req = $req;
            $this->res = $res;
            $this->operations = array();
            $this->responseQueue = array();
            
        }
        public function prepare() {
            
        }
        public function execute() {
            foreach($this->operations as $operation) {
                $params = array();
                if($this->match($operation->pattern, $this->command, $params)) {
                    if(method_exists($this, $operation->callback)) {   
                        $this->{$operation->callback}($params);
                        $this->response->send(array(
                            "queue" => $this->responseQueue
                        ));
                        return;
                    } else {
                        $this->response->error("Missing command operation callback (<b>".$operation->callback."</b>).");
                    }
                }
            }
            $this->response->error("Wrong command parameter.");
        }
        protected function addToQueue($operation, $obj = null) {
            $this->responseQueue []= array(
                "operation" => $operation,
                "params" => $obj
            );
        }
        private function match($pattern, $command, &$params) {
        
            $matched = false;
            $regex = "";
            $vars = array();
            $patternParts = preg_split("/ /", $pattern);
            $numOfParts = count($patternParts);
            for($i=0; $i<$numOfParts; $i++) {
                $part = $patternParts[$i];
                if(substr($part, 0, 1) == "@") {
                    $vars []= (object) array(
                        "index" => $i,
                        "name" => str_replace("@", "", $part)
                    );
                    $regex  .= "[a-zA-Z0-9-_]+";
                } else {
                    $regex .= $part;
                }
                $regex .= $i < $numOfParts-1 ? " " : "";
            }
        
            $pattern = str_replace("/", "\/", $regex);
            $result = preg_match("/".$pattern."/", $command);
            
            if($result) {
                if(count($vars) > 0) {
                    $commandParts = preg_split("/ /", $command);
                    $numOfParts = count($commandParts);
                    for($i=0; $i<$numOfParts; $i++) {
                        foreach($vars as $variable) {
                            if($variable->index == $i) {
                                $params[$variable->name] = $commandParts[$i];
                            }
                        }
                    }
                }
                $matched = true;
            } else {
                $matched = false;
            }
            
            return $matched;
            
        }
    }

?>