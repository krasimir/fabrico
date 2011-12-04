<?php

    require_once("actions/Action.php");
    require_once("workers/Worker.php");

    class Listing extends Action {
        
        public function __construct($router) {
            parent::__construct($router->controller);
            $this->fieldsToIgnore []= "id";
            $this->fieldsToIgnore []= "position";
        }
        public function __toString() {
            return "Listing";
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $items = R::getAll("SELECT * FROM ".$this->controller->table." ORDER BY position DESC");
            $numOfItems = count($items);
            $workerProperties = array(
                "controller" => $this->controller,
                "req" => $req,
                "res" => $res
            );
            
            if($numOfItems > 0) {
                
                $tableRows = '';
                
                // adding rows
                foreach($items as $item) {
                    $tableColumns = '';
                    foreach($item as $field => $value) {
                        if(!in_array($field, $this->fieldsToIgnore)) {
                            $worker = WorkerFactory::get($field, $workerProperties);
                            $tableColumns .= $this->view("column.html", array(
                                "data" => $worker ? $worker->listing($value) : $value
                            ));
                        }
                    }
                    $tableColumns .= $this->view("columnOptions.html", array(
                        "id" => $item["id"],
                        "http" => $req->fabrico->root->http.$this->controller->url
                    ));
                    $tableRows .= $this->view("row.html", array(
                        "columns" => $tableColumns
                    ));
                }
                
                $fieldsRow = '';
                $fieldsColumns = '';
                
                // adding table headers
                foreach($this->fields as $field => $type) {
                    if(!in_array($field, $this->fieldsToIgnore)) {
                        $fieldsColumns .= $this->view("column.html", array(
                            "data" => isset($this->fieldsMap[$field]) ? $this->fieldsMap[$field] : $field
                        ));
                    }
                }
                $fieldsColumns .= $this->view("column.html", array(
                    "data" => "Actions"
                ));
                $fieldsRow .= $this->view("rowHeader.html", array(
                    "columns" => $fieldsColumns
                ));
                
                // wrapping everything
                $content = "";
                $content .= $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $content .= $this->view("table.html", array(
                    "rows" => $fieldsRow.$tableRows
                ));
                
                $this->controller->response($content, $req, $res);
                
            } else {
                $content = "";
                $content .= $this->view("subnav.html", array(
                    "http" => $req->fabrico->root->http.$this->controller->url
                ));
                $content .= $this->view("norecords.html");
                $this->controller->response($content, $req, $res);
            }
        }
    
    }

?>