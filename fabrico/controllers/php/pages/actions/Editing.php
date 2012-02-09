<?php
    
    inject(array(
        "presenters/Presenter.php",
        "actions/Action.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages\Actions
    */
    class Editing extends Action {
        
        public function __construct($router) {
            parent::__construct($router);
        }
        public function __toString() {
            return "Editing";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $content = "";
            $fields = $this->model->fields;
            forEachView(array("controllerURL" => $this->controller->url));
            
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
                        if(!$presenter->response->valid) {
                            $hiddenField = isset($req->body->{strtolower($field->name."_hidden")}) ? $req->body->{strtolower($field->name."_hidden")} : null;
                            if($hiddenField === null) {
                                $valid = false;
                            } else if($hiddenField == "no") {
                                $valid = false;
                            }
                        }
                    }
                    if($valid) {
                        $content .= $this->view("subnav.html");
                        $content .= $this->view("result.html", array("id" => $this->model->store($record)));
                        $content .= $this->getForm($req, $res, $sentData);
                        $this->controller->events->ON_EDIT->dispatch((object) array("id" => $record->id));
                    } else {
                        $content .= $this->view("subnav.html");
                        $content .= $this->getForm($req, $res, $sentData);
                    }
                }
            // displaying the form
            } else {
                $content .= $this->view("subnav.html");
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
                    $dependencies = isset($field->dependencies) ? $field->dependencies : null;
                    if(isset($sentData) && isset($sentData->{$field->name})) {
                        $default = $sentData->{$field->name}->value;
                        $validatorMessage = !$sentData->{$field->name}->presenterResponse->valid ? $sentData->{$field->name}->presenterResponse->message : null;
                    }
                    $presenter = $this->getPresenter($field);
                    $content .= $this->view("row.html", array(
                        "name" => (isset($field->label) ? $field->label : $field->name),
                        "field" => $field->name,
                        "description" => (isset($field->description) ? $field->description : ""),
                        "presenter" => $presenter->edit($default)->response->value,
                        "validatorMessage" => $validatorMessage !== null ? $this->view("error.html", array(
                            "text" => $validatorMessage
                        )) : "",
                        "rowClass" => $dependencies !== null ? "has-dependencies" : "no-dependencies"
                    ));
                }
                $content .= view($this."/submit.html");
                $content = $this->view("form.html", array(
                    "presentersContent" => $content,
                    "id" => $id,
                    "fields" => $this->fieldsJson
                ));
                
            } else {
                $content = $this->view("error.html", array("text" => "Missing record with id = '".$id."'."));
            }
            return $content;
        }
    
    }

?>