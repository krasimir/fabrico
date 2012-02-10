<?php
    
    @session_start();

    /**
    * @package Fabrico\Modules\Middleware
    */
    class Access {
    
        public $users = array();
        public $form;
        public $loginError = "";
        
        private $req;
        private $logged = null;
        
        public function isLogged($req) {
            $this->req = $req;
            if($this->logged !== null) {
                return $this->logged;
            } else {
                foreach($this->users as $user) {
                    $credentials = (object) array(
                        "username" => $user->username,
                        "password" => $user->password
                    );
                    $this->form = (object) array("username" => "username", "password" => "password");
                    if(
                        isset($_SESSION["username"]) && 
                        $_SESSION["username"] == $credentials->username && 
                        isset($_SESSION["password"]) && 
                        $_SESSION["password"] == $credentials->password
                    ) {
                        $this->req->fabrico->currentUser = $user;
                        $this->logged = true;
                        return $this->logged;
                    } else {
                    
                        $usernameField = $this->form->username;
                        $passwordField = $this->form->password;
                        
                        if(isset($this->req->body->$usernameField) && isset($this->req->body->$passwordField)) {
                            if($this->req->body->$usernameField == $credentials->username && $this->req->body->$passwordField == $credentials->password) {
                                $_SESSION["username"] = $this->req->body->$usernameField;
                                $_SESSION["password"] = $this->req->body->$passwordField;
                                $this->logged = true;
                                $this->req->fabrico->currentUser = $user;
                            } else {
                                $this->logged = false;
                                $this->loginError = "Wrong username or password!";
                            }
                        } else {
                             $this->logged = false;
                        }   
                    }
                }
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