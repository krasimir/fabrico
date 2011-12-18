<?php
    
    require_once("actions/Action.php");
    require_once("tools/Signal.php");

    class Adding extends Action {
        
        public function __construct($router) {
            parent::__construct($router);
            $this->events->saved = new Signal($this);
        }
        public function __toString() {
            return "Adding";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $content = "";
            $fields = $this->model->fields;
            
            // storing
            if(isset($req->body) && isset($req->body->action) && $req->body->action == "add") {
                $record = (object) array();
                foreach($fields as $field) {
                    $presenter = $this->getPresenter($field);
                    $record->{$field->name} = $presenter->addAction();
                }
                $id = $this->model->store($record);
                $content = $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $content .= $this->view("result.html", array(
                    "id" => $id,
                    "addNewURL" => $req->fabrico->root->http.$this->controller->url."/adding",
                    "editURL" => $req->fabrico->root->http.$this->controller->url."/editing/".$id
                ));
                $this->events->saved->dispatch(true);
                $this->controller->response($content, $req, $res);
            // displaying the form
            } else {
                foreach($fields as $field) {
                    $presenter = $this->getPresenter($field);
                    $content .= $this->view("row.html", array(
                        "name" => (isset($field->label) ? $field->label : $field->name),
                        "description" => (isset($field->description) ? $field->description : ""),
                        "presenter" => $presenter->add()
                    ));
                }
                $content .= $this->view("row.html", array(
                    "name" => "",
                    "description" => "",
                    "presenter" => $this->view("submit.html")
                ));
                $content = $this->view("form.html", array(
                    "workersContent" => $this->view("table.html", array(
                        "rows" => $content
                    )),
                    "actionURL" => $req->fabrico->root->http.$this->controller->url."/adding"
                ));
                $content = $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                )).$content;
            }
            
            $this->controller->response($content, $req, $res);
            
        }
    
    }

?>