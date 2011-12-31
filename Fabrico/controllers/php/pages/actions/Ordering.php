<?php

    inject("actions/Action.php");

    /**
    * @package Fabrico\Controllers\Pages\Actions
    */
    class Ordering extends Action {
        
        public function __construct($router) {
            parent::__construct($router);
        }
        public function __toString() {
            return "Ordering";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $type = $req->params["type"];
            $id = $req->params["id"];
            $items = $this->model->get()->order("position")->desc()->flush();
            
            if($items && isset($type) && isset($id)) {
                $previous = null;
                $next = null;
                $found = false;
                $currentRecord = null;
                foreach($items as $item){
                    if($found && $previous == null) {
                        $previous = $item;
                    }
                    if($item->id == $id) {
                        $found = true;
                        $currentRecord = $item;
                    }
                    if($found == false) {
                        $next = $item;
                    }
                }
                switch($type) {
                    case "up":
                        if($next && $currentRecord) {
                            $position = $currentRecord->position;
                            $currentRecord->position = $next->position;
                            $next->position = $position;
                            $this->model->store($currentRecord);
                            $this->model->store($next);
                        }
                    break;
                    case "down":
                        if($previous && $currentRecord) {
                            $position = $currentRecord->position;
                            $currentRecord->position = $previous->position;
                            $previous->position = $position;
                            $this->model->store($currentRecord);
                            $this->model->store($previous);
                        }
                    break;
                }
            }
            
            header("Location: ".$req->fabrico->root->http.$this->controller->url);
            
        }
    
    }

?>