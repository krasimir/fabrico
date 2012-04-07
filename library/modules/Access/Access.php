<?php

    inject(array(
        "modules/Module.php"
    ));
    
    @session_start();

    /**
    * @package Fabrico\Library\Modules
    */
    class Access extends Module {
    
        public $users = array();
        public $form;
        public $loginError = "";
        
        private $req;
        private $title;
        private $logged = null;
        
        public function init($config) {
            $this->users = $config->users;
            $this->title = isset($config->title) ? $config->title : "Login";
        }
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
                                return $this->logged;
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
            if(isset($this->req->params["logout"]) && $this->req->params["logout"] == 1) {
                $this->logout();
            }
            $logged = $this->isLogged($req);
            if(!$logged) {
                ViewConfig::$root = dirname(__FILE__);
                $res->send(view("/views/layout.html", array(
                    "pageTitle" => "Login",
                    "title" => $this->title,
                    "css" => view("/assets/css/0-bootstrap.min.css"),
                    "data" => view("/views/form.html", array(
                        "error" => $this->loginError != "" ? view("/views/errormessage.html", array(
                            "text" => $this->loginError
                        )) : "",
                        "url" => $this->req->fabrico->paths->url
                    ))
                )));
            }
        }
        public function logout() {
            $_SESSION["username"] = "";
            $_SESSION["password"] = "";
        }
        
    }


?>