<?php
    
    require_once("workers/Worker.php");
    require_once("actions/Action.php");
    require_once("tools/Signal.php");

    class Editing extends Action {
        
        public function __construct($router) {
            parent::__construct($router->controller);
            $this->fieldsToIgnore []= "id";
            $this->fieldsToIgnore []= "position";
            $this->events->saved = new Signal($this);
        }
        public function __toString() {
            return "Editing";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $content = "";
            $workerProperties = array(
                "controller" => $this->controller,
                "req" => $req,
                "res" => $res
            );
            
            // storing
            if(isset($req->body) && isset($req->body->action) && $req->body->action == "edit") {
                $bean = R::load($this->controller->table, $req->body->id);
                foreach($this->fields as $field => $type) {
                    if(!in_array($field, $this->fieldsToIgnore)) {
                        $worker = WorkerFactory::get($field, $workerProperties);
                        $bean->$field = $worker->editAction($bean->$field);
                    }
                }
                $content = $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $content .= $this->view("result.html", array(
                    "id" => R::store($bean),
                    "editURL" => $req->fabrico->root->http.$this->controller->url."/editing/".$req->body->id,
                    "listURL" => $req->fabrico->root->http.$this->controller->url."/listing/"
                ));
                $this->events->saved->dispatch(true);
                $this->controller->response($content, $req, $res);
            // displaying the form
            } else {
                $id = $req->params["id"];
                $bean = R::load($this->controller->table, $id);
                if($bean->getID() > 0) {
                    foreach($this->fields as $field => $type) {
                        if(!in_array($field, $this->fieldsToIgnore)) {
                            $worker = WorkerFactory::get($field, $workerProperties);
                            $content .= $this->view("row.html", array(
                                "name" => isset($this->fieldsMap[$field]) ? $this->fieldsMap[$field] : $field,
                                "worker" => $worker->edit($bean->$field)
                            ));
                        }
                    }
                    $content .= $this->view("row.html", array(
                        "name" => "",
                        "worker" => view($this."/submit.html")
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
                    $content = $this->view("error.html", array("text" => "Missing record with id = '".$req->params["id"]."'."));
                }
            }
            
            $this->controller->response($content, $req, $res);
            
        }
    
    }

?>