<?php
    
    @session_start();

    /**
    * @package Fabrico\Modules\Middleware
    */
    class Access {
    
        public $credentials;
        public $form;
        public $loginError = "";
        
        private $req;
        private $logged = null;
        
        public function setCredentials($user, $pass) {
            $this->credentials = (object) array("username" => $user, "password" => $pass);
        }
        public function isLogged($req) {
            $this->req = $req;
            if($this->logged !== null) {
                return $this->logged;
            } else {
                $this->form = (object) array("username" => "username", "password" => "password");
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
                    
                    if(isset($this->req->body->$usernameField) && isset($this->req->body->$passwordField)) {
                        if($this->req->body->$usernameField == $this->credentials->username && $this->req->body->$passwordField == $this->credentials->password) {
                            $_SESSION["username"] = $this->req->body->$usernameField;
                            $_SESSION["password"] = $this->req->body->$passwordField;
                            $this->logged = true;
                        } else {
                            $this->logged = false;
                            $this->loginError = "Wrong username or password!";
                        }
                    } else {
                         $this->logged = false;
                    }   
                }
                return $this->logged;
            }
        }
        public function run($req, $res) {
            $this->req = $req;
        }
        public function logout() {
            $_SESSION["username"] = "";
            $_SESSION["password"] = "";
        }
        
    }


?>