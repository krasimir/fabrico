<?php
    
    require_once("workers/Worker.php");
    require_once("actions/Action.php");

    class Deleting extends Action {
        
        public function __construct($router) {
            parent::__construct($router->controller);
            $this->fieldsToIgnore []= "id";
            $this->fieldsToIgnore []= "position";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $id = $req->params["id"];
            if(isset($id)) {
            
                $workerProperties = array(
                    "controller" => $this->controller,
                    "req" => $req,
                    "res" => $res
                );
                
                $bean = R::load($this->controller->table, $id);
                
                foreach($this->fields as $field => $type) {
                    if(!in_array($field, $this->fieldsToIgnore)) {
                        $worker = WorkerFactory::get($field, $workerProperties);
                        $worker->deleteAction($bean->$field);
                    }
                }
                
                R::trash($bean);
                header("Location: ".$req->fabrico->root->http.$this->controller->url);
            }
            
        }
    
    }

?>