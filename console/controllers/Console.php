<?php

    inject(array(
        "utils/view.php",
        "library/ConsoleResponse.php",
        "library/ConsoleUtils.php"
    ));

    class Console {
    
        private $req;
        private $res;
        private $response;
    
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            $this->init($req, $res);
            $res->send(view("layout.html", array(
                "stylesheet" => $req->fabrico->assets->get("css"),
                "javascript" => $req->fabrico->assets->get("javascript"),
                "host" => $req->fabrico->paths->host
            )));
        }
        
        // check if the user is logged with admin account
        private function checkConsoleAvailability($req) {
            return $req->fabrico->access->isLogged($req);
        }
        
        // commands
        public function command($req, $res) {
            $this->init($req, $res);
            if($this->checkConsoleAvailability($req)) {                 
                $this->parseCommand($req->body->command, $req, $res);
            } else {
                $this->response->unauthorized("You must be logged in as administrator to use the Console.");
            }
        }
        private function parseCommand($command, $req, $res) {
            
            $parts = explode(" ", $command);
            $nameOfCommand = $parts[0];
            
            $commandsPath = dirname(__FILE__)."/../library/commands/";
            if(file_exists($commandsPath.$nameOfCommand.".php")) {
                require($commandsPath.$nameOfCommand.".php");
                if(class_exists($nameOfCommand."_command")) {
                    $class = $nameOfCommand."_command";
                    $commandInstance = new $class($command, $this->response, $req, $res);
                    $commandInstance->prepare();
                    $commandInstance->execute();
                } else {
                    $this->response->error("Missing command class (<b>".$nameOfCommand."</b>).");
                }
            } else {
                $this->response->error("Missing command <b>".$nameOfCommand."</b>.");
            }
            
        }
        
        // test command
        public function testCommand($req, $res) {
            if($this->checkConsoleAvailability($req)) { 
                $command = isset($req->params["c"]) ? $req->params["c"] : "";
                if($command != "") {
                    echo "Testing: <strong>".$command."</strong><br />";
                } else {
                    die("use ?c=...");
                }
                $this->init($req, $res);
                $this->parseCommand($command, $req, $res);
            } else {
                $this->response->unauthorized("You must be logged in as administrator to use the Console.");
            }
        }
        
        // update json
        public function updateJSON($req, $res) {
            
            $this->init($req, $res);
        
            $unit = isset($req->body) && isset($req->body->unit) ? $req->body->unit : "";
            $file = isset($req->body) && isset($req->body->file) ? $req->body->file : "";
            $json = isset($req->body) && isset($req->body->json) ? $req->body->json : "";
            
            // check the input params 
            if($unit === "") {
                $this->response("output.error", "Missing unit!");
            }
            if($file === "") {
                $this->response("output.error", "Missing file!");
            }
            if($json === "") {
                $this->response("output.error", "Missing json!");
            }
            
            // check if the json string has valid format
            try {
                
                $jsonObj = json_decode($json);
                if($jsonObj == null) {
                    throw new Exception("Broken json!");
                }
                
                // check if the unit and file exists
                if(file_exists($req->fabrico->paths->root."/../".$unit)) {
                    if(file_exists($req->fabrico->paths->root."/../".$unit."/".$file)) {
                        $fileContent = view("commands/templates/module.php.tpl", array(
                            "moduleName" => str_replace(".php", "", basename($file)),
                            "json" => ConsoleUtils::formatJSON($jsonObj, 2)
                        ));
                        if(file_put_contents($req->fabrico->paths->root."/../".$unit."/".$file, $fileContent) === false) {
                            $this->response("output.error", "Can't write file <strong>".$unit."/".$file."</strong>!");
                        }
                    } else {
                        $this->response("output.error", "File <strong>".$unit."/".$file."</strong> doesn't exists!");
                    }
                } else {
                    $this->response("output.error", "Unit <strong>".$unit."</strong> doesn't exists!");
                }
                
            } catch(Exception $err) {
                $this->response("output.error", "Broken json!");
            }
            
            $this->response("output.success", "Data saved successfully.");
            
        }
        
        // utils
        private function init($req, $res) {
            $this->req = $req;
            $this->res = $res;
            $this->response = new ConsoleResponse($res);
        }
        private function response($operation, $params) {
            $this->response->send(array(
                "queue" => array(
                    array(
                        "operation" => $operation,
                        "params" => $params
                    )
                )
            ));
        }
        
    }

?>