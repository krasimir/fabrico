<?php
    
    require_once("actions/Action.php");
    require_once("workers/Worker.php");
    require_once("tools/Signal.php");

    class Adding extends Action {
        
        public function __construct($router) {
            parent::__construct($router->controller);
            $this->fieldsToIgnore []= "id";
            $this->fieldsToIgnore []= "position";
            $this->events->saved = new Signal($this);
        }
        public function __toString() {
            return "Adding";
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
            if(isset($req->body) && isset($req->body->action) && $req->body->action == "add") {                
                $bean = R::dispense($this->controller->table);
                $maxPosition = R::$adapter->get("SELECT max(position) as value FROM ".$this->controller->table);
                $bean->position = intval(isset($maxPosition) && isset($maxPosition[0]) ? $maxPosition[0]["value"] : 0) + 1;
                foreach($this->fields as $field => $type) {
                    if(!in_array($field, $this->fieldsToIgnore)) {
                        $worker = WorkerFactory::get($field, $workerProperties);
                        $bean->$field = $worker->addAction();
                    }
                }
                $content = $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $id = R::store($bean);
                $content .= $this->view("result.html", array(
                    "id" => $id,
                    "addNewURL" => $req->fabrico->root->http.$this->controller->url."/adding",
                    "editURL" => $req->fabrico->root->http.$this->controller->url."/editing/".$id
                ));
                $this->events->saved->dispatch(true);
                $this->controller->response($content, $req, $res);
            // displaying the form
            } else {
                foreach($this->fields as $field => $type) {
                    if(!in_array($field, $this->fieldsToIgnore)) {
                        $worker = WorkerFactory::get($field, $workerProperties);
                        $content .= $this->view("row.html", array(
                            "name" => isset($this->fieldsMap[$field]) ? $this->fieldsMap[$field] : $field,
                            "worker" => $worker->add()
                        ));
                    }
                }
                $content .= $this->view("row.html", array(
                    "name" => "",
                    "worker" => $this->view("submit.html")
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