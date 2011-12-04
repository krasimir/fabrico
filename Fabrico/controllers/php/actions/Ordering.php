<?php

    require_once("actions/Action.php");

    class Ordering extends Action {
        
        public function __construct($router) {
            parent::__construct($router->controller);
        }
        public function __toString() {
            return "Ordering";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $type = $req->params["type"];
            $id = $req->params["id"];
            $beans = R::find($this->controller->table, " 1 ORDER BY position DESC");
            if(isset($beans) && isset($type) && isset($id)) {
                $previous = null;
                $next = null;
                $found = false;
                $currentBean = null;
                foreach($beans as $bean){
                    var_dump($bean->name_Text." - ".$bean->position." - ".$bean->id);
                    if($found && $previous == null) {
                        $previous = $bean;
                    }
                    if($bean->id == $id) {
                        $found = true;
                        $currentBean = $bean;
                    }
                    if($found == false) {
                        $next = $bean;
                    }
                }
                switch($type) {
                    case "up":
                        if($next && $currentBean) {
                            $position = $currentBean->position;
                            $currentBean->position = $next->position;
                            $next->position = $position;
                            R::store($currentBean);
                            R::store($next);
                        }
                    break;
                    case "down":
                        if($previous && $currentBean) {
                            $position = $currentBean->position;
                            $currentBean->position = $previous->position;
                            $previous->position = $position;
                            R::store($currentBean);
                            R::store($previous);
                        }
                    break;
                }
            }
            
            header("Location: ".$req->fabrico->root->http.$this->controller->url);
            
        }
    
    }

?>