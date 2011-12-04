<?php
    
    @session_start();

    class Access {
    
        public $credentials;
        public $form;
        public $logged = false;
        public $loginError = "";
        
        public function __construct($router) {
            $router->access = $this;
            $this->form = (object) array("username" => "username", "password" => "password");
        }
        public function run($req, $res) {
            $this->credentials = (object) array("username" => $req->fabrico->config->get("fabrico.access.user"), "password" => $req->fabrico->config->get("fabrico.access.pass"));
            if(
                isset($_SESSION["username"]) && 
                $_SESSION["username"] == $this->credentials->username && 
                isset($_SESSION["password"]) && 
                $_SESSION["password"] == $this->credentials->password
            ) {
                $this->logged = true;
            } else {
            
                $usernameField = $this->form->username;
                $passwordField = $this->form->password;
                
                if(isset($req->body->$usernameField) && isset($req->body->$passwordField)) {
                    if($req->body->$usernameField == $this->credentials->username && $req->body->$passwordField == $this->credentials->password) {
                        $_SESSION["username"] = $req->body->$usernameField;
                        $_SESSION["password"] = $req->body->$passwordField;
                        $this->logged = true;
                    } else {
                        $this->logged = false;
                        $this->loginError = "Wrong username or password!";
                    }
                } else {
                     $this->logged = false;
                }
                
            }
        }
        public function logout() {
            $_SESSION["username"] = "";
            $_SESSION["password"] = "";
        }
        
    }


?>