<?php
    
    require_once("presenters/Presenter.php");
    require_once("actions/Action.php");
    require_once("tools/Signal.php");

    class Editing extends Action {
        
        public function __construct($router) {
            parent::__construct($router);
            $this->events->saved = new Signal($this);
        }
        public function __toString() {
            return "Editing";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $content = "";
            $fields = $this->model->fields;
            
            // storing
            if(isset($req->body) && isset($req->body->action) && $req->body->action == "edit") {
                $record = $this->model->get()->where("id='".$req->body->id."'")->flush();
                if($record) {
                    $record = $record[0];
                    foreach($fields as $field) {
                        $presenter = $this->getPresenter($field);
                        $record->{$field->name} = $presenter->editAction($record->{$field->name});
                    }
                    $content = $this->view("subnav.html", array(
                        "http" => $req->fabrico->root->http.$this->controller->url
                    ));
                    $content .= $this->view("result.html", array(
                        "id" => $this->model->store($record),
                        "editURL" => $req->fabrico->root->http.$this->controller->url."/editing/".$req->body->id,
                        "listURL" => $req->fabrico->root->http.$this->controller->url."/listing/"
                    ));
                    $this->events->saved->dispatch(true);
                    $this->controller->response($content, $req, $res);
                }
            // displaying the form
            } else {
                $id = $req->params["id"];
                $record = $this->model->get()->where("id=".$id)->flush();
                if($record) {
                    $record = $record[0];
                    foreach($fields as $field) {
                        $presenter = $this->getPresenter($field);
                        $content .= $this->view("row.html", array(
                            "name" => (isset($field->label) ? $field->label : $field->name),
                            "description" => (isset($field->description) ? $field->description : ""),
                            "presenter" => $presenter->edit($record->{$field->name})
                        ));
                    }
                    $content .= $this->view("row.html", array(
                        "name" => "",
                        "description" => "",
                        "presenter" => view($this."/submit.html")
                    ));
                    $content = $this->view("form.html", array(
                        "workersContent" => $this->view("table.html", array(
                            "rows" => $content
                        )),
                        "actionURL" => $req->fabrico->root->http.$this->controller->url."/editing/".$id,
                        "id" => $id
                    ));
                    $content = $this->view("subnav.html", array(
                        "http" => $req->fabrico->root->http.$this->controller->url
                    )).$content;
                } else {
                    $content = $this->view("error.html", array("text" => "Missing record with id = '".$id."'."));
                }
            }
            
            $this->controller->response($content, $req, $res);
            
        }
    
    }

?>