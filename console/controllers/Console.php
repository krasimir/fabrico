<?php

    inject(array(
        "utils/view.php",
        "library/ConsoleResponse.php"
    ));

    class Console {
    
        private $req;
        private $res;
        private $response;
    
        public function __construct($router) {
            
        }
        public function run($req, $res) {
            $this->init($req, $res);
            if($this->checkConsoleAvailability($req)) {
                $res->send(view("layout.html", array(
                    "stylesheet" => $req->fabrico->assets->get("css"),
                    "javascript" => $req->fabrico->assets->get("javascript"),
                    "host" => $req->fabrico->paths->host
                )));
            } else {
                $res->send(view("pleaseLogin.html", array(
                    "stylesheet" => $req->fabrico->assets->get("css"),
                    "host" => $req->fabrico->paths->host
                )));
            }
        }
        
        // check if the user is logged with admin account
        private function checkConsoleAvailability($req) {
            return $req->fabrico->access->isLogged($req) && $req->fabrico->currentUser->type === "admin";
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
        
        // utils
        private function init($req, $res) {
            $this->req = $req;
            $this->res = $res;
            $this->response = new ConsoleResponse($res);
        }
        
    }

?>