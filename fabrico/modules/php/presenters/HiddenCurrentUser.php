<?php

    inject("presenters/Presenter.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "currentUser",
        \t"presenter": "presenters/HiddenCurrentUser.php",
        \t"config": {
            \t\t"propertyForListingArea": "username"
        \t}
    }
    </pre>
    * @package Fabrico\Modules\Presenters
    */
    class HiddenCurrentUser extends Text {
        
        public function __toString() {
            return "Hidden";
        }
        public function listing($value) {
            if($value !== "" && $value !== null) {
                if(!isset($this->config) || $this->config === null) {
                    $this->config = (object) array(
                        "propertyForListingArea" => "usertname"
                    );
                }
                $user = json_decode($value);
                $this->setResponse($user->{$this->config->propertyForListingArea});
            } else {
                $this->setResponse("");
            }
            return $this;
        }
        public function add($default = null) {
            $currentUser = json_encode($this->req->fabrico->currentUser);
            $this->setResponse($this->view("view.html", array(
                "field" => $this->name,
                "value" => $currentUser
            )));
            return $this;
        }
        public function edit($value) {
            $this->add();
            return $this;
        }
    
    }
    
?>