<?php
    
    inject(array(
        "presenters/Presenter.php",
        "actions/Action.php",
        "tools/Signal.php"
    ));

    /**
    * @package Fabrico\Controllers\Actions
    */
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
                $valid = true;
                $sentData = (object) array();
                if($record) {
                    $record = $record[0];
                    foreach($fields as $field) {
                        $presenter = $this->getPresenter($field);
                        $record->{$field->name} = $presenter->editAction($record->{$field->name})->response->value;
                        $sentData->{$field->name} = (object) array (
                            "value" => $record->{$field->name},
                            "presenterResponse" => $presenter->response
                        );
                        if($valid && !$presenter->response->valid) {
                            $valid = false;
                        }
                    }
                    if($valid) {
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
                    } else {
                        $content .= $this->getForm($req, $res, $sentData);
                    }
                }
            // displaying the form
            } else {
                $content .= $this->getForm($req, $res);
            }
            
            $this->controller->response($content, $req, $res);
            
        }
        private function getForm($req, $res, $sentData = null) {
            $id = $req->params["id"];
            $record = $this->model->get()->where("id=".$id)->flush();
            $content = "";
            $fields = $this->model->fields;
            if($record) {
                $record = $record[0];
                foreach($fields as $field) {
                    $default = $record->{$field->name};
                    $validatorMessage = null;
                    if(isset($sentData) && isset($sentData->{$field->name})) {
                        $default = $sentData->{$field->name}->value;
                        $validatorMessage = !$sentData->{$field->name}->presenterResponse->valid ? $sentData->{$field->name}->presenterResponse->message : null;
                    }
                    $presenter = $this->getPresenter($field);
                    $content .= $this->view("row.html", array(
                        "name" => (isset($field->label) ? $field->label : $field->name),
                        "description" => (isset($field->description) ? $field->description : ""),
                        "presenter" => $presenter->edit($default)->response->value,
                        "validatorMessage" => $validatorMessage !== null ? $this->view("wrongInput.html", array(
                            "text" => $validatorMessage
                        )) : ""
                    ));
                }
                $content .= $this->view("row.html", array(
                    "name" => "",
                    "description" => "",
                    "presenter" => view($this."/submit.html"),
                    "validatorMessage" => ""
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
            return $content;
        }
    
    }

?>