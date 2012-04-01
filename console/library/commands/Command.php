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
            $this->operations []= (object) array(
                "pattern" => $this->className()."(.*)?",
                "callback" => "help"
            );
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
        protected function className() {
            return str_replace("_command", "", get_class($this));
        }
        protected function addToQueue($operation, $obj = null) {
            $this->responseQueue []= array(
                "operation" => $operation,
                "params" => $obj
            );
        }
        protected function help() {
            $className = $this->className();
            $helpFile = "/commands/help/".$className.".html";
            $result = "";
            if(file_exists(dirname(__FILE__)."/../../views".$helpFile)) {
                $result = view($helpFile);
            } else {
                $result = "There is no instructions for <strong>".$className."</strong> command.";
            }
            $this->addToQueue("output.info", $result."");
        }
        protected function getDirs($dir, &$result, $infrontOfEveryDir) {
            if ($handle = @opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != ".." && $entry != "library" && $entry != ".git" && $entry != ".svn" && is_dir($dir.$entry)) {
                        $result .= "<li>".$infrontOfEveryDir.str_replace(".php", "", basename($entry))."</li>";
                    }
                }
                closedir($handle);
            }
        }
        protected function getFiles($dir, &$result, $infrontOfEveryFile = "") {
            if ($handle = @opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != ".." && $entry != "library" && $entry != ".git" && $entry != ".svn" && $entry != ".htaccess") {
                        $result .= "<li>".$infrontOfEveryFile.basename($entry)."</li>";
                    }
                }
                closedir($handle);
            }
        }
        protected function formatJSON($jsonObj) {
            $jsonString = stripslashes(json_encode($jsonObj));
            $tabcount = 0;
            $result = '';
            $inquote = false;
            $tab = "      ";
            $newline = "\n";
            for($i = 0; $i < strlen($jsonString); $i++) {
                $char = $jsonString[ $i];
                if($char == '"' && $jsonString[$i-1] != '\\') {
                    $inquote = !$inquote;
                }
                if($inquote) {
                    $result .= $char;
                    continue;
                }
                switch($char) {
                    case '{':
                        if($i) {
                            $result .= $newline;
                        }
                        $result .= str_repeat($tab, $tabcount).$char.$newline.str_repeat($tab, ++$tabcount);
                    break;
                    case '[':
                        $result .= $char;
                        $tabcount += 1;
                    break;
                    case '}':
                        $tabcount = $tabcount-1 > 0 ? $tabcount - 1 : 0;
                        $result .= $newline.str_repeat($tab, $tabcount).$char;
                    break;
                    case ']':
                        $tabcount = $tabcount-1 > 0 ? $tabcount - 1 : 0;
                        $result .= $newline.str_repeat($tab, $tabcount).$char;
                    break;
                    case ',':
                        $result .= $char;
                        if($jsonString[$i+1] != '{') $result .= $newline.str_repeat($tab, $tabcount);
                    break;
                    default:
                        $result .= $char;
                }
            }
            return $result;
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