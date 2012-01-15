<?php
    
    inject(array(
        "actions/Action.php",
        "utils/Signal.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages\Actions
    */
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
            
            forEachView(array("controllerURL" => $this->controller->url));
            
            // storing
            if(isset($req->body) && isset($req->body->action) && $req->body->action == "add") {
                $record = (object) array();
                $valid = true;
                $sentData = (object) array();
                foreach($fields as $field) {
                    $presenter = $this->getPresenter($field);
                    $record->{$field->name} = $presenter->addAction()->response->value;
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
                    $id = $this->model->store($record);
                    $content = $this->view("subnav.html", array(
                        "controllerURL" => $this->controller->url
                    ));
                    $content .= $this->view("result.html", array("id" => $id));
                    $this->events->saved->dispatch(true);
                    $this->controller->response($content, $req, $res);
                } else {
                    $content .= $this->getForm($req, $res, $sentData);
                }
            // displaying the form
            } else {
                $content .= $this->getForm($req, $res);
            }
            
            $this->controller->response($content, $req, $res);
            
        }
        private function getForm($req, $res, $sentData = null) {
            $content = "";
            $fields = $this->model->fields;
            foreach($fields as $field) {
                $default = $validatorMessage = null;
                $dependencies = isset($field->dependencies) ? $field->dependencies : null;
                if(isset($sentData) && isset($sentData->{$field->name})) {
                    $default =  $sentData->{$field->name}->value;
                    $validatorMessage = !$sentData->{$field->name}->presenterResponse->valid ? $sentData->{$field->name}->presenterResponse->message : null;
                }
                $presenter = $this->getPresenter($field);
                $content .= $this->view("row.html", array(
                    "name" => (isset($field->label) ? $field->label : $field->name),
                    "field" => $field->name,
                    "description" => (isset($field->description) ? $field->description : ""),
                    "presenter" => $presenter->add($default)->response->value,
                    "validatorMessage" => $validatorMessage !== null ? $this->view("wrongInput.html", array(
                        "text" => $validatorMessage
                    )) : "",
                    "rowClass" => $dependencies !== null ? "has-dependencies" : "no-dependencies"
                ));
            }
            $content .= $this->view("row.html", array(
                "name" => "",
                "field" => "",
                "description" => "",
                "presenter" => $this->view("submit.html"),
                "validatorMessage" => "",
                "rowClass" => ""
            ));
            $content = $this->view("form.html", array(
                "presentersContent" => $this->view("table.html", array(
                    "rows" => $content
                )),
                "fields" => json_encode($this->model->fields)
            ));
            $content = $this->view("subnav.html").$content;
            return $content;
        }
    
    }

?>