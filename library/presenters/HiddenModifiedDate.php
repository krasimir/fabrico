<?php

    inject("presenters/Presenter.php");

    /**
    Definition:
    <pre class="code">
    {
        \t"name": "currentUser",
        \t"presenter": "presenters/HiddenModifiedDate.php"
    }
    </pre>
    * @package Fabrico\Library\Presenters
    */
    class HiddenModifiedDate extends Text {
        
        public function __toString() {
            return "Hidden";
        }
        public function listing($value) {
            if($value !== "" && $value !== null) {
                $this->setResponse($value);
            } else {
                $this->setResponse("");
            }
            return $this;
        }
        public function add($default = null) {
            $date = date("Y-m-d H:i:s");
            $this->setResponse($this->view("view.html", array(
                "field" => $this->name,
                "value" => $date
            )));
            return $this;
        }
        public function edit($value) {
            $this->add();
            return $this;
        }
    
    }
    
?>